import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { teamAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

// Keeps a live socket connection joined to every team the user is in,
// so chat notifications arrive no matter what page they're on.
export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState({}); // { [teamId]: count }
  const [feed, setFeed] = useState([]); // recent notifications, newest first
  const [teams, setTeams] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const teamsRef = useRef([]);

  const clearUnread = useCallback((teamId) => {
    setUnreadCounts((prev) => {
      if (!prev[teamId]) return prev;
      const next = { ...prev };
      delete next[teamId];
      return next;
    });
  }, []);

  // Load the user's teams and keep the socket joined to all of them
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const joinAllTeams = (teamList) => {
      teamList.forEach((t) => socket.emit('join-team', t._id));
    };

    const loadTeams = async () => {
      try {
        const res = await teamAPI.getMyTeams();
        if (cancelled) return;
        const list = res.data.teams || [];
        teamsRef.current = list;
        setTeams(list);
        if (socket.connected) joinAllTeams(list);
      } catch (err) {
        // Silent fail — notifications just won't fire, not critical
      }
    };

    loadTeams();
    const refreshInterval = setInterval(loadTeams, 60000);

    const handleConnect = () => joinAllTeams(teamsRef.current);
    socket.on('connect', handleConnect);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
      socket.off('connect', handleConnect);
    };
  }, [isAuthenticated]);

  // Listen for messages from any team, anywhere in the app
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();

    const handleNewMessage = (msg) => {
      if (msg.sender?._id === user?._id) return; // don't notify yourself

      const onTeamPage = location.pathname === `/teams/${msg.team}`;

      if (!onTeamPage) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.team]: (prev[msg.team] || 0) + 1
        }));
      }

      const team = teamsRef.current.find((t) => t._id === msg.team);
      const preview = msg.content.length > 60 ? msg.content.slice(0, 60) + '…' : msg.content;

      setFeed((prev) => [
        {
          id: msg._id,
          teamId: msg.team,
          teamName: team?.name || 'Team',
          senderName: msg.sender?.name || 'Someone',
          content: msg.content,
          createdAt: msg.createdAt || new Date().toISOString(),
          read: false
        },
        ...prev
      ].slice(0, 50));

      toast(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              navigate(`/teams/${msg.team}`);
            }}
            className="cursor-pointer"
          >
            <p className="font-semibold text-sm text-gray-800">
              💬 {msg.sender?.name || 'Someone'}
              {team ? ` · ${team.name}` : ''}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">{preview}</p>
          </div>
        ),
        { duration: 4000 }
      );
    };

    socket.on('new-message', handleNewMessage);
    return () => socket.off('new-message', handleNewMessage);
  }, [isAuthenticated, user?._id, location.pathname, navigate]);

  const markAllRead = useCallback(() => {
    setFeed((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCounts({});
  }, []);

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

  return (
    <NotificationContext.Provider value={{ unreadCounts, clearUnread, totalUnread, teams, feed, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

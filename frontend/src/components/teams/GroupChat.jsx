import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import { teamAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-rose-500', 'bg-amber-500',
  'bg-emerald-500', 'bg-sky-500', 'bg-violet-500'
];

const colorForUser = (id = '') => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const GroupChat = ({ teamId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load history + set up socket connection
  useEffect(() => {
    if (!teamId) return;

    let isMounted = true;

    const loadHistory = async () => {
      try {
        const res = await teamAPI.getTeamMessages(teamId, 100);
        if (isMounted) setMessages(res.data.messages || []);
      } catch (err) {
        toast.error('Failed to load chat history');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();

    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) socket.connect();

    const handleConnect = () => {
      setConnected(true);
      socket.emit('join-team', teamId);
    };
    const handleDisconnect = () => setConnected(false);

    const handleNewMessage = (msg) => {
      if (msg.team !== teamId) return;
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = ({ userId, name, isTyping }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = name;
        else delete next[userId];
        return next;
      });
    };

    const handleChatError = (msg) => toast.error(msg);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleTyping);
    socket.on('chat-error', handleChatError);

    if (socket.connected) handleConnect();

    return () => {
      isMounted = false;
      socket.emit('leave-team', teamId);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleTyping);
      socket.off('chat-error', handleChatError);
    };
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendTyping = (isTyping) => {
    socketRef.current?.emit('typing', { teamId, isTyping });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;

    socketRef.current?.emit('send-message', { teamId, content });
    setInput('');
    clearTimeout(typingTimeoutRef.current);
    sendTyping(false);
  };

  const typingNames = Object.values(typingUsers).filter(
    (name) => name !== currentUser?.name
  );

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FiMessageCircle className="text-indigo-600" size={20} />
          <h3 className="font-semibold text-gray-800">Project Discussion</h3>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-emerald-600' : 'text-gray-400'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          {connected ? 'Live' : 'Connecting...'}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <FiMessageCircle size={36} className="mb-2 opacity-50" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.sender?._id === currentUser?._id;
              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${colorForUser(msg.sender?._id)}`}
                  >
                    {msg.sender?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isOwn && (
                      <span className="text-xs font-medium text-gray-500 mb-0.5 px-1">
                        {msg.sender?.name || 'Unknown'}
                      </span>
                    )}
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[11px] text-gray-400 mt-0.5 px-1">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div className="h-5 px-5 text-xs text-gray-400 italic">
        {typingNames.length > 0 &&
          `${typingNames.join(', ')} ${typingNames.length > 1 ? 'are' : 'is'} typing...`}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Message your team..."
          maxLength={2000}
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          <FiSend size={16} />
        </button>
      </form>
    </div>
  );
};

export default GroupChat;

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMessageCircle, FiCheckCircle, FiBell } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Notifications = () => {
  const { feed, markAllRead, unreadCounts } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-gray-500 mt-1">Recent activity across your teams</p>
          </div>
          {feed.length > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm"
            >
              <FiCheckCircle size={16} />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FiBell size={40} className="mb-3 opacity-50" />
              <p className="text-sm">No notifications yet.</p>
              <p className="text-xs mt-1">Group chat messages from your teams will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {feed.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                  onClick={() => navigate(`/teams/${n.teamId}`)}
                  className={`w-full text-left flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${
                    !n.read ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <FiMessageCircle size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{n.senderName}</span> in{' '}
                      <span className="font-medium text-indigo-600">{n.teamName}</span>
                    </p>
                    <p className="text-sm text-gray-500 truncate">{n.content}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;

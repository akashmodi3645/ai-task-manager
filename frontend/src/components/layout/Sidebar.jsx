import { NavLink, Link } from 'react-router-dom';
import { FiHome, FiCheckSquare, FiUsers, FiX } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { totalUnread } = useNotifications();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
    { path: '/teams', icon: FiUsers, label: 'Teams' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 pt-16 transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 lg:hidden">
          <span className="font-bold text-indigo-600">Menu</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        <nav className="px-4 pt-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </span>
              {item.path === '/teams' && totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

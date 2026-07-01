import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { FiMenu, FiBell, FiLogOut } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { totalUnread } = useNotifications();

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <span className="ml-2 text-xl font-bold text-indigo-600">
              AI Task Manager
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 text-gray-600 rounded-lg hover:bg-gray-100">
              <FiBell className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </Link>
            <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name}
              </span>
            </Link>
            <button
              onClick={logout}
              className="p-2 text-red-600 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

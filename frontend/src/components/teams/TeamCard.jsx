import { useNavigate } from 'react-router-dom';
import { FiUsers, FiCheckCircle, FiClock, FiMessageCircle } from 'react-icons/fi';
import Tilt3D from '../common/Tilt3D';

const TeamCard = ({ team, unreadCount = 0 }) => {
  const navigate = useNavigate();

  return (
    <Tilt3D
      intensity={8}
      onClick={() => navigate(`/teams/${team._id}`)}
      className="relative bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500"
    >
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          <FiMessageCircle size={12} />
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
          <FiUsers className="w-6 h-6 text-indigo-600" />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <FiUsers className="w-4 h-4" />
          {team.members?.length || 0} members
        </span>
        <span className="flex items-center gap-1">
          <FiCheckCircle className="w-4 h-4 text-emerald-600" />
          Tasks
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Owner: <span className="font-medium text-gray-700">{team.owner?.name}</span>
        </p>
      </div>
    </Tilt3D>
  );
};

export default TeamCard;

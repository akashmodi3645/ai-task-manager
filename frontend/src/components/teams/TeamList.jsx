import { useState, useEffect } from 'react';
import { teamAPI } from '../../services/api';
import CreateTeam from './CreateTeam';
import TeamCard from './TeamCard';
import toast from 'react-hot-toast';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { unreadCounts } = useNotifications();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await teamAPI.getMyTeams();
      setTeams(data.teams);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Teams</h1>
          <p className="text-gray-600 mt-1">Collaborate and manage tasks together</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No teams yet</h3>
          <p className="text-gray-600 mb-4">Create your first team to start collaborating!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <TeamCard key={team._id} team={team} onUpdate={fetchTeams} unreadCount={unreadCounts[team._id] || 0} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTeam
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchTeams}
        />
      )}
    </div>
  );
};

export default TeamList;

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { teamAPI } from '../../services/api';
import TaskAssignment from './TaskAssignment';
import InviteMember from './InviteMember';
import JitsiMeetingComponent from './JitsiMeeting';
import GroupChat from './GroupChat';
import { useNotifications } from '../../context/NotificationContext';
import toast from 'react-hot-toast';
import { FiUsers, FiTarget, FiCheckCircle, FiClock, FiUserPlus, FiUserX, FiZap, FiPlus, FiX, FiVideo, FiMessageCircle, FiGrid } from 'react-icons/fi';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'meetings', label: 'Meetings', icon: FiVideo },
  { id: 'chat', label: 'Chat', icon: FiMessageCircle }
];

const TeamDashboard = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  
  // Video Meeting States
  const [inMeeting, setInMeeting] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [activeMeetings, setActiveMeetings] = useState([]);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const { unreadCounts, clearUnread } = useNotifications();
  const chatUnread = unreadCounts[id] || 0;

  useEffect(() => {
    fetchData();
  }, [id]);

  // Visiting a team clears its unread chat badge
  useEffect(() => {
    if (id) clearUnread(id);
  }, [id, clearUnread]);

  useEffect(() => {
    if (team) {
      fetchActiveMeetings();
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchActiveMeetings, 10000);
      return () => clearInterval(interval);
    }
  }, [team]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamRes, dashboardRes, tasksRes] = await Promise.all([
        teamAPI.getTeamById(id),
        teamAPI.getTeamDashboard(id),
        teamAPI.getTeamTasks(id)
      ]);

      setTeam(teamRes.data.team);
      setDashboard(dashboardRes.data);
      setTasks(tasksRes.data.tasks);
    } catch (error) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMeetings = async () => {
    try {
      const response = await teamAPI.getTeamMeetings(id);
      setActiveMeetings(response.data.meetings || []);
      console.log('📋 Active meetings:', response.data.meetings);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    }
  };

  // Video Meeting Functions
  const startMeeting = async () => {
    try {
      setIsCreatingMeeting(true);
      console.log('🎥 Starting meeting for team:', id);
      
      const response = await teamAPI.createMeeting(id);
      console.log('✅ Meeting created:', response.data);
      
      setMeetingUrl(response.data.roomUrl);
      setInMeeting(true);
      fetchActiveMeetings();
      toast.success('Meeting started! 🎥');
    } catch (error) {
      console.error('❌ Failed to start meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to start meeting');
    } finally {
      setIsCreatingMeeting(false);
    }
  };

  const joinMeeting = (meetingData) => {
    console.log('🎥 Joining meeting:', meetingData);
    setMeetingUrl(meetingData.roomUrl);
    setInMeeting(true);
    toast.success('Joining meeting! 🎥');
  };

  // ✅ MOVED endMeeting INSIDE COMPONENT
  const endMeeting = async (meetingId) => {
    try {
      console.log('🔴 Ending meeting:', meetingId);
      
      const response = await teamAPI.endMeeting(id, meetingId);
      console.log('✅ Meeting ended:', response.data);
      
      // Refresh active meetings
      fetchActiveMeetings();
      
      toast.success('Meeting ended! 🔴');
    } catch (error) {
      console.error('❌ Failed to end meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to end meeting');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the team?`)) return;
    try {
      await teamAPI.removeMember(id, memberId);
      toast.success(`${memberName} removed from the team`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const leaveMeeting = () => {
    setInMeeting(false);
    setMeetingUrl('');
    fetchActiveMeetings();
    toast.success('Left meeting 👋');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{team?.name}</h1>
            <p className="text-gray-600 mt-1">{team?.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Owner: <span className="font-medium">{team?.owner?.name}</span>
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={startMeeting}
              disabled={isCreatingMeeting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <FiVideo size={18} />
              {isCreatingMeeting ? 'Starting...' : 'Video Call'}
            </button>

            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiPlus />
              Create Task
            </button>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiUserPlus />
              Invite
            </button>

            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <FiZap />
              AI Assign
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-6 border-t border-gray-100 pt-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'meetings' && activeMeetings.length > 0 && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500" />
                )}
                {tab.id === 'chat' && chatUnread > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'meetings' && (
      <>
      {/* ✅ UPDATED Active Meetings with End Button */}
      {activeMeetings.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
              🎥 Active Meetings
            </h3>
            <span className="text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              {activeMeetings.length} ongoing
            </span>
          </div>
          
          <div className="space-y-3">
            {activeMeetings.map((meeting, index) => {
              // Check if current user is the meeting creator or team owner
              const isCreator = meeting.createdBy?._id === user?._id;
              const isOwner = team?.owner?._id === user?._id;
              const canEnd = isCreator || isOwner;
              
              return (
                <div 
                  key={meeting._id || index}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    {/* Meeting Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Meeting Room {index + 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          Started by {meeting.createdBy?.name || 'Team member'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          👥 {meeting.participants?.length || 0} participants
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Join Button */}
                      <button
                        onClick={() => joinMeeting(meeting)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                      >
                        <FiVideo size={16} />
                        Join
                      </button>
                      
                      {/* End Button (Only for creator/owner) */}
                      {canEnd && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to end this meeting?')) {
                              endMeeting(meeting._id);
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                          title="End meeting"
                        >
                          <FiX size={16} />
                          End
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FiVideo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No active meetings right now.</p>
          <button
            onClick={startMeeting}
            disabled={isCreatingMeeting}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50"
          >
            {isCreatingMeeting ? 'Starting...' : 'Start a Video Call'}
          </button>
        </div>
      )}
      </>
      )}

      {activeTab === 'chat' && (
        <GroupChat teamId={id} currentUser={user} />
      )}

      {activeTab === 'overview' && (
      <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-800">{dashboard?.team?.memberCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiTarget className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{dashboard?.stats?.totalTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{dashboard?.stats?.completedTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{dashboard?.stats?.pendingTasks || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Member Workload */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Team Member Workload</h2>
        <div className="space-y-4">
          {dashboard?.memberStats?.map((member, idx) => {
            const isOwner = team?.owner?._id === member.userId;
            const canRemove = team?.owner?._id === user?._id && !isOwner;
            return (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                    {member.name}
                    {isOwner && <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Owner</span>}
                  </p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                  {member.assigned} Active
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  {member.completed} Done
                </span>
                {canRemove && (
                  <button
                    onClick={() => handleRemoveMember(member.userId, member.name)}
                    title="Remove member"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiUserX size={16} />
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Team Tasks */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Team Tasks</h2>
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <FiTarget className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No tasks yet. Create one to get started!</p>
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-2 text-sm">
                      <span className={`px-2 py-1 rounded ${
                        task.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                      {task.assignedTo && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          👤 {task.assignedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    task.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </>
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteMember
          teamId={id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showAssignModal && (
        <TaskAssignment
          teamId={id}
          team={team}
          tasks={tasks}
          onClose={() => setShowAssignModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showCreateTaskModal && (
        <QuickTaskModal
          teamId={id}
          onClose={() => setShowCreateTaskModal(false)}
          onSuccess={fetchData}
        />
      )}

      {/* Video Meeting Component */}
      {inMeeting && (
        <JitsiMeetingComponent
          roomName={meetingUrl ? meetingUrl.split('/').pop() : `team-${id}-meeting`}
          userName={user?.name || 'Guest'}
          onLeave={leaveMeeting}
        />
      )}
    </div>
  );
};

// Quick Task Creation Modal
const QuickTaskModal = ({ teamId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Work',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        team: teamId
      };

      if (formData.dueDate) {
        taskData.dueDate = formData.dueDate;
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(taskData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task');
      }

      toast.success('Team task created! 🎉');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('❌ Error creating task:', error);
      toast.error(error.message || 'Failed to create task');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiPlus className="text-blue-600" />
            Create Team Task
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Design Database Schema"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              placeholder="Add task details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamDashboard;

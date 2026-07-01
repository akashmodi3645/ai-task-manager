import { useState } from 'react';
import { teamAPI, taskAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiZap, FiX, FiUser } from 'react-icons/fi';

const TaskAssignment = ({ teamId, team, tasks, onClose, onSuccess }) => {
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get unassigned tasks
  const unassignedTasks = tasks.filter(t => !t.assignedTo && !t.isCompleted);

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (useAI) {
        // AI-powered assignment
        const { data } = await teamAPI.assignTaskWithAI({
          taskId: selectedTask,
          teamId
        });
        toast.success(data.message);
      } else {
        // Manual assignment
        const { data } = await teamAPI.assignTask({
          taskId: selectedTask,
          userId: selectedMember,
          teamId
        });
        toast.success(data.message);
      }
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiZap className="text-purple-600" />
            Assign Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {unassignedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No unassigned tasks available</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task *
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Choose a task...</option>
                {unassignedTasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title} ({task.priority})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="useAI" className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <FiZap className="text-purple-600" />
                Use AI to auto-assign (based on workload)
              </label>
            </div>

            {!useAI && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required={!useAI}
                >
                  <option value="">Choose a member...</option>
                  {team?.members?.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name} ({member.role}) - {member.workload} active tasks
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedTask || (!useAI && !selectedMember)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Assigning...' : useAI ? '🤖 AI Assign' : 'Assign Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TaskAssignment;

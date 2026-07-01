import { useState } from 'react';
import { teamAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiX, FiUserPlus } from 'react-icons/fi';

const InviteMember = ({ teamId, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);

    try {
      console.log('📧 Inviting member:', email);
      console.log('Team ID:', teamId);

      const response = await teamAPI.inviteMember(teamId, { email });
      
      console.log('✅ Response:', response);

      toast.success(response.data.message || 'Member invited successfully! 🎉');
      
      setEmail('');
      onSuccess?.();
      
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('❌ Invite error:', error);
      
      const message = error.response?.data?.message || 'Failed to invite member';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiUserPlus className="text-blue-600" />
            Invite Team Member
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="member@example.com"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              User must be registered to receive invitation
            </p>
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
              disabled={loading || !email}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Inviting...
                </>
              ) : (
                <>
                  <FiUserPlus />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMember;

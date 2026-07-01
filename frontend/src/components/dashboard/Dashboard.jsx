import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '../../services/api';
import StatsCard from './StatsCard';
import ProductivityChart from './ProductivityChart';
import CategoryChart from './CategoryChart';
import PriorityChart from './PriorityChart';
import { FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Listen for task updates
  useEffect(() => {
    const handleTaskUpdate = () => {
      console.log('📊 Task updated, refreshing dashboard...');
      fetchDashboardData();
    };
    
    window.addEventListener('taskUpdated', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate);
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard stats
      const { data: statsData } = await analyticsAPI.getDashboardStats();
      setStats(statsData);

      // Fetch productivity trends
      const { data: trendsData } = await analyticsAPI.getProductivityTrends(7);
      setTrends(trendsData.trends || []);

      console.log('📊 Dashboard data loaded:', statsData);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Your productivity overview</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm font-medium"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tasks"
            value={stats?.totalTasks || 0}
            icon={<FiClock />}
            color="blue"
            subtitle={`${stats?.completionRate || 0}% completion rate`}
            delay={0}
          />
          <StatsCard
            title="Completed"
            value={stats?.completedTasks || 0}
            icon={<FiCheckCircle />}
            color="green"
            subtitle="Tasks finished"
            delay={0.05}
          />
          <StatsCard
            title="Pending"
            value={stats?.pendingTasks || 0}
            icon={<FiClock />}
            color="yellow"
            subtitle="In progress"
            delay={0.1}
          />
          <StatsCard
            title="Overdue"
            value={stats?.overdueTasks || 0}
            icon={<FiAlertCircle />}
            color="red"
            subtitle="Need attention"
            delay={0.15}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FiTrendingUp className="text-indigo-600" />
              Productivity Trend (Last 7 Days)
            </h3>
            <ProductivityChart data={trends} />
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              📊 Priority Distribution
            </h3>
            <PriorityChart data={stats?.priorityDistribution || []} />
          </motion.div>
        </div>

        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            📂 Tasks by Category
          </h3>
          <CategoryChart data={stats?.categoryDistribution || []} />
        </motion.div>

        {/* Productivity Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <h3 className="text-lg font-semibold mb-6 text-gray-800 text-center">
            ⚡ Your Productivity Score
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle
                  className="text-gray-100 stroke-current"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                />
                <circle
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  className="transition-all duration-1000"
                  strokeDasharray={`${((stats?.productivityScore || 0) / 100) * 251} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">
                  {stats?.productivityScore || 0}
                </span>
                <span className="text-sm text-gray-400">Score</span>
              </div>
            </div>
          </div>
          <p className="text-center mt-5 text-gray-600 font-medium">
            {stats?.productivityScore >= 80 ? '🔥 Excellent! Keep it up!' :
             stats?.productivityScore >= 60 ? '💪 Good progress!' :
             stats?.productivityScore >= 40 ? '📈 You\'re improving!' :
             '🎯 Let\'s boost your productivity!'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

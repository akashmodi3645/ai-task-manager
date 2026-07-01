import Task from '../models/Task.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ 
      user: userId, 
      isCompleted: true 
    });
    const pendingTasks = await Task.countDocuments({ 
      user: userId, 
      isCompleted: false 
    });
    
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      user: userId,
      dueDate: { $lt: now },
      isCompleted: false
    });

    const priorityDistribution = await Task.aggregate([
      { $match: { user: userId, isCompleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const categoryDistribution = await Task.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const completionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(1) 
      : 0;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentCompletions = await Task.find({
      user: userId,
      isCompleted: true,
      completedAt: { $gte: last7Days }
    }).sort({ completedAt: -1 });

    const productivityScore = calculateProductivityScore(
      completedTasks,
      overdueTasks,
      recentCompletions.length
    );

    await User.findByIdAndUpdate(userId, { productivityScore });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: parseFloat(completionRate),
      productivityScore,
      priorityDistribution,
      categoryDistribution,
      recentCompletions: recentCompletions.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductivityTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    console.log(`📈 Fetching trends for last ${days} days`);

    const completedTasks = await Task.aggregate([
      {
        $match: {
          user: userId,
          isCompleted: true,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing dates with 0
    const trends = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const existing = completedTasks.find(t => t._id === dateStr);
      trends.push({
        _id: dateStr,
        count: existing ? existing.count : 0
      });
    }

    console.log('✅ Trends data:', trends);
    res.json({ trends });
  } catch (error) {
    console.error('❌ Trends error:', error);
    res.status(500).json({ message: error.message });
  }
};


const calculateProductivityScore = (completed, overdue, recentCompletions) => {
  let score = 0;
  
  score += completed * 5;
  score -= overdue * 10;
  score += recentCompletions * 8;
  
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
};

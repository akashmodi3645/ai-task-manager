import Task from '../models/Task.js';

export const checkOverdueTasks = async () => {
  try {
    const now = new Date();
    
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      isCompleted: false,
      reminderSent: false
    }).populate('user', 'email name');

    for (const task of overdueTasks) {
      console.log(`⚠️ Overdue task for ${task.user.name}: ${task.title}`);
      
      task.reminderSent = true;
      await task.save();
    }

    return overdueTasks.length;
  } catch (error) {
    console.error('Notification service error:', error);
  }
};

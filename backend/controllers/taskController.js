import Task from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    const { status, priority, category, search, sortBy = 'dueDate' } = req.query;
    
    let query = { user: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query).sort(sortBy);
    
    res.json({ tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      priority, 
      category, 
      dueDate, 
      dueTime,
      team  // 🔥 MUST RECEIVE THIS
    } = req.body;

    console.log('📝 CREATE TASK REQUEST:');
    console.log('Title:', title);
    console.log('Team:', team);
    console.log('User:', req.user._id);

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // 🔥 Build task data object
    const taskData = {
      title,
      description: description || '',
      priority: priority || 'Medium',
      category: category || 'Work',
      user: req.user._id,
      status: 'Pending',
      isCompleted: false
    };

    // 🔥 CRITICAL - Add team if provided
    if (team) {
      taskData.team = team;
      console.log('✅ Team field SET:', team);
    } else {
      console.log('⚠️ WARNING: No team field provided');
    }

    if (dueDate) taskData.dueDate = dueDate;
    if (dueTime) taskData.dueTime = dueTime;

    console.log('📦 Task data to save:', taskData);

    // 🔥 Create task in database
    const task = await Task.create(taskData);
    
    console.log('✅ Task saved successfully');
    console.log('Task ID:', task._id);
    console.log('Task team field:', task.team);

    res.status(201).json({
      message: 'Task created successfully! 🎉',
      task
    });
  } catch (error) {
    console.error('❌ Create task error:', error);
    res.status(500).json({ message: error.message });
  }
};



export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleTaskComplete = async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;
    task.status = task.isCompleted ? 'Completed' : 'Pending';

    await task.save();

    res.json({ message: 'Task updated', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTodayTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $gte: today, $lt: tomorrow }
    }).sort('priority');

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();
    
    const tasks = await Task.find({
      user: req.user._id,
      dueDate: { $lt: now },
      isCompleted: false
    }).sort('dueDate');

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

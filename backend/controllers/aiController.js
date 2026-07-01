import OpenAI from 'openai';
import Task from '../models/Task.js';
import {
  parseTaskFromText,
  analyzeTaskWithAI,
  getPrioritySuggestionsAI,
  getDailySummaryAI,
  getTimeBlockScheduleAI
} from '../services/aiService.js';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// 🔥 SMART LOCAL AI LOGIC (No API needed)
function generateLocalAnalysis(task) {
  const title = task.title.toLowerCase();
  const description = (task.description || '').toLowerCase();
  const category = task.category;
  const priority = task.priority;

  // Time estimation based on keywords
  let timeEstimate = '1-2 hours';
  let timeBreakdown = {
    preparation: '15 min',
    execution: '1 hour',
    review: '15 min'
  };

  if (title.includes('quick') || title.includes('small') || title.includes('simple')) {
    timeEstimate = '15-30 minutes';
    timeBreakdown = { preparation: '5 min', execution: '20 min', review: '5 min' };
  } else if (title.includes('assignment') || title.includes('project') || title.includes('report')) {
    timeEstimate = '2-4 hours';
    timeBreakdown = { preparation: '30 min', execution: '2.5 hours', review: '30 min' };
  } else if (title.includes('read') || title.includes('study') || title.includes('learn')) {
    timeEstimate = '1-2 hours';
    timeBreakdown = { preparation: '10 min', execution: '1.5 hours', review: '10 min' };
  } else if (title.includes('write') || title.includes('code') || title.includes('develop')) {
    timeEstimate = '2-3 hours';
    timeBreakdown = { preparation: '20 min', execution: '2 hours', review: '20 min' };
  } else if (title.includes('meeting') || title.includes('call')) {
    timeEstimate = '30-60 minutes';
    timeBreakdown = { preparation: '10 min', execution: '30 min', review: '10 min' };
  }

  // Difficulty estimation
  let difficulty = 'Medium';
  let difficultyReason = 'Standard task requiring moderate effort';

  if (priority === 'Urgent' || title.includes('complex') || title.includes('difficult') || title.includes('advanced')) {
    difficulty = 'Hard';
    difficultyReason = 'High priority and complexity requires focused attention and expertise';
  } else if (title.includes('easy') || title.includes('simple') || priority === 'Low' || category === 'Personal') {
    difficulty = 'Easy';
    difficultyReason = 'Straightforward task with clear steps and minimal complexity';
  }

  // Smart steps generation
  const steps = generateSteps(title, category, description);

  // Best time suggestion
  let bestTime = 'Morning (9 AM - 12 PM) - Peak productivity hours';
  let focusRequired = 'Medium';

  if (difficulty === 'Hard' || category === 'Work' || category === 'Study') {
    bestTime = 'Morning (9 AM - 12 PM) - Your brain is freshest for deep work';
    focusRequired = 'High';
  } else if (category === 'Personal' || category === 'Shopping' || category === 'Health') {
    bestTime = 'Afternoon or Evening (2 PM - 6 PM) - Flexible timing works best';
    focusRequired = 'Low';
  } else if (title.includes('creative') || title.includes('design')) {
    bestTime = 'Late morning or after breaks (10 AM - 1 PM) - When creativity flows';
    focusRequired = 'Medium';
  }

  // Prerequisites
  const prerequisites = generatePrerequisites(title, category);

  // Tips
  const tips = generateTips(title, category, difficulty);

  // Potential blockers
  const potentialBlockers = generateBlockers(title, category, difficulty);

  // Motivation
  const motivation = getMotivation(difficulty, priority);

  return {
    timeEstimate,
    timeBreakdown,
    difficulty,
    difficultyReason,
    steps,
    prerequisites,
    tips,
    bestTime,
    focusRequired,
    potentialBlockers,
    motivation
  };
}

function generateSteps(title, category, description) {
  const steps = [];
  
  if (category === 'Study' || title.includes('study') || title.includes('learn')) {
    steps.push('📖 Review the topic and gather study materials (textbooks, notes, online resources)');
    steps.push('📝 Create structured notes highlighting key concepts and definitions');
    steps.push('✍️ Practice problems, exercises, or sample questions');
    steps.push('🔍 Review difficult areas and clarify doubts through research or asking');
    steps.push('📊 Self-test to ensure understanding and retention');
  } else if (category === 'Work' || title.includes('work') || title.includes('task')) {
    steps.push('📋 Break down the task into clear, actionable subtasks');
    steps.push('⚙️ Set up your workspace with necessary tools and resources');
    steps.push('🚀 Execute the main work systematically, starting with critical parts');
    steps.push('✅ Review output for quality and completeness');
    steps.push('📤 Submit or share the completed work');
  } else if (title.includes('assignment')) {
    steps.push('📚 Read and understand all assignment requirements carefully');
    steps.push('🔍 Research and collect relevant information from reliable sources');
    steps.push('📝 Create an outline or structure for your assignment');
    steps.push('✍️ Write/complete the assignment section by section');
    steps.push('🔎 Proofread, edit, and ensure proper formatting before submission');
  } else if (title.includes('code') || title.includes('program') || title.includes('develop')) {
    steps.push('💡 Understand requirements and plan the solution approach');
    steps.push('📐 Design the algorithm or system architecture');
    steps.push('⌨️ Write clean, well-documented code');
    steps.push('🧪 Test with various inputs including edge cases');
    steps.push('🐛 Debug issues and optimize for performance');
  } else if (title.includes('meeting') || title.includes('call')) {
    steps.push('📋 Prepare agenda and key discussion points');
    steps.push('📝 Review relevant documents or information beforehand');
    steps.push('🎯 Attend meeting and actively participate');
    steps.push('📌 Take notes on action items and decisions');
    steps.push('✅ Follow up on assigned tasks or next steps');
  } else {
    steps.push(`🎯 Clearly define the objective: ${title}`);
    steps.push('📋 List out all required resources and information');
    steps.push('⚡ Start with the most important or challenging part');
    steps.push('📊 Monitor progress and adjust approach if needed');
    steps.push('✅ Complete, verify, and document the final outcome');
  }

  return steps;
}

function generatePrerequisites(title, category) {
  const prereqs = [];
  
  if (category === 'Study') {
    prereqs.push('📚 Textbooks, class notes, or online course materials');
    prereqs.push('🖊️ Notebook and writing materials for taking notes');
    prereqs.push('💻 Laptop or computer for research and digital resources');
    prereqs.push('🎧 Quiet study environment or noise-canceling headphones');
  } else if (category === 'Work') {
    prereqs.push('💻 Computer/laptop with required software installed');
    prereqs.push('📁 Access to necessary files, documents, and project resources');
    prereqs.push('🌐 Stable internet connection for collaboration tools');
    prereqs.push('📧 Communication channels available (email, Slack, Teams, etc.)');
  } else if (title.includes('shop') || title.includes('buy') || category === 'Shopping') {
    prereqs.push('💳 Payment method (cash, card, or digital wallet)');
    prereqs.push('📝 Shopping list with items and quantities');
    prereqs.push('🚗 Transportation arrangement if needed');
    prereqs.push('📱 Phone for comparing prices or checking reviews');
  } else if (title.includes('exercise') || title.includes('workout') || category === 'Health') {
    prereqs.push('👟 Appropriate workout clothing and shoes');
    prereqs.push('💧 Water bottle to stay hydrated');
    prereqs.push('⏱️ Timer or fitness tracking app');
    prereqs.push('🎵 Motivating music playlist (optional)');
  } else {
    prereqs.push('⏰ Dedicated, uninterrupted time block');
    prereqs.push('🎧 Quiet environment or focus-enhancing background music');
    prereqs.push('☕ Water, coffee, or healthy snacks for energy');
    prereqs.push('📱 Phone on silent mode to minimize distractions');
  }

  return prereqs;
}

function generateTips(title, category, difficulty) {
  const tips = [];
  
  // Universal tips
  tips.push('🎯 Eliminate all distractions - put phone on silent, close unnecessary tabs');
  tips.push('⏰ Use the Pomodoro Technique: 25 minutes of focused work, 5 minute break');
  
  if (difficulty === 'Hard') {
    tips.push('🧩 Break this challenging task into even smaller milestones');
    tips.push('🤝 Don\'t hesitate to ask for help or clarification if you get stuck');
    tips.push('🎉 Celebrate small wins along the way to stay motivated');
  } else if (difficulty === 'Easy') {
    tips.push('🎵 Light background music can make routine tasks more enjoyable');
    tips.push('✨ Use this as a warm-up task before tackling harder challenges');
  } else {
    tips.push('📊 Track your progress visually - check off completed parts');
    tips.push('🔄 If stuck, take a short break and return with fresh perspective');
  }

  if (category === 'Study') {
    tips.push('📝 Active recall is better than passive reading - test yourself regularly');
    tips.push('🗣️ Teach the concept to someone else (or yourself) to deepen understanding');
    tips.push('🎨 Use diagrams, mind maps, or color coding to organize information');
  } else if (category === 'Work') {
    tips.push('📧 Batch similar tasks together for better efficiency');
    tips.push('⚡ Do the hardest or most important task first when energy is highest');
  }

  return tips;
}

function generateBlockers(title, category, difficulty) {
  const blockers = [];
  
  // Common blockers
  blockers.push('📱 Phone notifications and social media temptation');
  
  if (category === 'Study' || category === 'Work') {
    blockers.push('🤔 Lack of clarity on requirements or expectations');
    blockers.push('😴 Mental fatigue or physical tiredness');
    blockers.push('📚 Missing information or resources needed to proceed');
  }
  
  if (difficulty === 'Hard') {
    blockers.push('🧠 Complex concepts that need extra time to understand');
    blockers.push('⏰ Time pressure creating anxiety and reducing focus');
  }
  
  blockers.push('🎯 Perfectionism leading to procrastination');
  blockers.push('🔊 Noisy environment or frequent interruptions');

  return blockers;
}

function getMotivation(difficulty, priority) {
  if (difficulty === 'Hard' && priority === 'Urgent') {
    return 'This is tough but urgent! You\'ve handled challenges before. Break it down, stay focused, and you\'ll conquer this! 💪🔥';
  } else if (difficulty === 'Hard') {
    return 'Challenge accepted! 🚀 This will push your limits, but that\'s how you grow. Take it step by step, and you\'ll get there!';
  } else if (difficulty === 'Easy') {
    return 'Quick win incoming! 🎯 This is your warm-up task. Knock it out and build momentum for the day!';
  } else if (priority === 'Urgent') {
    return 'Time to shine! ⚡ Focus mode activated. You know what to do - let\'s get this done!';
  } else {
    return 'You\'ve got this! 💪 Stay focused, take breaks when needed, and trust the process. Success is just ahead!';
  }
}

// 🔥 MAIN FUNCTIONS

export const parseNaturalLanguageTask = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: 'Input text is required' });
    }

    console.log('🤖 AI Parse request:', input);

    let taskData;
    let usedAI = false;

    try {
      const parsed = await parseTaskFromText(input);
      if (parsed) {
        taskData = {
          title: parsed.title || input,
          description: parsed.description || '',
          priority: parsed.priority || detectPriority(input),
          category: parsed.category || detectCategory(input),
          dueDate: parsed.dueDate || undefined,
          tags: parsed.tags || []
        };
        usedAI = true;
      }
    } catch (aiError) {
      console.warn('⚠️ OpenAI parse failed, falling back to local logic:', aiError.message);
    }

    if (!taskData) {
      taskData = {
        title: input,
        priority: detectPriority(input),
        category: detectCategory(input)
      };
    }

    const basicTask = await Task.create({
      ...taskData,
      user: req.user._id,
      aiGenerated: true
    });
    
    return res.json({ 
      message: usedAI ? '✨ Task created with AI!' : '✨ Task created successfully!',
      tasks: [basicTask],
      aiPowered: usedAI
    });

  } catch (error) {
    console.error('❌ Parse error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

function detectPriority(text) {
  const lower = text.toLowerCase();
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately')) return 'Urgent';
  if (lower.includes('important') || lower.includes('soon') || lower.includes('priority')) return 'High';
  if (lower.includes('later') || lower.includes('sometime')) return 'Low';
  return 'Medium';
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('study') || lower.includes('learn') || lower.includes('assignment') || lower.includes('exam')) return 'Study';
  if (lower.includes('work') || lower.includes('project') || lower.includes('meeting') || lower.includes('task')) return 'Work';
  if (lower.includes('shop') || lower.includes('buy') || lower.includes('purchase')) return 'Shopping';
  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('health') || lower.includes('doctor')) return 'Health';
  return 'Personal';
}

export const analyzeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findOne({ 
      _id: taskId, 
      user: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('📊 Analyzing task:', task.title);

    let analysis;
    let usedAI = false;

    try {
      const aiAnalysis = await analyzeTaskWithAI(task);
      if (aiAnalysis) {
        analysis = aiAnalysis;
        usedAI = true;
      }
    } catch (aiError) {
      console.warn('⚠️ OpenAI analysis failed, falling back to local logic:', aiError.message);
    }

    if (!analysis) {
      analysis = generateLocalAnalysis(task);
    }

    // Save to task
    task.aiSuggestions = {
      ...task.aiSuggestions,
      timeEstimate: analysis.timeEstimate,
      difficulty: analysis.difficulty,
      steps: analysis.steps,
      bestTime: analysis.bestTime
    };
    await task.save();

    res.json({ 
      message: usedAI ? 'Task analyzed with AI! 🎯' : 'Task analyzed! 🎯',
      analysis,
      aiPowered: usedAI
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze task' });
  }
};

export const getPrioritySuggestions = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      user: req.user._id,
      isCompleted: false 
    }).sort({ priority: -1, dueDate: 1 }).limit(10);

    if (tasks.length === 0) {
      return res.json({ 
        suggestions: "🎉 You're all caught up! No pending tasks. Time to relax or plan ahead!"
      });
    }

    try {
      const aiSuggestions = await getPrioritySuggestionsAI(tasks);
      if (aiSuggestions) {
        return res.json({ suggestions: aiSuggestions, aiPowered: true });
      }
    } catch (aiError) {
      console.warn('⚠️ OpenAI suggestions failed, falling back to local logic:', aiError.message);
    }

    const urgentTasks = tasks.filter(t => t.priority === 'Urgent').length;
    const highTasks = tasks.filter(t => t.priority === 'High').length;

    let suggestions = `📊 **Your Task Overview:**\n\n`;
    suggestions += `You have ${tasks.length} pending tasks.\n`;
    if (urgentTasks > 0) suggestions += `⚠️ ${urgentTasks} urgent tasks need immediate attention!\n`;
    if (highTasks > 0) suggestions += `🔴 ${highTasks} high-priority tasks to focus on.\n\n`;
    
    suggestions += `🎯 **Top 3 Focus Areas:**\n`;
    tasks.slice(0, 3).forEach((task, idx) => {
      suggestions += `${idx + 1}. ${task.title} (${task.priority})\n`;
    });

    suggestions += `\n💡 **Productivity Tips:**\n`;
    suggestions += `- Tackle urgent tasks first thing in the morning\n`;
    suggestions += `- Break large tasks into smaller steps\n`;
    suggestions += `- Use time-blocking to stay focused\n`;
    suggestions += `- Celebrate small wins along the way!\n`;

    res.json({ suggestions, aiPowered: false });
  } catch (error) {
    res.json({ suggestions: 'Focus on high-priority tasks! You got this! 💪' });
  }
};

export const breakdownTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findOne({ _id: taskId, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const analysis = generateLocalAnalysis(task);
    task.subtasks = analysis.steps.map(step => ({ title: step, isCompleted: false }));
    await task.save();

    res.json({ message: 'Task broken down! 🎯', task, tips: analysis.tips.join('\n') });
  } catch (error) {
    res.status(500).json({ message: 'Failed to breakdown task' });
  }
};

export const getDailySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = await Task.find({ user: userId, dueDate: { $gte: today } }).limit(10);
    const completedToday = await Task.countDocuments({ user: userId, completedAt: { $gte: today } });

    try {
      const aiSummary = await getDailySummaryAI(todayTasks, completedToday);
      if (aiSummary) {
        return res.json({
          summary: aiSummary,
          stats: { todayTasks: todayTasks.length, completedToday },
          aiPowered: true
        });
      }
    } catch (aiError) {
      console.warn('⚠️ OpenAI daily summary failed, falling back to local logic:', aiError.message);
    }

    let summary = `🌅 **Good Morning!**\n\n`;
    summary += `✅ You've completed ${completedToday} tasks today!\n`;
    summary += `📋 You have ${todayTasks.length} tasks scheduled.\n\n`;
    
    if (todayTasks.length > 0) {
      summary += `🎯 **Today's Top Priorities:**\n`;
      todayTasks.slice(0, 5).forEach((task, idx) => {
        summary += `${idx + 1}. ${task.title}\n`;
      });
    }

    summary += `\n💪 **Let's make today productive!**`;

    res.json({ summary, stats: { todayTasks: todayTasks.length, completedToday }, aiPowered: false });
  } catch (error) {
    res.json({ summary: 'Good morning! Ready to crush your goals today? 💪', stats: {} });
  }
};
// Already existing functions...
// export const getDailySummary = ...

// 🔥 ADD THIS AT THE END
export const suggestTimeBlock = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const tasks = await Task.find({ 
      user: userId,
      isCompleted: false 
    }).sort({ priority: -1, dueDate: 1 }).limit(10);

    if (tasks.length === 0) {
      return res.json({ 
        schedule: '🎉 No pending tasks! Enjoy your free time or plan ahead!'
      });
    }

    try {
      const aiSchedule = await getTimeBlockScheduleAI(tasks);
      if (aiSchedule) {
        return res.json({ schedule: aiSchedule, tasksScheduled: tasks.length, aiPowered: true });
      }
    } catch (aiError) {
      console.warn('⚠️ OpenAI time-block failed, falling back to local logic:', aiError.message);
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

    let schedule = `📅 **${currentDay} Schedule** (Current time: ${currentTime})\n\n`;
    
    schedule += `🎯 **Suggested Time Blocks:**\n\n`;
    
    // Morning block (9 AM - 12 PM)
    const urgentTasks = tasks.filter(t => t.priority === 'Urgent');
    if (urgentTasks.length > 0) {
      schedule += `🌅 **Morning (9:00 AM - 12:00 PM)** - Peak Focus\n`;
      urgentTasks.slice(0, 2).forEach(task => {
        schedule += `   • ${task.title} (${task.priority})\n`;
      });
      schedule += `\n`;
    }

    // Afternoon block (2 PM - 5 PM)
    const highTasks = tasks.filter(t => t.priority === 'High');
    if (highTasks.length > 0) {
      schedule += `☀️ **Afternoon (2:00 PM - 5:00 PM)** - Steady Work\n`;
      highTasks.slice(0, 2).forEach(task => {
        schedule += `   • ${task.title} (${task.priority})\n`;
      });
      schedule += `\n`;
    }

    // Evening block (5 PM - 7 PM)
    const mediumTasks = tasks.filter(t => t.priority === 'Medium');
    if (mediumTasks.length > 0) {
      schedule += `🌆 **Evening (5:00 PM - 7:00 PM)** - Lighter Tasks\n`;
      mediumTasks.slice(0, 2).forEach(task => {
        schedule += `   • ${task.title} (${task.priority})\n`;
      });
      schedule += `\n`;
    }

    schedule += `\n💡 **Tips:**\n`;
    schedule += `• Take 5-10 min breaks between tasks\n`;
    schedule += `• Stay hydrated and eat healthy snacks\n`;
    schedule += `• Adjust timing based on your energy levels\n`;

    res.json({ 
      schedule,
      tasksScheduled: tasks.length,
      aiPowered: false
    });

  } catch (error) {
    console.error('❌ Time block error:', error);
    res.json({ 
      schedule: 'Focus on high-priority tasks first! 💪'
    });
  }
};

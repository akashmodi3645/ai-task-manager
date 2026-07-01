import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Use a fast, cheap model — good enough for task-management style reasoning
const MODEL = 'gpt-4o-mini';

const isAvailable = () => Boolean(openai);

// ---- 1. Parse a natural-language task into structured fields ----
export const parseTaskFromText = async (text) => {
  if (!isAvailable()) return null;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You convert a short natural-language task request into structured JSON.
Return ONLY JSON: { "title": string, "description": string, "priority": "Low"|"Medium"|"High"|"Urgent", "category": "Work"|"Study"|"Personal"|"Shopping"|"Health", "dueDate": string|null (ISO date if a date/time is implied, else null), "tags": string[] }
Keep the title short and action-oriented. Infer priority/category from context and urgency words.`
      },
      { role: 'user', content: text }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  return JSON.parse(completion.choices[0].message.content);
};

// ---- 2. Deep analysis of a single task (time estimate, steps, difficulty, etc.) ----
export const analyzeTaskWithAI = async (task) => {
  if (!isAvailable()) return null;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a productivity coach analyzing a single task. Return ONLY JSON with this exact shape:
{
  "timeEstimate": string,
  "timeBreakdown": { "preparation": string, "execution": string, "review": string },
  "difficulty": "Easy"|"Medium"|"Hard",
  "difficultyReason": string,
  "steps": string[] (4-6 concrete steps),
  "prerequisites": string[],
  "tips": string[] (2-4 tips),
  "bestTime": string,
  "focusRequired": "Low"|"Medium"|"High",
  "potentialBlockers": string[],
  "motivation": string (one encouraging sentence)
}`
      },
      {
        role: 'user',
        content: `Title: ${task.title}\nDescription: ${task.description || 'N/A'}\nCategory: ${task.category}\nPriority: ${task.priority}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4
  });

  return JSON.parse(completion.choices[0].message.content);
};

// ---- 3. Personalized priority suggestions across all pending tasks ----
export const getPrioritySuggestionsAI = async (tasks) => {
  if (!isAvailable()) return null;

  const taskList = tasks
    .map((t, i) => `${i + 1}. ${t.title} | priority: ${t.priority} | category: ${t.category} | due: ${t.dueDate || 'none'}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a friendly productivity coach. Given a user's pending tasks, write a short markdown-style suggestion (use **bold** and emoji sparingly, max ~150 words) telling them what to focus on today and why, referencing specific task titles.`
      },
      { role: 'user', content: taskList }
    ],
    temperature: 0.6
  });

  return completion.choices[0].message.content;
};

// ---- 4. Daily summary ----
export const getDailySummaryAI = async (todayTasks, completedToday) => {
  if (!isAvailable()) return null;

  const taskList = todayTasks.map((t) => `- ${t.title} (${t.priority})`).join('\n') || 'No tasks scheduled.';

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `Write a short, warm daily summary (max 120 words, markdown-style with light emoji) for a task manager app. Mention how many tasks were completed today and what's left, and end with an encouraging line.`
      },
      { role: 'user', content: `Completed today: ${completedToday}\nScheduled today:\n${taskList}` }
    ],
    temperature: 0.6
  });

  return completion.choices[0].message.content;
};

// ---- 5. Time-block schedule suggestion ----
export const getTimeBlockScheduleAI = async (tasks) => {
  if (!isAvailable()) return null;

  const taskList = tasks
    .map((t) => `- ${t.title} | priority: ${t.priority}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `Create a realistic time-blocked daily schedule (morning/afternoon/evening) for these pending tasks, in short markdown-style text with emoji headers. Group by priority, keep it under 180 words, end with 2-3 short tips.`
      },
      { role: 'user', content: taskList }
    ],
    temperature: 0.5
  });

  return completion.choices[0].message.content;
};

// ---- 6. Smarter AI task assignment within a team ----
export const getBestAssigneeAI = async (task, members) => {
  if (!isAvailable()) return null;

  const memberList = members
    .map((m, i) => `${i + 1}. id: ${m.user._id} | name: ${m.user.name} | current workload: ${m.workload || 0} tasks | role: ${m.role}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You assign tasks fairly within a team. Pick the best member id for this task, balancing current workload with relevance. Return ONLY JSON: { "memberId": string, "reasoning": string (1 sentence) }`
      },
      {
        role: 'user',
        content: `Task: ${task.title}\nDescription: ${task.description || 'N/A'}\nPriority: ${task.priority}\n\nTeam members:\n${memberList}`
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3
  });

  return JSON.parse(completion.choices[0].message.content);
};

export { isAvailable as isAIAvailable };

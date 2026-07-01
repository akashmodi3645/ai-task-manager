import { createContext, useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });

  const { isAuthenticated } = useAuth();

  const fetchTasks = async () => {
    // ✅ Only fetch if user is logged in
    if (!isAuthenticated) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await taskAPI.getTasks(filters);
      setTasks(data.tasks);
      console.log('✅ Tasks fetched:', data.tasks.length);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      // Don't show toast on login page
      if (error.response?.status !== 401) {
        toast.error('Failed to fetch tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ Only fetch when authenticated
    if (isAuthenticated) {
      fetchTasks();
    } else {
      // Clear tasks when logged out
      setTasks([]);
    }
  }, [filters, isAuthenticated]);

  const createTask = async (taskData) => {
    try {
      const { data } = await taskAPI.createTask(taskData);
      setTasks([data.task, ...tasks]);
      toast.success('Task created successfully! 🎉');
      
      // Trigger dashboard refresh
      window.dispatchEvent(new Event('taskUpdated'));
      
      return true;
    } catch (error) {
      console.error('Create task error:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
      return false;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const { data } = await taskAPI.updateTask(id, taskData);
      setTasks(tasks.map(t => t._id === id ? data.task : t));
      toast.success('Task updated! ✅');
      
      // Trigger dashboard refresh
      window.dispatchEvent(new Event('taskUpdated'));
      
      return true;
    } catch (error) {
      console.error('Update task error:', error);
      toast.error('Failed to update task');
      return false;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted! 🗑️');
      
      // Trigger dashboard refresh
      window.dispatchEvent(new Event('taskUpdated'));
      
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task');
    }
  };

  const toggleComplete = async (id) => {
    try {
      const { data } = await taskAPI.toggleComplete(id);
      setTasks(tasks.map(t => t._id === id ? data.task : t));
      
      const task = data.task;
      if (task.isCompleted) {
        toast.success('Task completed! 🎉', {
          icon: '✅',
          duration: 3000
        });
      } else {
        toast('Task marked as pending', {
          icon: '⏳'
        });
      }
      
      // Trigger dashboard refresh
      window.dispatchEvent(new Event('taskUpdated'));
      
    } catch (error) {
      console.error('Toggle task error:', error);
      toast.error('Failed to update task');
    }
  };

  const value = {
    tasks,
    loading,
    filters,
    setFilters,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

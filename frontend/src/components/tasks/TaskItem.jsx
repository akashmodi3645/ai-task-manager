import { useState } from 'react';
import { FiTrash2, FiCheck, FiZap } from 'react-icons/fi';
import { useTasks } from '../../hooks/useTasks';
import { format } from 'date-fns';
import { aiAPI } from '../../services/api';
import TaskAnalysis from './TaskAnalysis';
import toast from 'react-hot-toast';

const TaskItem = ({ task }) => {
  const { toggleComplete, deleteTask } = useTasks();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const priorityColors = {
    'Urgent': 'bg-red-100 text-red-800 border-red-300',
    'High': 'bg-orange-100 text-orange-800 border-orange-300',
    'Medium': 'bg-blue-100 text-blue-800 border-blue-300',
    'Low': 'bg-green-100 text-green-800 border-green-300',
  };

  const handleAnalyze = async () => {
    setShowAnalysis(true);
    if (analysis) return; // Already analyzed

    setAnalyzing(true);
    try {
      const { data } = await aiAPI.analyzeTask(task._id);
      setAnalysis(data.analysis);
      toast.success('AI analysis complete! 🎯');
    } catch (error) {
      toast.error('Failed to analyze task');
      setShowAnalysis(false);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
        task.isCompleted ? 'opacity-60' : ''
      } border-${task.priority === 'Urgent' ? 'red' : task.priority === 'High' ? 'orange' : task.priority === 'Medium' ? 'blue' : 'green'}-500`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => toggleComplete(task._id)}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                task.isCompleted 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300 hover:border-green-500'
              }`}
            >
              {task.isCompleted && <FiCheck className="text-white text-sm" />}
            </button>
            
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                task.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    📅 {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </span>
                )}
                {task.category && (
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {task.category}
                  </span>
                )}
                {task.aiSuggestions?.timeEstimate && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                    ⏱️ {task.aiSuggestions.timeEstimate}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleAnalyze}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="AI Analysis"
            >
              <FiZap className="w-5 h-5" />
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority] || 'bg-gray-100'}`}>
              {task.priority}
            </span>
            <button
              onClick={() => deleteTask(task._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      </div>

      {/* AI Analysis Panel */}
      {showAnalysis && (
        <TaskAnalysis analysis={analysis} loading={analyzing} />
      )}
    </div>
  );
};

export default TaskItem;

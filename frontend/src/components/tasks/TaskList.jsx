import { useTasks } from '../../hooks/useTasks';
import AITaskInput from './AITaskInput';
import TaskItem from './TaskItem';
import TaskFilters from './TaskFilters';

const TaskList = () => {
  const { tasks, loading } = useTasks();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <p className="text-gray-600 mt-1">Manage and organize your tasks</p>
      </div>

      <AITaskInput />
      <TaskFilters />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskItem key={task._id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No tasks found. Create one using AI above!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;

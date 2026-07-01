import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { taskAPI } from '../../services/api';
import { format, subDays, isWithinInterval } from 'date-fns';

const TaskCompletionLineChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchCompletionData();
  }, []);

  const fetchCompletionData = async () => {
    try {
      const { data } = await taskAPI.getTasks({});
      const tasks = data.tasks;

      const last14Days = Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        const dateStr = format(date, 'MMM dd');
        
        const created = tasks.filter(t => {
          const createdDate = new Date(t.createdAt);
          return format(createdDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).length;

        const completed = tasks.filter(t => {
          if (!t.completedAt) return false;
          const completedDate = new Date(t.completedAt);
          return format(completedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).length;

        return {
          date: dateStr,
          created,
          completed
        };
      });

      setChartData(last14Days);
    } catch (error) {
      console.error('Completion data error:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        📉 Tasks Created vs Completed (14 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="created" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Created"
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskCompletionLineChart;

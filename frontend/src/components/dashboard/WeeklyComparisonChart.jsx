import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { analyticsAPI } from '../../services/api';
import { format, subDays } from 'date-fns';

const WeeklyComparisonChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const { data: trends } = await analyticsAPI.getProductivityTrends(7);
      
      const weekData = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
        const dayName = format(subDays(new Date(), 6 - i), 'EEE');
        const found = trends.trends.find(t => t._id === date);
        
        return {
          day: dayName,
          completed: found ? found.count : 0,
          target: 5
        };
      });
      
      setData(weekData);
    } catch (error) {
      console.error('Weekly data error:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        📊 Weekly Performance
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
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
          <Bar 
            dataKey="completed" 
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
            name="Completed Tasks"
          />
          <Bar 
            dataKey="target" 
            fill="#e5e7eb" 
            radius={[8, 8, 0, 0]}
            name="Daily Target"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyComparisonChart;

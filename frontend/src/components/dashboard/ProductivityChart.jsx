import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const ProductivityChart = ({ data }) => {
  // Transform data for chart
  const chartData = (data || []).map(item => ({
    date: item._id,
    displayDate: format(new Date(item._id), 'MMM dd'),
    tasks: item.count
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No data available yet. Complete some tasks to see your progress! 📊</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="displayDate" 
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="tasks" 
          stroke="#3B82F6" 
          strokeWidth={3}
          dot={{ fill: '#3B82F6', r: 5 }}
          activeDot={{ r: 7 }}
          name="Tasks Completed"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProductivityChart;

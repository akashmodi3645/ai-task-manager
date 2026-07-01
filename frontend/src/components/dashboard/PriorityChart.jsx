import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PriorityChart = ({ data }) => {
  const priorityColors = {
    'Urgent': '#EF4444',
    'High': '#F97316',
    'Medium': '#3B82F6',
    'Low': '#10B981'
  };

  const chartData = (data || []).map(item => ({
    priority: item._id || 'Unknown',
    count: item.count
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No tasks yet. Create some to see distribution! 📊</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="priority" 
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
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Bar 
          dataKey="count" 
          radius={[8, 8, 0, 0]}
          name="Tasks"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={priorityColors[entry.priority] || '#6B7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PriorityChart;

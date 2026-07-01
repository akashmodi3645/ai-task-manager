import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CategoryChart = ({ data }) => {
  const categoryColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316'  // Orange
  ];

  const chartData = (data || []).map(item => ({
    category: item._id || 'Uncategorized',
    count: item.count
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <p>No tasks categorized yet. Start organizing! 📂</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          type="number"
          stroke="#666"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          type="category"
          dataKey="category" 
          stroke="#666"
          style={{ fontSize: '12px' }}
          width={100}
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
          radius={[0, 8, 8, 0]}
          name="Tasks"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;

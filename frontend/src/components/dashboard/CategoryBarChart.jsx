import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList 
} from 'recharts';

const CategoryBarChart = ({ categoryDistribution }) => {
  const data = categoryDistribution?.map(item => ({
    category: item._id || 'General',
    count: item.count
  })).sort((a, b) => b.count - a.count) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].payload.category}</p>
          <p className="text-sm">{payload[0].value} tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        📂 Tasks by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="category" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#8b5cf6" 
            radius={[0, 8, 8, 0]}
          >
            <LabelList 
              dataKey="count" 
              position="right" 
              style={{ fill: '#6b7280', fontSize: '12px' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBarChart;

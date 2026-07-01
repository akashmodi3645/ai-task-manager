import { useEffect, useState } from 'react';
import { taskAPI } from '../../services/api';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

const HeatmapChart = () => {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      const { data } = await taskAPI.getTasks({});
      const tasks = data.tasks.filter(t => t.completedAt);

      const weeks = 12;
      const heatmap = [];

      for (let w = weeks - 1; w >= 0; w--) {
        const weekStart = startOfWeek(subDays(new Date(), w * 7));
        const weekData = [];

        for (let d = 0; d < 7; d++) {
          const day = addDays(weekStart, d);
          const dateStr = format(day, 'yyyy-MM-dd');
          
          const count = tasks.filter(t => {
            return format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr;
          }).length;

          weekData.push({
            date: dateStr,
            count,
            dayName: format(day, 'EEE')
          });
        }

        heatmap.push(weekData);
      }

      setHeatmapData(heatmap);
    } catch (error) {
      console.error('Heatmap error:', error);
    }
  };

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100';
    if (count <= 2) return 'bg-green-200';
    if (count <= 4) return 'bg-green-400';
    if (count <= 6) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        🔥 Activity Heatmap (Last 12 Weeks)
      </h3>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {heatmapData.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`w-4 h-4 rounded-sm ${getColor(day.count)} transition-all hover:ring-2 hover:ring-blue-500 cursor-pointer`}
                  title={`${day.date}: ${day.count} tasks`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded-sm" />
            <div className="w-4 h-4 bg-green-200 rounded-sm" />
            <div className="w-4 h-4 bg-green-400 rounded-sm" />
            <div className="w-4 h-4 bg-green-600 rounded-sm" />
            <div className="w-4 h-4 bg-green-800 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;

import { motion } from 'framer-motion';
import Tilt3D from '../common/Tilt3D';

const StatsCard = ({ title, value, icon, color, subtitle, delay = 0 }) => {
  const colorClasses = {
    blue: 'from-indigo-500 to-indigo-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-rose-500 to-rose-600',
    purple: 'from-violet-500 to-violet-600'
  };

  const glowClasses = {
    blue: 'shadow-indigo-200',
    green: 'shadow-emerald-200',
    yellow: 'shadow-amber-200',
    red: 'shadow-rose-200',
    purple: 'shadow-violet-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Tilt3D intensity={6} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{value}</h3>
            {subtitle && (
              <p className="text-gray-400 text-xs mt-1.5">{subtitle}</p>
            )}
          </div>
          <div className={`bg-gradient-to-br ${colorClasses[color]} ${glowClasses[color]} p-3.5 rounded-2xl text-white text-2xl shadow-lg`}>
            {icon}
          </div>
        </div>
      </Tilt3D>
    </motion.div>
  );
};

export default StatsCard;

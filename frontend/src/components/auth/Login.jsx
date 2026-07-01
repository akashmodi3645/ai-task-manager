import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiUsers, FiVideo, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Tilt3D from '../common/Tilt3D';

const features = [
  { icon: FiZap, text: 'AI-powered task suggestions' },
  { icon: FiUsers, text: 'Real-time team collaboration' },
  { icon: FiVideo, text: 'Built-in video meetings' }
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient floating shapes for subtle motion */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-6rem] left-[-6rem] w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 24, 0], rotate: [0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-8rem] right-[-6rem] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Branding panel */}
        <div className="hidden lg:flex flex-col justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-10 text-white">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-2xl font-bold shadow-lg mb-6"
            >
              <FiZap />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">AI Task Manager</h1>
            <p className="text-indigo-200 leading-relaxed">
              Plan smarter, collaborate faster, and let AI handle the busywork — all in one place.
            </p>
          </div>

          <div className="space-y-4 mt-10">
            {features.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.35 }}
                className="flex items-center gap-3 text-indigo-100"
              >
                <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <f.icon size={16} />
                </span>
                <span className="text-sm">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <Tilt3D intensity={3} scale={1.005} className="bg-white p-8 sm:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">Welcome back</h2>
          <p className="text-gray-500 mb-6 text-sm">Login to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-colors"
                required
                disabled={loading}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-colors"
                required
                disabled={loading}
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-2.5 rounded-xl font-medium hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-semibold">
              Sign up free
            </Link>
          </p>
        </Tilt3D>
      </motion.div>
    </div>
  );
};

export default Login;

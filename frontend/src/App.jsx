import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';  // ✅ Use Register.jsx
import Dashboard from './components/dashboard/Dashboard';
import TaskList from './components/tasks/TaskList';
import TeamList from './components/teams/TeamList';
import TeamDashboard from './components/teams/TeamDashboard';
import Profile from './components/profile/Profile';
import Notifications from './components/notifications/Notifications';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TaskProvider>
          <NotificationProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* ✅ Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />
              
              {/* ✅ Protected routes */}
              <Route path="/" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<TaskList />} />
                <Route path="teams" element={<TeamList />} />
                <Route path="teams/:id" element={<TeamDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </TaskProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

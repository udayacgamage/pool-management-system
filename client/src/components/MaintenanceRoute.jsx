import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const MaintenanceRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'maintenance' && user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default MaintenanceRoute;

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const StaffRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    // Admin is also considered staff for simplicity
    return user && (user.role === 'staff' || user.role === 'admin') ? <Outlet /> : <Navigate to="/dashboard" />;
}

export default StaffRoute;

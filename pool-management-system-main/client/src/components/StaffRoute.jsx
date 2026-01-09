import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const StaffRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    // Allow Staff, Admin, AND Coaches to access staff routes (Scanner)
    return user && (user.role === 'staff' || user.role === 'admin' || user.role === 'coach') ? <Outlet /> : <Navigate to="/dashboard" />;
}

export default StaffRoute;

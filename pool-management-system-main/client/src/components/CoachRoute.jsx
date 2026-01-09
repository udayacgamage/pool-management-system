import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const CoachRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    return user && (user.role === 'coach' || user.role === 'admin') ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default CoachRoute;

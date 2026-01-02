import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default AdminRoute;

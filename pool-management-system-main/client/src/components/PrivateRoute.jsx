import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;

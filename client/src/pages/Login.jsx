import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setIsLoading(true);
        try {
            const userData = await login({ email, password });
            if (userData.role === 'admin') {
                navigate('/admin');
            } else if (userData.role === 'staff') {
                navigate('/scanner');
            } else if (userData.role === 'coach') {
                navigate('/coach');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setLocalError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafcff] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary-100/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Back to Home Button */}
            <Link 
                to="/" 
                className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-slate-500 hover:text-primary-700 transition-all duration-300 bg-white/40 hover:bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-sm hover:shadow-md group z-20"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-semibold text-sm">Back to Home</span>
            </Link>

            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo area */}
                <div className="text-center mb-8">
                    <Logo size="lg" className="justify-center mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                    <p className="text-slate-500 mt-2">Sign in to manage your pool bookings</p>
                </div>

                <div className="glass-card motion-soft !bg-white/70 p-8 rounded-[2rem] border-white/40 shadow-2xl shadow-primary-900/5">
                    {(error || localError) && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm flex items-center gap-3 animate-shake">
                            <span className="text-lg">⚠️</span>
                            <p className="font-medium">{error || localError}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                University Email
                            </label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@sjp.ac.lk"
                                    className="input-field !pl-12 !h-12 !bg-white/50 focus:!bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <a href="#" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field !pl-12 !h-12 !bg-white/50 focus:!bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer transition-all"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-4 px-4 btn-maroon motion-soft !text-lg !rounded-xl disabled:opacity-70 disabled:cursor-not-wait"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <p className="text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-primary-700 hover:text-primary-800 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center flex justify-center gap-6 text-slate-400 text-xs font-medium uppercase tracking-widest">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <span className="text-slate-200">|</span>
                    <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
                    <span className="text-slate-200">|</span>
                    <a href="#" className="hover:text-primary-600 transition-colors">Help</a>
                </div>
            </div>
        </div>
    );
};

export default Login;


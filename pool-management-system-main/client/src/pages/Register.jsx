import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;
    const { register, error } = useAuth();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await register({ name, email, password });
            navigate('/dashboard');
        } catch (err) {
            setLocalError('Registration failed. Please use your university email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafcff] flex items-center justify-center p-4 relative overflow-hidden py-12">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary-100/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md animate-fade-in">
                {/* Logo area */}
                <div className="text-center mb-8">
                    <Logo size="lg" className="justify-center mb-6" />
                    <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
                    <p className="text-slate-500 mt-2">Join the USJ swimming community</p>
                </div>

                <div className="glass-card !bg-white/70 p-8 rounded-[2rem] border-white/40 shadow-2xl shadow-primary-900/5">
                    {(error || localError) && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm flex items-center gap-3 animate-shake">
                            <span className="text-lg">⚠️</span>
                            <p className="font-medium">{error || localError}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={onChange}
                                placeholder="John Doe"
                                className="input-field !h-12 !bg-white/50 focus:!bg-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                University Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={onChange}
                                placeholder="name@sjp.ac.lk"
                                className="input-field !h-12 !bg-white/50 focus:!bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={onChange}
                                    placeholder="••••••••"
                                    className="input-field !h-12 !bg-white/50 focus:!bg-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                                    Confirm
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={onChange}
                                    placeholder="••••••••"
                                    className="input-field !h-12 !bg-white/50 focus:!bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-2 pt-2">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer transition-all"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer select-none">
                                By creating an account, I agree to follow the pool rules and regulations set by USJ Physical Education Department.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-4 px-4 btn-primary !text-lg !rounded-xl !shadow-primary-700/30 disabled:opacity-70 disabled:cursor-not-wait mt-4"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Register"}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-slate-100">
                        <p className="text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-primary-700 hover:text-primary-800 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center flex justify-center gap-6 text-slate-400 text-xs font-medium uppercase tracking-widest">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <span className="text-slate-200">|</span>
                    <a href="#" className="hover:text-primary-600 transition-colors">Rules</a>
                    <span className="text-slate-200">|</span>
                    <a href="#" className="hover:text-primary-600 transition-colors">Help</a>
                </div>
            </div>
        </div>
    );
};

export default Register;


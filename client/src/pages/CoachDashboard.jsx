import React, { useState, useEffect } from 'react';
import api, { getAuthHeader } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom'; // Import Link

const CoachDashboard = () => {
    const { user, logout } = useAuth();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDailySchedule();
    }, []);

    const fetchDailySchedule = async () => {
        try {
            const config = { headers: getAuthHeader() };
            const response = await api.get('/slots/today', config);
            setSlots(response.data);
            setLoading(false);
        } catch (err) {
            setError('Unable to fetch daily schedule.');
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#f0f4f8] font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo size="md" />
                    <div className="flex items-center gap-6">
                        <Link to="/scanner" className="hidden sm:flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-mg transition-colors">
                            <span className="text-lg">🔍</span> Scanner
                        </Link>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                            <p className="text-xs font-black text-mg uppercase tracking-widest">
                                {user?.specialization ? `${user.specialization} Coach` : 'Head Coach'}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight text-slate-800">Daily Roster</h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-bold flex items-center gap-3">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: 'var(--mg)' }}></div>
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-200 border-dashed">
                        <div className="text-6xl mb-4">🏖️</div>
                        <h3 className="text-xl font-bold text-slate-700">No Sessions Today</h3>
                        <p className="text-slate-400">The pool is clear for the day.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {slots.map((slot) => {
                            const bookingCount = slot.bookings?.length || 0;
                            const capacityPercent = (bookingCount / slot.capacity) * 100;
                            
                            return (
                                <div key={slot._id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="w-3 h-3 rounded-full bg-mg animate-pulse"></span>
                                                <p className="text-xs font-black text-mg uppercase tracking-widest">Active Session</p>
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-800">
                                                {formatTime(slot.startTime)} <span className="text-slate-300 font-light">-</span> {formatTime(slot.endTime)}
                                            </h3>
                                        </div>
                                        <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 min-w-[180px]">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                                            <div className="flex items-end gap-2">
                                                <span className="text-3xl font-black text-slate-800">{bookingCount}</span>
                                                <span className="text-sm font-bold text-slate-400 mb-1">/ {slot.capacity}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${capacityPercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                                    style={{ width: `${capacityPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student List */}
                                    <div className="border-t border-slate-100 pt-6">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Registered Swimmers</h4>
                                        {slot.bookings && slot.bookings.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {slot.bookings.map((student) => (
                                                    <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-sm font-bold text-slate-700 truncate">{student.name}</p>
                                                            <p className="text-[10px] font-medium text-slate-400 truncate">{student.email}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No bookings for this session yet.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoachDashboard;

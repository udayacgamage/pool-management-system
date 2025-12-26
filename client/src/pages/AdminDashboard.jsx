import React, { useState, useEffect } from 'react';
import api, { getAuthHeader } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('slots'); // 'slots', 'users', 'reports'
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        capacity: 20
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    const refreshData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'slots') await fetchSlots();
            if (activeTab === 'users') await fetchUsers();
            if (activeTab === 'reports') await fetchStats();
            if (!stats) await fetchStats();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        const config = { headers: getAuthHeader() };
        const response = await api.get('/slots', config);
        setSlots(response.data);
    };

    const fetchUsers = async () => {
        const config = { headers: getAuthHeader() };
        const response = await api.get('/auth/users', config);
        setUsers(response.data);
    };

    const fetchStats = async () => {
        const config = { headers: getAuthHeader() };
        const response = await api.get('/bookings/stats', config);
        setStats(response.data);
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('CRITICAL: Delete slot and confirm cancellations?')) return;
        try {
            const config = { headers: getAuthHeader() };
            await api.delete(`/slots/${id}`, config);
            setSuccessMsg('Slot purged successfully.');
            fetchSlots();
            fetchStats();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Operation failed.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Remove user from system?')) return;
        try {
            const config = { headers: getAuthHeader() };
            await api.delete(`/auth/users/${id}`, config);
            setSuccessMsg('User removed successfully.');
            fetchUsers();
            fetchStats();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove user.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg('');
        try {
            const config = { headers: getAuthHeader() };
            const start = new Date(`${formData.date}T${formData.startTime}`);
            const end = new Date(`${formData.date}T${formData.endTime}`);
            if (start >= end) {
                setError('Time logic error.');
                return;
            }
            await api.post('/slots', {
                startTime: start,
                endTime: end,
                capacity: formData.capacity
            }, config);
            setSuccessMsg('Pool slot deployed.');
            setShowForm(false);
            setFormData({ date: '', startTime: '', endTime: '', capacity: 20 });
            fetchSlots();
            fetchStats();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Authorization error.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sideItems = [
        { id: 'slots', label: 'Slot Registry', icon: '🏊' },
        { id: 'users', label: 'User Control', icon: '👤' },
        { id: 'reports', label: 'Audit Reports', icon: '📈' },
    ];

    return (
        <div className="min-h-screen bg-[#fafbfc] flex font-sans relative overflow-x-hidden">
            {/* Mobile Menu Button (move to right) */}
            <div className="lg:hidden fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-3 bg-[#5a0000] text-white rounded-2xl shadow-xl border border-[#5a0000] active:scale-95 transition-all"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar (anchor right on mobile, left on desktop) */}
            <aside className={`
                ${isSidebarOpen ? 'w-72' : 'w-24'} 
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                fixed lg:sticky top-0 right-0 lg:right-auto lg:left-0 h-screen z-50
                bg-[#5a0000] text-white transition-all duration-300 flex flex-col
            `}>
                <div className="p-8 border-b border-slate-800/50">
                    <Logo size="md" dark showText={isSidebarOpen} />
                </div>

                <nav className="flex-1 px-4 mt-8 space-y-2 text-[10px] font-black uppercase tracking-widest">
                    {sideItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === item.id
                                ? 'bg-mg text-white shadow-xl'
                                : 'text-slate-400 hover:bg-[#6a0000]/50 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                    <Link
                        to="/scanner"
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
                    >
                        <span className="text-xl">🔍</span>
                        {isSidebarOpen && <span>Gate Scanner</span>}
                    </Link>
                    <Link
                        to="/"
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all italic"
                    >
                        <span className="text-xl">🏠</span>
                        {isSidebarOpen && <span>Exit to Home</span>}
                    </Link>
                </nav>

                <div className="p-6 mt-auto">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-2xl transition-all"
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-bold">Sign Out</span>}
                    </button>
                    <div className={`mt-6 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 ${!isSidebarOpen && 'hidden'}`}>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Supervisor</p>
                        <p className="font-bold text-sm truncate uppercase tracking-tighter">{user?.name}</p>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto w-full">
                <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 px-6 lg:px-10 py-6">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-center sm:text-left mt-12 sm:mt-0">
                            <h2 className="text-xl lg:text-2xl font-black tracking-tight capitalize text-slate-800">{activeTab} Control</h2>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest italic">Global Infrastructure Panel</p>
                        </div>
                        {activeTab === 'slots' && (
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="w-full sm:w-auto btn-maroon !px-8 !py-3.5 !text-[10px] uppercase tracking-widest shadow-xl"
                            >
                                {showForm ? '✕ Close Console' : '+ Provision Slot'}
                            </button>
                        )}
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-6 lg:p-10">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'Total Users', value: stats?.users || 0, icon: '🎓', color: 'bg-[#fff0f0] text-mg' },
                            { label: 'Bookings', value: stats?.bookings || 0, icon: '🎫', color: 'bg-emerald-50 text-emerald-700' },
                            { label: 'Attended', value: stats?.attended || 0, icon: '✅', color: 'bg-amber-50 text-amber-700' },
                            { label: 'Sessions', value: stats?.slots || 0, icon: '⚡', color: 'bg-purple-50 text-purple-700' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-4`}>{stat.icon}</div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {(error || successMsg) && (
                        <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 animate-slide-up border ${error ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            <span className="text-xl">{error ? '🚫' : '💎'}</span>
                            <p className="font-black text-[10px] uppercase tracking-widest">{error || successMsg}</p>
                        </div>
                    )}

                    {activeTab === 'slots' && (
                        <>
                            {showForm && (
                                <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl mb-12 animate-fade-in">
                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                            <input type="date" required className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-slate-700" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival</label>
                                            <input type="time" required className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-slate-700" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                                            <input type="time" required className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-slate-700" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                                        </div>
                                        <button type="submit" className="w-full h-12 btn-maroon !rounded-xl !text-[10px] uppercase tracking-widest">Authorize Session</button>
                                    </form>
                                </div>
                            )}

                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Index</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Window</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Load</th>
                                                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {slots.map((slot) => (
                                                <tr key={slot._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-5 text-sm font-black text-slate-700">{formatDate(slot.startTime)}</td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                                            <span className="bg-slate-100 px-2 py-1 rounded">{formatTime(slot.startTime)}</span>
                                                            <span className="bg-slate-100 px-2 py-1 rounded">{formatTime(slot.endTime)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-[10px] font-black text-slate-400">{slot.bookings?.length || 0} / {slot.capacity}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button onClick={() => handleDeleteSlot(slot._id)} className="text-rose-500 hover:text-rose-700 text-[10px] font-black uppercase tracking-widest">Terminate</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'users' && (
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Info</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier/Role</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800 text-sm">{u.name}</span>
                                                        <span className="text-[10px] font-medium text-slate-400">{u.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                                        u.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                                        u.role === 'coach' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        'bg-[#fff0f0] text-mg border-slate-200'
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {u.role !== 'admin' && (
                                                        <button onClick={() => handleDeleteUser(u._id)} className="text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest">Evict</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="space-y-8 animate-fade-in w-full">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                                <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black text-primary-700 uppercase tracking-widest mb-6 italic">Success distribution</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                                            <span className="text-2xl font-black text-emerald-500">{stats?.attended || 0}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: stats?.bookings ? (stats.attended / stats.bookings * 100) + '%' : '0%' }}></div>
                                        </div>
                                        <div className="flex justify-between items-end pt-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voided</span>
                                            <span className="text-2xl font-black text-rose-500">{stats?.cancelled || 0}</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500" style={{ width: stats?.bookings ? (stats.cancelled / stats.bookings * 100) + '%' : '0%' }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 bg-white p-8 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6">Peak Utility Trends</h4>
                                    <div className="space-y-4">
                                        {stats?.trends?.map((t, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                                                <div className="text-xl">🔥</div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-slate-700">{formatDate(t.startTime)}</p>
                                                    <p className="text-[10px] font-black text-slate-300">{formatTime(t.startTime)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-mg">{Math.round((t.bookingCount / t.capacity) * 100) || 0}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

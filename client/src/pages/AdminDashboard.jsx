import React, { useState, useEffect } from 'react';
import api, {
    getAuthHeader, getHolidays, createHoliday, deleteHoliday,
    getNotices, createNotice, deleteNotice,
    getAllocations, createAllocation, deleteAllocation, getCoaches
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    // Data States

    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [notices, setNotices] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [coaches, setCoaches] = useState([]);

    // UI States
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'reports', 'holidays', 'notices', 'allocation'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form States

    const [holidayForm, setHolidayForm] = useState({ date: '', description: '', type: 'Holiday' });
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', type: 'General' });
    const [allocationForm, setAllocationForm] = useState({ date: '', coachId: '' });

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    const refreshData = async () => {
        setLoading(true);
        try {

            if (activeTab === 'users') await fetchUsers();
            if (activeTab === 'reports') await fetchStats();
            if (activeTab === 'holidays') await fetchHolidays();
            if (activeTab === 'notices') await fetchNotices();
            if (activeTab === 'allocation') {
                await fetchAllocations();
                await fetchCoaches();
            }
            if (!stats) await fetchStats(); // Always fetch stats once
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Fetch Helpers ---

    const fetchUsers = async () => {
        const res = await api.get('/auth/users', { headers: getAuthHeader() });
        setUsers(res.data);
    };
    const fetchStats = async () => {
        const res = await api.get('/bookings/stats', { headers: getAuthHeader() });
        setStats(res.data);
    };
    const fetchHolidays = async () => {
        const res = await getHolidays();
        setHolidays(res.data);
    };
    const fetchNotices = async () => {
        const res = await getNotices();
        setNotices(res.data);
    };
    const fetchAllocations = async () => {
        const res = await getAllocations();
        setAllocations(res.data);
    };
    const fetchCoaches = async () => {
        const res = await getCoaches();
        setCoaches(res.data);
    };

    // --- Action Handlers ---
    const handleDelete = async (apiCall, id, msg) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await apiCall(id);
            setSuccessMsg(msg);
            refreshData();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Operation failed');
        }
    };

    const handleFormSubmit = async (e, apiCall, data, successMessage, resetState) => {
        e.preventDefault();
        setError(null);
        try {
            await apiCall(data);
            setSuccessMsg(successMessage);
            setShowForm(false);
            if (resetState) resetState();
            refreshData();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    // Specific Submit Handlers


    const sideItems = [

        { id: 'users', label: 'User Control', icon: '👤' },
        { id: 'reports', label: 'Audit Reports', icon: '📈' },
        { id: 'holidays', label: 'Holidays', icon: '📅' },
        { id: 'notices', label: 'Notice Board', icon: '📢' },
    ];

    const formatDate = (d) => new Date(d).toLocaleDateString();

    return (
        <div className="h-[100dvh] md:h-screen w-screen bg-[#fafbfc] flex font-sans overflow-hidden">
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

            {/* Sidebar */}
            <aside className={`
                ${isSidebarOpen ? 'w-72' : 'w-24'} 
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                fixed lg:relative h-full z-50 flex-shrink-0
                bg-[#5a0000] text-white transition-all duration-300 flex flex-col
            `}>
                <div className="p-8 border-b border-slate-800/50">
                    <Logo size="md" dark showText={isSidebarOpen} />
                </div>

                <nav className="flex-1 px-4 mt-8 space-y-2 text-[10px] font-black uppercase tracking-widest overflow-y-auto custom-scrollbar">
                    {sideItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === item.id
                                ? 'bg-mg text-white shadow-xl'
                                : 'text-slate-400 hover:bg-[#6a0000]/50 hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon.length > 2 ? <i className={`fa-solid fa-${item.icon}`}></i> : item.icon}</span>
                            {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-6 mt-auto">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-2xl transition-all">
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-bold">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto p-6 lg:p-10 scroll-smooth">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize">{activeTab} Manager</h2>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest italic">System Administration</p>
                    </div>
                    {['holidays', 'notices', 'allocation'].includes(activeTab) && (
                        <button onClick={() => setShowForm(!showForm)} className="btn-maroon px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">
                            {showForm ? 'Close Form' : '+ Add New'}
                        </button>
                    )}
                </header>

                {/* Status Messages */}
                {(error || successMsg) && (
                    <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 border ${error ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        <span className="text-xl">{error ? '🚫' : '💎'}</span>
                        <p className="font-black text-[10px] uppercase tracking-widest">{error || successMsg}</p>
                    </div>
                )}

                {/* --- FORMS --- */}
                {showForm && (
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl mb-10 animate-fade-in">


                        {activeTab === 'holidays' && (
                            <form onSubmit={(e) => handleFormSubmit(e, createHoliday, holidayForm, 'Holiday Added', () => setHolidayForm({ date: '', description: '', type: 'Holiday' }))} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                                    <input type="date" required className="w-full input-field" value={holidayForm.date} onChange={e => setHolidayForm({ ...holidayForm, date: e.target.value })} />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Description</span>
                                    <input type="text" required className="w-full input-field" placeholder="e.g. Maintenance" value={holidayForm.description} onChange={e => setHolidayForm({ ...holidayForm, description: e.target.value })} />
                                </label>
                                <button type="submit" className="btn-maroon h-12 rounded-xl text-xs font-bold uppercase">Mark Closed</button>
                            </form>
                        )}

                        {activeTab === 'notices' && (
                            <form onSubmit={(e) => handleFormSubmit(e, createNotice, noticeForm, 'Notice Posted', () => setNoticeForm({ title: '', content: '', type: 'General' }))} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="block space-y-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Title</span>
                                        <input type="text" required className="w-full input-field" value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} />
                                    </label>
                                    <label className="block space-y-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Type</span>
                                        <select className="w-full input-field" value={noticeForm.type} onChange={e => setNoticeForm({ ...noticeForm, type: e.target.value })}>
                                            <option value="General">General</option>
                                            <option value="Rules">Rules</option>
                                            <option value="Emergency">Emergency</option>
                                            <option value="Competition">Competition</option>
                                        </select>
                                    </label>
                                </div>
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Content</span>
                                    <textarea required rows="3" className="w-full input-field p-4" value={noticeForm.content} onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}></textarea>
                                </label>
                                <button type="submit" className="btn-maroon w-full py-3 rounded-xl text-xs font-bold uppercase">Post Notice</button>
                            </form>
                        )}

                        {activeTab === 'allocation' && (
                            <form onSubmit={(e) => handleFormSubmit(e, createAllocation, allocationForm, 'Coach Allocated', () => setAllocationForm({ date: '', coachId: '' }))} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                                    <input type="date" required className="w-full input-field" value={allocationForm.date} onChange={e => setAllocationForm({ ...allocationForm, date: e.target.value })} />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Coach</span>
                                    <select required className="w-full input-field" value={allocationForm.coachId} onChange={e => setAllocationForm({ ...allocationForm, coachId: e.target.value })}>
                                        <option value="">Select Coach</option>
                                        {coaches.map(c => <option key={c._id} value={c._id}>{c.name} ({c.specialization})</option>)}
                                    </select>
                                </label>
                                <button type="submit" className="btn-maroon h-12 rounded-xl text-xs font-bold uppercase">Assign</button>
                            </form>
                        )}
                    </div>
                )}

                {/* --- DATA LISTS --- */}
                {/* --- DATA LISTS --- */}
                {activeTab === 'holidays' && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50"><tr className="text-left text-xs uppercase text-slate-400 font-bold"><th className="p-6">Date</th><th className="p-6">Reason</th><th className="p-6 text-right">Action</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {holidays.map(h => (
                                    <tr key={h._id} className="hover:bg-slate-50">
                                        <td className="p-6 font-bold text-slate-700">{formatDate(h.date)}</td>
                                        <td className="p-6">{h.description} <span className="text-xs bg-slate-100 px-2 py-1 rounded ml-2 uppercase text-slate-500">{h.type}</span></td>
                                        <td className="p-6 text-right"><button onClick={() => handleDelete(deleteHoliday, h._id, 'Holiday removed')} className="text-rose-500 font-bold text-xs uppercase">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'notices' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {notices.map(n => (
                            <div key={n._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${n.type === 'Emergency' ? 'bg-rose-500' : 'bg-slate-500'}`}>{n.type}</span>
                                    <button onClick={() => handleDelete(deleteNotice, n._id, 'Notice deleted')} className="text-rose-400 hover:text-rose-600">×</button>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">{n.title}</h3>
                                <p className="text-slate-500 text-sm whitespace-pre-wrap">{n.content}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'reports' && stats && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Top KPIs Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Users</p>
                                    <div className="text-3xl font-black text-slate-800">{stats.users}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">👥</div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Total Bookings</p>
                                    <div className="text-3xl font-black text-slate-800">{stats.bookings}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">🔖</div>
                            </div>


                            {/* No-Show Health Gauge */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Missed Bookings</p>
                                    <div className="text-4xl font-black text-slate-800">{stats.noShowRate || 0}%</div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">{stats.noShowCount || 0} people didn't come</p>
                                </div>
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                        <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            className={`${stats.noShowRate > 20 ? 'text-rose-500' : stats.noShowRate > 10 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                                            strokeDasharray={226}
                                            strokeDashoffset={226 - (226 * (stats.noShowRate || 0)) / 100}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Heat Map & Top No-Showers */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Peak Hours Heat Map */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Weekly Crowd Pattern</h3>
                                        <p className="text-xs text-slate-400 font-medium">Shows which times are usually busy (Red) or quiet (Blue)</p>
                                    </div>
                                    <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-100"></span> Empty</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Moderate</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Busy</span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    {/* Grid Container */}
                                    <div className="min-w-[600px]">
                                        {/* Header Row (Days) */}
                                        <div className="grid grid-cols-6 gap-1 mb-1">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Hour</div>
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(d => (
                                                <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{d}</div>
                                            ))}
                                        </div>

                                        {/* Hour Rows */}
                                        {Array.from({ length: 14 }, (_, i) => i + 6).map(hour => ( // 6 AM to 7 PM range
                                            <div key={hour} className="grid grid-cols-6 gap-1 mb-1 items-center">
                                                <div className="text-[10px] font-mono text-slate-400 text-center">
                                                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                                </div>
                                                {[2, 3, 4, 5, 6].map(day => {
                                                    // Find data for this cell
                                                    const cellData = stats.heatMap?.find(d => d.day === day && d.hour === hour);
                                                    const occupancy = cellData ? cellData.occupancyPercent : 0;

                                                    // Color Logic
                                                    let bgClass = 'bg-slate-50'; // Default empty
                                                    if (occupancy > 0) bgClass = 'bg-blue-100';
                                                    if (occupancy > 25) bgClass = 'bg-blue-300';
                                                    if (occupancy > 50) bgClass = 'bg-blue-500';
                                                    if (occupancy > 75) bgClass = 'bg-orange-400';
                                                    if (occupancy > 90) bgClass = 'bg-rose-500';

                                                    return (
                                                        <div key={`${day}-${hour}`} className="relative group h-8">
                                                            <div className={`w-full h-full rounded-md ${bgClass} transition-all hover:scale-105 cursor-pointer`}></div>
                                                            {/* Tooltip */}
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] font-bold p-2 rounded-lg whitespace-nowrap z-10 shadow-xl pointer-events-none">
                                                                {occupancy.toFixed(0)}% Capacity
                                                                <br />
                                                                {cellData?.avgBookings?.toFixed(1) || 0} avg patrons
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Top No-Showers List */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">⚠️ Top No-Showers</h3>
                                <div className="space-y-4">
                                    {stats.topNoShowers && stats.topNoShowers.length > 0 ? (
                                        stats.topNoShowers.map((user, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-500">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-bold text-slate-800 truncate">{user.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.count} Missed Sessions</p>
                                                </div>
                                                <button onClick={() => alert(`Ideally send email to ${user.email}`)} className="text-xs font-black text-blue-500 uppercase hover:underline">
                                                    Notify
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-slate-400">
                                            <p className="text-4xl mb-2">🎉</p>
                                            <p className="text-sm font-bold">Everyone showed up!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {activeTab === 'users' && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50"><tr className="text-left text-xs uppercase text-slate-400 font-bold"><th className="p-6">Name</th><th className="p-6">Role</th><th className="p-6 text-right">Action</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(u => (
                                    <tr key={u._id} className="hover:bg-slate-50">
                                        <td className="p-6">
                                            <p className="font-bold text-slate-700">{u.name}</p>
                                            <p className="text-xs text-slate-400">{u.email}</p>
                                        </td>
                                        <td className="p-6"><span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase">{u.role}</span></td>
                                        <td className="p-6 text-right">
                                            {u.role !== 'admin' && <button onClick={() => handleDelete((id) => api.delete(`/auth/users/${id}`, { headers: getAuthHeader() }), u._id, 'User removed')} className="text-rose-500 font-bold text-xs uppercase">Ban</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

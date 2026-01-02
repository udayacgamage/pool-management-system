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
    const [slots, setSlots] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [notices, setNotices] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [coaches, setCoaches] = useState([]);

    // UI States
    const [activeTab, setActiveTab] = useState('slots'); // 'slots', 'users', 'reports', 'holidays', 'notices', 'allocation'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Form States
    const [slotForm, setSlotForm] = useState({ date: '', startTime: '', endTime: '', capacity: 30 });
    const [holidayForm, setHolidayForm] = useState({ date: '', description: '', type: 'Holiday' });
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', type: 'General' });
    const [allocationForm, setAllocationForm] = useState({ date: '', coachId: '' });

    useEffect(() => {
        refreshData();
    }, [activeTab]);

    const refreshData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'slots') await fetchSlots();
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
    const fetchSlots = async () => {
        const res = await api.get('/slots', { headers: getAuthHeader() });
        setSlots(res.data);
    };
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
    const submitSlot = (e) => {
        const start = new Date(`${slotForm.date}T${slotForm.startTime}`);
        const end = new Date(`${slotForm.date}T${slotForm.endTime}`);
        if (start >= end) return setError('Invalid time range');

        handleFormSubmit(
            e,
            (d) => api.post('/slots', d, { headers: getAuthHeader() }),
            { startTime: start, endTime: end, capacity: slotForm.capacity },
            'Slot created',
            () => setSlotForm({ date: '', startTime: '', endTime: '', capacity: 30 })
        );
    };

    const sideItems = [
        { id: 'slots', label: 'Slot Registry', icon: '🏊' },
        { id: 'users', label: 'User Control', icon: '👤' },
        { id: 'reports', label: 'Audit Reports', icon: '📈' },
        { id: 'holidays', label: 'Holidays', icon: '📅' },
        { id: 'notices', label: 'Notice Board', icon: '📢' },
    ];

    const formatDate = (d) => new Date(d).toLocaleDateString();

    return (
        <div className="h-screen w-screen bg-[#fafbfc] flex font-sans overflow-hidden">
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
                    {['slots', 'holidays', 'notices', 'allocation'].includes(activeTab) && (
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
                        {activeTab === 'slots' && (
                            <form onSubmit={submitSlot} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Date</span>
                                    <input type="date" required className="w-full input-field" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Start</span>
                                    <input type="time" required className="w-full input-field" value={slotForm.startTime} onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })} />
                                </label>
                                <label className="block space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">End</span>
                                    <input type="time" required className="w-full input-field" value={slotForm.endTime} onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })} />
                                </label>
                                <button type="submit" className="btn-maroon h-12 rounded-xl text-xs font-bold uppercase">Deploy Slot</button>
                            </form>
                        )}

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
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
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
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                                <div className="text-4xl mb-2">👥</div>
                                <div className="text-3xl font-black text-slate-800">{stats.users}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Users</div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                                <div className="text-4xl mb-2">🔖</div>
                                <div className="text-3xl font-black text-slate-800">{stats.bookings}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Bookings</div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                                <div className="text-4xl mb-2">✅</div>
                                <div className="text-3xl font-black text-emerald-500">{stats.attended}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Attended</div>
                            </div>
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                                <div className="text-4xl mb-2">🚫</div>
                                <div className="text-3xl font-black text-rose-500">{stats.cancelled}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Cancelled</div>
                            </div>
                        </div>

                        {/* High Occupancy Slots */}
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">🔥 Trending Slots</h3>
                            <div className="space-y-4">
                                {stats.trends && stats.trends.length > 0 ? (
                                    stats.trends.map((t, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <p className="font-bold text-slate-700">{formatDate(t.startTime)}</p>
                                                <p className="text-xs text-slate-400">{new Date(t.startTime).toLocaleTimeString([], { timeStyle: 'short' })} - {new Date(t.endTime).toLocaleTimeString([], { timeStyle: 'short' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xl font-black text-mg">{t.bookingCount}</span>
                                                <span className="text-xs font-bold text-slate-400">/{t.capacity}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm">No sufficient data for trends yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Keep existing Slots and Users views roughly as they were, just simplified for length */}
                {activeTab === 'slots' && !showForm && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50"><tr className="text-left text-xs uppercase text-slate-400 font-bold"><th className="p-6">Date</th><th className="p-6">Time</th><th className="p-6">Capacity</th><th className="p-6 text-right">Action</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {slots.map(s => (
                                    <tr key={s._id} className="hover:bg-slate-50">
                                        <td className="p-6 font-bold text-slate-700">{formatDate(s.startTime)}</td>
                                        <td className="p-6 text-sm">{new Date(s.startTime).toLocaleTimeString([], { timeStyle: 'short' })} - {new Date(s.endTime).toLocaleTimeString([], { timeStyle: 'short' })}</td>
                                        <td className="p-6 text-sm flex items-center gap-2">
                                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-mg" style={{ width: `${(s.bookings.length / s.capacity) * 100}%` }}></div></div>
                                            {s.bookings.length}/{s.capacity}
                                        </td>
                                        <td className="p-6 text-right"><button onClick={() => handleDelete((id) => api.delete(`/slots/${id}`, { headers: getAuthHeader() }), s._id, 'Slot deleted')} className="text-rose-500 font-bold text-xs uppercase">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
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

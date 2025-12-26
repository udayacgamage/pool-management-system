import React, { useState, useEffect } from 'react';
import api, { getAuthHeader } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Logo from '../components/Logo';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [slots, setSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [processing, setProcessing] = useState(null);
    const [activeTab, setActiveTab] = useState('slots'); // 'slots' or 'bookings'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false); // new

    useEffect(() => {
        fetchSlots();
        fetchMyBookings();
    }, []);

    // Close on ESC
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setQrModalOpen(false); };
        if (qrModalOpen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [qrModalOpen]);

    const fetchSlots = async () => {
        try {
            const config = { headers: getAuthHeader() };
            const response = await api.get('/slots', config);
            setSlots(response.data);
            setLoading(false);
        } catch (err) {
            setError('Unable to fetch available slots. Please try again.');
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const config = { headers: getAuthHeader() };
            const response = await api.get('/bookings/mybookings', config);
            setMyBookings(response.data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        }
    };

    const handleBookSlot = async (slotId) => {
        setProcessing(slotId);
        setError(null);
        setSuccessMsg('');

        try {
            const config = { headers: getAuthHeader() };
            await api.post('/bookings', { slotId }, config);
            setSuccessMsg('Booking confirmed! Check "My Bookings" for your QR Code.');
            fetchSlots();
            fetchMyBookings();
            setTimeout(() => {
                setActiveTab('bookings');
                setSuccessMsg('');
            }, 1500);
        } catch (err) {
            const msg = err.response?.data?.message || 'Booking failed. Try another slot.';
            setError(msg);
        } finally {
            setProcessing(null);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        setError(null);
        setSuccessMsg('');
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const config = { headers: getAuthHeader() };
            await api.put(`/bookings/${bookingId}/cancel`, {}, config);
            setSuccessMsg('Booking cancelled successfully.');
            fetchMyBookings();
            fetchSlots();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Cancellation failed';
            setError(msg);
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

    const groupedSlots = slots.reduce((acc, slot) => {
        if (!slot || !slot.startTime) return acc; // Safety check
        const date = new Date(slot.startTime).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(slot);
        return acc;
    }, {});

    const navItems = [
        { id: 'slots', label: 'Pool Slots', icon: '🏊' },
        { id: 'bookings', label: 'My Bookings', icon: '🎫' },
    ];

    return (
        <div className="min-h-screen bg-[#f8faff] flex font-sans relative overflow-x-hidden">
            {/* Mobile Menu Button (move to right) */}
            <div className="lg:hidden fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-3 bg-mg-dark text-white rounded-2xl shadow-xl border border-mg-dark active:scale-95 transition-all"
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
                ${isSidebarOpen ? 'w-72' : 'w-20'} 
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                fixed lg:sticky top-0 right-0 lg:right-auto lg:left-0 h-screen z-50
                bg-mg-dark text-white transition-all duration-300 flex flex-col
            `}>
                <div className="p-6">
                    <Logo size="md" dark showText={isSidebarOpen} />
                </div>

                <nav className="flex-1 px-4 mt-6 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-mg text-white shadow-lg'
                                : 'text-white/70 hover:bg-[#6a0000] hover:text-white'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
                        </button>
                    ))}
                    <Link
                        to="/"
                        className="w-full flex items-center gap-4 px-4 py-3 text-white/70 hover:bg-[#6a0000] hover:text-white rounded-xl transition-all"
                    >
                        <span className="text-xl">🏠</span>
                        {isSidebarOpen && <span className="font-semibold">Exit to Home</span>}
                    </Link>
                </nav>

                <div className="p-4 mt-auto">
                    <div className={`p-4 rounded-2xl bg-white/10 ${!isSidebarOpen && 'hidden'}`}>
                        <p className="text-xs text-white/70 uppercase font-black tracking-widest mb-1">Logged in as</p>
                        <p className="font-bold truncate">{user?.name}</p>
                        <p className="text-xs text-white/70 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full mt-4 flex items-center gap-4 px-4 py-3 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 rounded-xl transition-all"
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-bold">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-12 transition-all duration-300">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-12 lg:mt-0">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
                                {activeTab === 'slots' ? 'Reserve a Lane' : 'Your Schedule'}
                            </h1>
                            <p className="text-slate-500 mt-2 text-base lg:text-lg">
                                {activeTab === 'slots'
                                    ? 'Book your next swimming session easily.'
                                    : 'Manage your upcoming bookings and access codes.'}
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl">🏆</div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Status</p>
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                                        {user?.role}
                                    </span>
                                </div>
                            </div>

                            {/* My QR (click to enlarge) */}
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                                <button
                                    onClick={() => setQrModalOpen(true)}
                                    className="bg-white p-2 rounded-xl border border-slate-200 hover:border-slate-300 active:scale-95 transition"
                                    title="View QR"
                                >
                                    <QRCode value={user?.qrCode || ''} size={48} />
                                </button>
                                <div className="min-w-[160px]">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Access Code</p>
                                    <button
                                        onClick={() => {
                                            if (user?.qrCode) navigator.clipboard.writeText(user.qrCode);
                                            setSuccessMsg(user?.qrCode ? 'Code copied!' : 'No QR available');
                                            setTimeout(() => setSuccessMsg(''), 2000);
                                        }}
                                        className="text-xs font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors truncate"
                                        title={user?.qrCode || 'N/A'}
                                    >
                                        {user?.qrCode || 'N/A'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Messages */}
                    {(error || successMsg) && (
                        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 animate-slide-up ${error ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                            <span className="text-2xl">{error ? '⚠️' : '✅'}</span>
                            <p className="font-bold">{error || successMsg}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <div
                                className="w-12 h-12 border-4 border-slate-200 rounded-full animate-spin"
                                style={{ borderTopColor: 'var(--mg)' }}
                            ></div>
                            <p className="text-slate-400 font-medium">Loading your platform...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'slots' && (
                                <div className="space-y-12">
                                    {Object.keys(groupedSlots).length === 0 ? (
                                        <div className="p-10 lg:p-16 text-center glass-card rounded-[2rem] lg:rounded-[3rem] border-dashed border-slate-200">
                                            <div className="text-6xl mb-6">🗓️</div>
                                            <h3 className="text-2xl font-bold text-slate-800">No Slots Available</h3>
                                            <p className="text-slate-500 mt-2">The pool schedule hasn't been posted yet.</p>
                                        </div>
                                    ) : (
                                        Object.keys(groupedSlots).map((date) => (
                                            <section key={date}>
                                                <div className="flex items-center gap-4 mb-6">
                                                    <h3 className="text-lg lg:text-xl font-black text-slate-900 bg-white px-5 lg:px-6 py-2 rounded-2xl shadow-sm border border-slate-100 uppercase tracking-wide">
                                                        {formatDate(date)}
                                                    </h3>
                                                    <div className="flex-1 h-px bg-slate-200"></div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {groupedSlots[date].map((slot) => {
                                                        const isFull = slot.remainingSpots <= 0;
                                                        const isBooked = myBookings.some(b => b.slot && b.slot._id === slot._id && b.status !== 'cancelled');
                                                        const bookingCount = slot.bookings?.length || 0;
                                                        const capacityPercent = (bookingCount / slot.capacity) * 100;

                                                        return (
                                                            <div
                                                                key={slot._id}
                                                                className={`group relative bg-white rounded-3xl p-6 lg:p-8 border transition-all duration-300 motion-reveal motion-soft ${isFull ? 'bg-slate-50 border-slate-100' : 'border-slate-100 hover:shadow-2xl hover:-translate-y-1'}`}
                                                                data-reveal
                                                            >
                                                                {isBooked && (
                                                                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce z-10">
                                                                        ✓
                                                                    </div>
                                                                )}

                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div>
                                                                        <p className="text-2xl lg:text-3xl font-black text-slate-800">
                                                                            {formatTime(slot.startTime)}
                                                                        </p>
                                                                        <p className="text-slate-400 font-medium">To {formatTime(slot.endTime)}</p>
                                                                    </div>
                                                                    <div className={`px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isFull ? 'bg-rose-100 text-rose-600' : 'bg-[#fff0f0] text-mg'
                                                                        }`}>
                                                                        {isFull ? 'Sold Out' : 'Open'}
                                                                    </div>
                                                                </div>

                                                                <div className="mb-8">
                                                                    <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter">
                                                                        <span>Occupancy</span>
                                                                        <span>{bookingCount} / {slot.capacity}</span>
                                                                    </div>
                                                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all duration-500 ${capacityPercent > 80 ? 'bg-rose-500' : capacityPercent > 50 ? 'bg-amber-500' : 'bg-mg'
                                                                                }`}
                                                                            style={{ width: `${capacityPercent}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>

                                                                {isBooked ? (
                                                                    <button disabled className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest border border-emerald-100">
                                                                        Confirmed
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleBookSlot(slot._id)}
                                                                        disabled={isFull || slot.status !== 'open' || processing === slot._id}
                                                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all motion-soft ${isFull || slot.status !== 'open'
                                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                            : 'btn-maroon'
                                                                            }`}
                                                                    >
                                                                        {processing === slot._id ? (
                                                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                                        ) : (
                                                                            'Reserve Lane'
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <div className="space-y-8 animate-fade-in">
                                    {myBookings.length === 0 ? (
                                        <div className="p-12 lg:p-20 text-center glass-card rounded-[2rem] lg:rounded-[3rem] border-dashed border-slate-200">
                                            <div className="text-6xl mb-6">📦</div>
                                            <h3 className="text-2xl font-bold text-slate-800">No bookings yet!</h3>
                                            <p className="text-slate-500 mt-2 mb-10">Historical and upcoming reservations will appear here.</p>
                                            <button onClick={() => setActiveTab('slots')} className="btn-maroon px-8 py-3.5 rounded-2xl font-bold">Find Slots</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            {myBookings.map((booking) => (
                                                <div key={booking._id} className={`group bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row border transition-all duration-300 hover:shadow-2xl ${booking.status === 'cancelled' ? 'opacity-60 grayscale-[0.5]' : 'border-slate-100'
                                                    }`}>
                                                    <div className="p-8 lg:p-10 flex-1 flex flex-col">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                                {booking.status}
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase italic">#{booking._id.slice(-6)}</span>
                                                        </div>

                                                        <div className="mb-auto">
                                                            <p className="text-[10px] font-black text-mg uppercase tracking-widest mb-1">Schedule</p>
                                                            <p className="text-xl lg:text-2xl font-black text-slate-800 leading-tight">
                                                                {booking.slot ? formatDate(booking.slot.startTime) : 'Archived Slot'}
                                                            </p>
                                                            <p className="text-base lg:text-lg font-bold text-slate-400">
                                                                {booking.slot ? `${formatTime(booking.slot.startTime)} — ${formatTime(booking.slot.endTime)}` : 'N/A'}
                                                            </p>
                                                        </div>

                                                        {booking.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                                className="mt-8 text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest text-left"
                                                            >
                                                                Cancel Booking
                                                            </button>
                                                        )}
                                                    </div>

                                                    {booking.status === 'confirmed' && (
                                                        <div className="bg-slate-50 p-8 lg:p-10 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 min-w-[220px]">
                                                            <button
                                                                onClick={() => setQrModalOpen(true)}
                                                                className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 mb-6 transition-transform group-hover:scale-105 hover:border-slate-300 active:scale-95"
                                                                title="View QR"
                                                            >
                                                                <QRCode value={user?.qrCode || ''} size={110} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (user?.qrCode) {
                                                                        navigator.clipboard.writeText(user.qrCode);
                                                                    }
                                                                    setSuccessMsg(user?.qrCode ? 'Code copied!' : 'No QR available');
                                                                    setTimeout(() => setSuccessMsg(''), 2000);
                                                                }}
                                                                className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-mono font-bold text-slate-600 hover:bg-slate-100 transition-all truncate"
                                                            >
                                                                {user?.qrCode || 'N/A'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* QR Modal */}
            {qrModalOpen && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                    onClick={() => setQrModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setQrModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                        <div className="mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow">
                            <QRCode value={user?.qrCode || ''} size={220} />
                        </div>
                        <p className="mt-6 font-mono text-sm text-slate-700 break-all">{user?.qrCode || 'N/A'}</p>
                        <button
                            onClick={() => {
                                if (user?.qrCode) navigator.clipboard.writeText(user.qrCode);
                                setSuccessMsg(user?.qrCode ? 'Code copied!' : 'No QR available');
                                setTimeout(() => setSuccessMsg(''), 1500);
                            }}
                            className="mt-4 px-4 py-2 rounded-xl btn-primary text-xs font-black uppercase tracking-widest"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

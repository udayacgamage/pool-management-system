import React, { useState, useEffect, useRef, useCallback } from 'react';
import api, { getAuthHeader, getNotices, getHolidays, uploadProfilePic } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Logo from '../components/Logo';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toJpeg } from 'html-to-image';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [slots, setSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [notices, setNotices] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [processing, setProcessing] = useState(null);
    const [activeTab, setActiveTab] = useState('slots');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Read notices state
    const [readNotices, setReadNotices] = useState(() => {
        const saved = localStorage.getItem('readNotices');
        return saved ? JSON.parse(saved) : [];
    });

    const unreadCount = notices.filter(n => !readNotices.includes(n._id)).length;
    const qrRef = useRef(null); // Ref for Digital ID

    const toYMD = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const markAllNoticesRead = () => {
        if (notices.length === 0) return;
        const allIds = notices.map(n => n._id);
        const uniqueIds = [...new Set([...readNotices, ...allIds])];
        setReadNotices(uniqueIds);
        localStorage.setItem('readNotices', JSON.stringify(uniqueIds));
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false);
        if (tabId === 'notices') {
            markAllNoticesRead();
        }
    };

    const downloadID = useCallback(() => {
        if (qrRef.current === null) {
            return;
        }

        toJpeg(qrRef.current, { quality: 0.95, backgroundColor: 'white' })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'my-pool-id.jpeg';
                link.href = dataUrl;
                link.click();
                setSuccessMsg('ID Card downloaded!');
                setTimeout(() => setSuccessMsg(''), 2000);
            })
            .catch((err) => {
                console.error(err);
                setError('Could not download ID card');
            });
    }, [qrRef]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([fetchMyBookings(), fetchNoticesData(), fetchHolidaysData()]);
            fetchSlots(selectedDate);
            setLoading(false);
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        fetchSlots(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setQrModalOpen(false); };
        if (qrModalOpen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [qrModalOpen]);

    const fetchSlots = async (date) => {
        try {
            // Use local date, not UTC, to avoid off-by-one issues in timezones ahead of UTC.
            const dateStr = toYMD(date);
            const config = { headers: getAuthHeader() };
            const response = await api.get(`/slots?date=${dateStr}`, config);
            setSlots(response.data);
        } catch (err) {
            console.error('Slots fetch error', err);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const config = { headers: getAuthHeader() };
            const response = await api.get('/bookings/mybookings', config);
            setMyBookings(response.data);
        } catch (err) {
            console.error('Bookings fetch error', err);
        }
    };

    const fetchNoticesData = async () => {
        try {
            const response = await getNotices();
            setNotices(response.data);
        } catch (err) {
            console.error('Notices fetch error', err);
        }
    };

    const fetchHolidaysData = async () => {
        try {
            const response = await getHolidays();
            setHolidays(response.data);
        } catch (err) {
            console.error('Holidays fetch error', err);
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
            fetchSlots(selectedDate);
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

    const handleCancelBooking = async (e, bookingId) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setError(null);
        setSuccessMsg('');

        // Simple confirm check
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const config = { headers: getAuthHeader() };
            await api.put(`/bookings/${bookingId}/cancel`, {}, config);
            setSuccessMsg('Booking cancelled successfully.');

            // Optimistic update to UI for immediate feedback
            setMyBookings(prev => prev.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
            ));

            fetchSlots(selectedDate);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Cancellation failed';
            setError(msg);
        }
    };

    const handleProfileUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return setError('Please select a file first');

        const formData = new FormData();
        formData.append('profilePic', selectedFile);

        try {
            const res = await uploadProfilePic(formData);
            setSuccessMsg('Profile picture updated!');
            const updatedUser = { ...user, profilePic: res.data.filePath };
            localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), profilePic: res.data.filePath }));
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        }
    };

    const isDateDisabled = ({ date, view }) => {
        if (view !== 'month') return false;
        if (date.getDay() === 0 || date.getDay() === 6) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return true;
        const dateString = toYMD(date);
        const isHoliday = holidays.some(h => {
            const hDate = toYMD(new Date(h.date));
            return hDate === dateString;
        });
        return isHoliday;
    };

    const formatDateDisplay = (date) => {
        return date.toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const navItems = [
        { id: 'slots', label: 'Pool Slots', icon: '🏊' },
        { id: 'bookings', label: 'My Bookings', icon: '🎫' },
        { id: 'notices', label: 'Notice Board', icon: '📢' },
        { id: 'profile', label: 'My Profile', icon: '👤' },
    ];

    const baseURL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';

    return (
        <div className="h-[100dvh] md:h-screen w-screen bg-[#f8faff] flex font-sans overflow-hidden">
            <style>{`
                .react-calendar { 
                    border: none; 
                    border-radius: 1.5rem; 
                    padding: 1rem; 
                    font-family: inherit;
                    width: 100%;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
                .react-calendar__tile {
                    padding: 1rem 0.5rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                .react-calendar__tile:disabled {
                    background-color: #f3f4f6;
                    color: #d1d5db;
                }
                .react-calendar__tile--now {
                    background: #fdf2f8;
                    color: #be185d;
                }
                .react-calendar__tile--active {
                    background: var(--mg) !important;
                    color: white !important;
                }
                .react-calendar__navigation button {
                    font-size: 1.25rem;
                    font-weight: 800;
                }
            `}</style>

            <div className="lg:hidden fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-3 bg-mg-dark text-white rounded-2xl shadow-xl border border-mg-dark active:scale-95 transition-all"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <aside className={`
                ${isSidebarOpen ? 'w-72' : 'w-20'} 
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                fixed lg:relative h-full z-50 flex-shrink-0
                bg-mg-dark text-white transition-all duration-300 flex flex-col
            `}>
                <div className="p-6">
                    <Logo size="md" dark showText={isSidebarOpen} />
                </div>

                <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-mg text-white shadow-lg'
                                : 'text-white/70 hover:bg-[#6a0000] hover:text-white'
                                }`}
                        >
                            <span className="text-xl relative">
                                {item.icon}
                                {item.id === 'notices' && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-mg-dark rounded-full"></span>
                                )}
                            </span>
                            {isSidebarOpen && (
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="font-semibold">{item.label}</span>
                                    {item.id === 'notices' && unreadCount > 0 && (
                                        <span className="bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">{unreadCount}</span>
                                    )}
                                </div>
                            )}
                        </button>
                    ))}
                    <Link to="/" className="w-full flex items-center gap-4 px-4 py-3 text-white/70 hover:bg-[#6a0000] hover:text-white rounded-xl transition-all">
                        <span className="text-xl">🏠</span>
                        {isSidebarOpen && <span className="font-semibold">Exit to Home</span>}
                    </Link>
                </nav>

                <div className="p-4 mt-auto">
                    <div className={`p-4 rounded-2xl bg-white/10 ${!isSidebarOpen && 'hidden'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white/20">
                                {user?.profilePic ? (
                                    <img src={`${baseURL}${user.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-mg text-white font-bold">{user?.name?.charAt(0)}</div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-white/70 uppercase font-black tracking-widest mb-0.5">Logged in as</p>
                                <p className="font-bold truncate text-sm">{user?.name}</p>
                            </div>
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="w-full mt-3 py-2 bg-[#6a0000] hover:bg-[#800000] text-white text-xs font-bold rounded-lg uppercase tracking-widest transition-colors shadow-sm">
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 h-full overflow-y-auto p-6 lg:p-12 transition-all duration-300">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 mt-12 lg:mt-0">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight capitalize">
                                {activeTab.replace(/([A-Z])/g, ' $1').trim()}
                            </h1>
                            <p className="text-slate-500 mt-2 text-base lg:text-lg">
                                {activeTab === 'slots' ? 'Book your next swimming session.' :
                                    activeTab === 'bookings' ? 'Manage your reservations.' :
                                        activeTab === 'notices' ? 'Stay updated with latest news.' : 'Manage your digital identity.'}
                            </p>
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                                <button onClick={() => setQrModalOpen(true)} className="bg-white p-2 rounded-xl border border-slate-200 hover:border-slate-300 active:scale-95 transition" title="View Digital ID">
                                    <QRCode value={user?.qrCode || ''} size={48} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {(error || successMsg) && (
                        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-4 animate-slide-up ${error ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                            <span className="text-2xl">{error ? '⚠️' : '✅'}</span>
                            <p className="font-bold">{error || successMsg}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 gap-4">
                            <div className="w-12 h-12 border-4 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: 'var(--mg)' }}></div>
                            <p className="text-slate-400 font-medium">Loading your platform...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'slots' && (
                                <div className="space-y-12">
                                    {notices.length > 0 && (
                                        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4 mb-8">
                                            <span className="text-2xl">📢</span>
                                            <div>
                                                <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs mb-1 flex items-center gap-2">
                                                    Latest Notice
                                                    {!readNotices.includes(notices[0]._id) && (
                                                        <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm animate-pulse">NEW</span>
                                                    )}
                                                </h4>
                                                <p className="font-bold text-indigo-800">{notices[0].title}</p>
                                                <p className="text-indigo-600 text-sm mt-1 line-clamp-1">{notices[0].content}</p>
                                                <button onClick={() => handleTabChange('notices')} className="text-xs font-black uppercase text-indigo-500 hover:text-indigo-700 mt-2">Read More →</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                        <div className="xl:col-span-1">
                                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-24">
                                                <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wide">Select Date</h3>
                                                <Calendar
                                                    onChange={setSelectedDate}
                                                    value={selectedDate}
                                                    tileDisabled={isDateDisabled}
                                                    minDate={new Date()}
                                                    prev2Label={null}
                                                    next2Label={null}
                                                />
                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><div className="w-3 h-3 bg-mg rounded-full"></div>Selected</div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><div className="w-3 h-3 bg-gray-100 rounded-full"></div>Unavailable</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="xl:col-span-2 space-y-8">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-lg lg:text-xl font-black text-slate-900 bg-white px-5 lg:px-6 py-2 rounded-2xl shadow-sm border border-slate-100 uppercase tracking-wide">
                                                    {formatDateDisplay(selectedDate)}
                                                </h3>
                                                <div className="flex-1 h-px bg-slate-200"></div>
                                            </div>

                                            {slots.length === 0 ? (
                                                <div className="p-10 lg:p-16 text-center glass-card rounded-[2rem] border-dashed border-slate-200">
                                                    <div className="text-6xl mb-6">🗓️</div>
                                                    <h3 className="text-2xl font-bold text-slate-800">No Slots Available</h3>
                                                    <p className="text-slate-500 mt-2">There are no sessions scheduled for this date.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {slots.map((slot) => {
                                                        const isFull = slot.remainingSpots <= 0;
                                                        const isBooked = myBookings.some(b => b.slot && b.slot._id === slot._id && b.status !== 'cancelled');
                                                        const isStarted = new Date(slot.startTime) <= new Date();
                                                        const bookingCount = slot.bookings?.length || 0;
                                                        const capacityPercent = (bookingCount / slot.capacity) * 100;

                                                        return (
                                                            <div key={slot._id} className={`group relative bg-white rounded-3xl p-6 lg:p-8 border transition-all duration-300 motion-reveal motion-soft ${isFull ? 'bg-slate-50 border-slate-100' : 'border-slate-100 hover:shadow-2xl hover:-translate-y-1'}`}>
                                                                {isBooked && (<div className="absolute -top-3 -right-3 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce z-10">✓</div>)}
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <div><p className="text-2xl lg:text-3xl font-black text-slate-800">{formatTime(slot.startTime)}</p><p className="text-slate-400 font-medium">To {formatTime(slot.endTime)}</p></div>
                                                                    <div className={`px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isFull ? 'bg-rose-100 text-rose-600' : isStarted ? 'bg-slate-100 text-slate-500' : 'bg-[#fff0f0] text-mg'}`}>{isFull ? 'Sold Out' : isStarted ? 'Closed' : 'Open'}</div>
                                                                </div>
                                                                <div className="mb-8">
                                                                    <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-tighter"><span>Occupancy</span><span>{bookingCount} / {slot.capacity}</span></div>
                                                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5"><div className={`h-full rounded-full transition-all duration-500 ${capacityPercent > 80 ? 'bg-rose-500' : capacityPercent > 50 ? 'bg-amber-500' : 'bg-mg'}`} style={{ width: `${capacityPercent}%` }}></div></div>
                                                                </div>
                                                                {isBooked ? (<button disabled className="w-full py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-black text-xs uppercase tracking-widest border border-emerald-100">Confirmed</button>) : (<button onClick={() => handleBookSlot(slot._id)} disabled={isFull || isStarted || slot.status !== 'open' || processing === slot._id} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all motion-soft ${isFull || isStarted || slot.status !== 'open' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'btn-maroon'}`}>{processing === slot._id ? (<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>) : ('Reserve Lane')}</button>)}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                                                <div key={booking._id} className={`group bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row border transition-all duration-300 hover:shadow-2xl ${booking.status === 'cancelled' ? 'opacity-60 grayscale-[0.5]' : 'border-slate-100'}`}>
                                                    <div className="p-8 lg:p-10 flex-1 flex flex-col">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{booking.status}</div>
                                                            <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase italic">#{booking._id.slice(-6)}</span>
                                                        </div>
                                                        <div className="mb-auto">
                                                            <p className="text-[10px] font-black text-mg uppercase tracking-widest mb-1">Schedule</p>
                                                            <p className="text-xl lg:text-2xl font-black text-slate-800 leading-tight">{booking.slot ? formatDateDisplay(new Date(booking.slot.startTime)) : 'Archived Slot'}</p>
                                                            <p className="text-base lg:text-lg font-bold text-slate-400">{booking.slot ? `${formatTime(booking.slot.startTime)} — ${formatTime(booking.slot.endTime)}` : 'N/A'}</p>
                                                        </div>
                                                        {booking.status === 'confirmed' && (<button onClick={(e) => handleCancelBooking(e, booking._id)} className="mt-8 text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest text-left">Cancel Booking</button>)}
                                                    </div>
                                                    {booking.status === 'confirmed' && (
                                                        <div className="bg-slate-50 p-8 lg:p-10 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-100 min-w-[220px]">
                                                            <button onClick={() => setQrModalOpen(true)} className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 mb-6 transition-transform group-hover:scale-105 hover:border-slate-300 active:scale-95" title="View QR"><QRCode value={user?.qrCode || ''} size={110} /></button>
                                                            <button className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-mono font-bold text-slate-600 hover:bg-slate-100 transition-all truncate">{user?.qrCode || 'N/A'}</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'notices' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                    {notices.length === 0 ? (
                                        <div className="col-span-full p-10 text-center text-slate-400">No notices posted yet.</div>
                                    ) : (
                                        notices.map(n => (
                                            <div key={n._id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest ${n.type === 'Emergency' ? 'bg-rose-500' : 'bg-slate-500'}`}>{n.type}</span>
                                                    <div className="flex items-center gap-2">
                                                        {!readNotices.includes(n._id) && (
                                                            <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">NEW</span>
                                                        )}
                                                        <span className="text-[10px] text-slate-300 font-bold uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <h3 className="font-bold text-xl text-slate-800 mb-3">{n.title}</h3>
                                                <p className="text-slate-500 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl animate-fade-in">
                                    <div className="text-center mb-10">
                                        <div className="relative w-32 h-32 mx-auto mb-6 rounded-full bg-slate-100 border-4 border-white shadow-2xl overflow-hidden group">
                                            {user?.profilePic ? (
                                                <img src={`${baseURL}${user.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">👤</div>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-800">{user?.name}</h2>
                                        <p className="text-slate-400 font-mono text-sm mt-1">{user?.email}</p>
                                        <div className="flex justify-center gap-2 mt-4">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase">{user?.role}</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpload} className="space-y-6">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="text-4xl mb-2">📸</div>
                                            <p className="font-bold text-slate-700">Tap to Change Photo</p>
                                            <p className="text-xs text-slate-400 mt-1">{selectedFile ? selectedFile.name : 'Supports JPG, PNG'}</p>
                                        </div>
                                        <button disabled={!selectedFile} type="submit" className="w-full btn-maroon py-4 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                                            Update Profile Picture
                                        </button>
                                    </form>
                                </div>
                            )}


                        </>
                    )}
                </div>
            </main>

            {/* Revised Digital ID Modal */}
            {qrModalOpen && (
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={() => setQrModalOpen(false)}>
                    <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setQrModalOpen(false)} className="absolute -top-12 right-0 text-white/50 hover:text-white text-3xl font-light transition-colors">✕</button>

                        {/* ID Card Container */}
                        <div ref={qrRef} className="bg-white rounded-[2rem] overflow-hidden shadow-2xl relative">
                            {/* Decorative Background */}
                            <div className="h-32 bg-gradient-to-br from-mg to-rose-900 relative overflow-hidden">
                                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rotate-12"></div>
                                <div className="absolute bottom-[-10px] left-0 right-0 h-10 bg-white" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.5)' }}></div>
                                <div className="absolute top-6 left-0 right-0 text-center">
                                    <h2 className="text-white font-black text-xl tracking-widest uppercase opacity-90">STUDENT ID</h2>
                                    <p className="text-white/60 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Pool Management System</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-8 pb-10 pt-2 flex flex-col items-center relative z-10">
                                {/* Profile Picture */}
                                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-slate-100 -mt-16 overflow-hidden mb-5">
                                    {user?.profilePic ? (
                                        <img src={`${baseURL}${user.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-4xl text-slate-400">👤</div>
                                    )}
                                </div>

                                {/* User Details */}
                                <h3 className="text-2xl font-black text-slate-800 text-center leading-tight mb-1">{user?.name}</h3>
                                <p className="text-sm font-medium text-slate-400 mb-6">{user?.email}</p>

                                {/* QR Code Area */}
                                <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner mb-4">
                                    <QRCode value={user?.qrCode || ''} size={140} />
                                </div>
                                <p className="font-mono text-xs font-bold text-slate-400 tracking-wider mb-1">{user?.qrCode}</p>
                            </div>

                            {/* Footer Strip */}
                            <div className="h-3 bg-mg w-full"></div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex gap-3">
                            <button onClick={downloadID} className="flex-1 btn-primary py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-mg/30 flex items-center justify-center gap-2">
                                <span>⬇️</span> Download JPG
                            </button>
                            <button onClick={() => { if (user?.qrCode) navigator.clipboard.writeText(user.qrCode); setSuccessMsg('Copied!'); setTimeout(() => setSuccessMsg(''), 1500); }} className="flex-1 bg-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest text-slate-600 shadow-lg active:scale-95 transition-all">
                                Copy Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

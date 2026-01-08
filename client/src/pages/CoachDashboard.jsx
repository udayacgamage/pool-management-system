import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api, { getAuthHeader, createNotice, getNotices, updateCoachProfile, uploadProfilePic } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';

const CoachDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('roster'); // 'roster', 'scanner', 'announcements', 'profile', 'contact'

    // Match Admin dashboard shell behavior
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toYMD = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));

    // Scanner States
    const [qrInput, setQrInput] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef(null);

    // Announcements
    const [coachNotices, setCoachNotices] = useState([]);
    const [noticeLoading, setNoticeLoading] = useState(false);
    const [noticeError, setNoticeError] = useState(null);
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeSuccess, setNoticeSuccess] = useState(null);

    // Profile
    const [profileSpecialization, setProfileSpecialization] = useState(user?.specialization || '');
    const [profileSchedule, setProfileSchedule] = useState(user?.schedule || '');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(null);

    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicUploading, setProfilePicUploading] = useState(false);
    const [profilePicError, setProfilePicError] = useState(null);
    const [profilePicSuccess, setProfilePicSuccess] = useState(null);

    useEffect(() => {
        if (activeTab === 'scanner') {
            // Give DOM time to render the id="reader" element
            setTimeout(() => {
                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        'reader',
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                        },
                        /* verbose= */ false
                    );

                    scanner.render(onScanSuccess, onScanFailure);
                    scannerRef.current = scanner;
                }
            }, 100);
        } else {
            // Cleanup when switching away
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err) => console.error(err));
                scannerRef.current = null;
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((err) => console.error(err));
                scannerRef.current = null;
            }
        };
    }, [activeTab]);

    useEffect(() => {
        setProfileSpecialization(user?.specialization || '');
        setProfileSchedule(user?.schedule || '');
    }, [user?.specialization, user?.schedule]);

    const fetchCoachNotices = async () => {
        try {
            setNoticeLoading(true);
            setNoticeError(null);
            const res = await getNotices();
            const all = Array.isArray(res.data) ? res.data : [];
            setCoachNotices(all.filter((n) => n?.type === 'Coach'));
        } catch (err) {
            setNoticeError(err.response?.data?.message || 'Unable to load announcements.');
        } finally {
            setNoticeLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'announcements') {
            fetchCoachNotices();
        }
    }, [activeTab]);

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setNoticeError(null);
        setNoticeSuccess(null);

        if (!noticeTitle.trim() || !noticeContent.trim()) {
            setNoticeError('Title and content are required.');
            return;
        }

        try {
            setNoticeLoading(true);
            await createNotice({
                title: noticeTitle.trim(),
                content: noticeContent.trim(),
                type: 'Coach',
            });
            setNoticeTitle('');
            setNoticeContent('');
            setNoticeSuccess('Announcement posted.');
            await fetchCoachNotices();
        } catch (err) {
            setNoticeError(err.response?.data?.message || 'Failed to post announcement.');
        } finally {
            setNoticeLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileError(null);
        setProfileSuccess(null);

        try {
            setProfileSaving(true);
            const res = await updateCoachProfile({
                specialization: profileSpecialization,
                schedule: profileSchedule,
            });

            // Keep localStorage in sync so UI updates immediately.
            const updated = res.data;
            const existing = JSON.parse(localStorage.getItem('user') || 'null');
            if (existing) {
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        ...existing,
                        specialization: updated?.specialization ?? profileSpecialization,
                        schedule: updated?.schedule ?? profileSchedule,
                    })
                );
            }

            setProfileSuccess('Profile updated.');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleProfilePicUpload = async (e) => {
        e.preventDefault();
        setProfilePicError(null);
        setProfilePicSuccess(null);

        if (!profilePicFile) {
            setProfilePicError('Please select a photo first.');
            return;
        }

        const formData = new FormData();
        formData.append('profilePic', profilePicFile);

        try {
            setProfilePicUploading(true);
            const res = await uploadProfilePic(formData);
            const filePath = res?.data?.filePath;

            if (!filePath) {
                throw new Error('Upload succeeded but no file path was returned.');
            }

            updateUser({ profilePic: filePath });
            setProfilePicFile(null);
            setProfilePicSuccess('Profile photo updated.');
        } catch (err) {
            setProfilePicError(err?.response?.data?.message || err?.message || 'Failed to upload profile photo.');
        } finally {
            setProfilePicUploading(false);
        }
    };

    const onScanSuccess = async (decodedText, decodedResult) => {
        if (scanning) return; // Prevent multiple scans while processing
        setScanning(true);

        // Pause scanner UI roughly by clearing logic or just ignoring
        if (scannerRef.current) {
            scannerRef.current.pause();
        }

        await handleVerify(null, decodedText);

        // Auto-restart after 3 seconds
        setTimeout(() => {
            setScanResult(null);
            setError(null);
            setScanning(false);
            if (scannerRef.current) {
                scannerRef.current.resume();
            }
        }, 3000);
    };

    const onScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const handleVerify = async (e, directCode) => {
        if (e) e.preventDefault();
        const code = directCode || qrInput;
        if (!code) return;

        setError(null);
        setScanResult(null);
        setLoading(true);

        try {
            const config = { headers: getAuthHeader() };
            const response = await api.post('/bookings/verify', { qrCodeData: code }, config);
            setScanResult(response.data);
            setQrInput('');
            // Refresh roster to show updated attendance
            if (activeTab === 'roster') fetchDailySchedule(selectedDate);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification Failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailySchedule(selectedDate);
    }, [selectedDate]);

    const fetchDailySchedule = async (date) => {
        try {
            setLoading(true);
            const config = { headers: getAuthHeader() };
            const response = await api.get(`/slots/today?date=${date}`, config);
            setSlots(response.data);
            setLoading(false);
        } catch (err) {
            setError('Unable to fetch schedule for this date.');
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateDisplay = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const escapeCsvCell = (value) => {
        const s = value === null || value === undefined ? '' : String(value);
        if (/[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
    };

    const downloadRosterCsv = () => {
        if (!slots || slots.length === 0) return;

        const lines = [];
        lines.push(
            [
                'Date',
                'Slot Start',
                'Slot End',
                'Slot Status',
                'Capacity',
                'Booking Count',
                'Student Name',
                'Student Email',
                'Student ID',
                'QR Code',
            ]
                .map(escapeCsvCell)
                .join(',')
        );

        for (const slot of slots) {
            const slotDate = toYMD(new Date(slot.startTime));
            const start = formatTime(slot.startTime);
            const end = formatTime(slot.endTime);
            const status = slot.status || '';
            const capacity = slot.capacity ?? '';
            const bookingCount = slot.bookings?.length ?? 0;

            if (slot.bookings && slot.bookings.length > 0) {
                for (const student of slot.bookings) {
                    lines.push(
                        [
                            slotDate,
                            start,
                            end,
                            status,
                            capacity,
                            bookingCount,
                            student?.name || '',
                            student?.email || '',
                            student?.studentId || '',
                            student?.qrCode || '',
                        ]
                            .map(escapeCsvCell)
                            .join(',')
                    );
                }
            } else {
                lines.push(
                    [slotDate, start, end, status, capacity, bookingCount, '', '', '', '']
                        .map(escapeCsvCell)
                        .join(',')
                );
            }
        }

        const csv = lines.join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `coach_roster_${selectedDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const baseURL = import.meta.env.VITE_API_BASE_URL
        ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
        : 'http://localhost:5000';

    const sideItems = [
        { id: 'roster', label: 'Daily Roster', icon: '📅' },
        { id: 'scanner', label: 'Attendance', icon: '🔎' },
        { id: 'announcements', label: 'Announcements', icon: '📢' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'contact', label: 'Contact', icon: '✉️' },
    ];

    const handleNav = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="h-[100dvh] md:h-screen w-screen bg-[#fafbfc] flex font-sans overflow-hidden">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-3 bg-[#5a0000] text-white rounded-2xl shadow-xl border border-[#5a0000] active:scale-95 transition-all"
                    aria-label="Toggle menu"
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
            <aside
                className={`
                ${isSidebarOpen ? 'w-72' : 'w-24'} 
                ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                fixed lg:relative h-full z-50 flex-shrink-0
                bg-[#5a0000] text-white transition-all duration-300 flex flex-col
            `}
            >
                <div className="p-8 border-b border-slate-800/50">
                    <Logo size="md" dark showText={isSidebarOpen} />
                </div>

                <nav className="flex-1 px-4 mt-8 space-y-2 text-[10px] font-black uppercase tracking-widest overflow-y-auto custom-scrollbar">
                    {sideItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNav(item.id)}
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
                        to="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all text-slate-400 hover:bg-[#6a0000]/50 hover:text-white"
                    >
                        <span className="text-xl">🏠</span>
                        {isSidebarOpen && <span>Exit to Home</span>}
                    </Link>
                </nav>

                <div className="p-6 mt-auto">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center gap-4 px-4 py-4 text-white/60 hover:bg-white/10 hover:text-white rounded-2xl transition-all"
                    >
                        <span className="text-xl">{isSidebarOpen ? '⬅️' : '➡️'}</span>
                        {isSidebarOpen && <span className="font-bold">Collapse</span>}
                    </button>

                    {isSidebarOpen && (
                        <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                            <p className="text-xs font-black uppercase tracking-widest text-white/60">Signed in as</p>
                            <div className="mt-3 flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                    {user?.profilePic ? (
                                        <img
                                            src={`${baseURL}${user.profilePic}`}
                                            alt={user?.name || 'Coach'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-black text-white/80">
                                            {(user?.name || 'C').charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <p className="font-bold text-white truncate">{user?.name || 'Coach'}</p>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-1 truncate">
                                {user?.specialization ? `${user.specialization} Coach` : 'Coach Portal'}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="mt-4 w-full flex items-center gap-4 px-4 py-4 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-2xl transition-all"
                    >
                        <span className="text-xl">🚪</span>
                        {isSidebarOpen && <span className="font-bold">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto p-6 lg:p-10 scroll-smooth">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight capitalize">
                            {activeTab === 'roster'
                                ? 'Roster'
                                : activeTab === 'scanner'
                                    ? 'Scanner'
                                    : activeTab === 'announcements'
                                        ? 'Announcements'
                                        : activeTab === 'profile'
                                            ? 'Profile'
                                            : 'Contact'}
                        </h2>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest italic">Coach Portal</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => handleNav('roster')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'roster'
                                ? 'bg-white border border-slate-200 shadow-sm text-slate-800'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white'
                                }`}
                        >
                            Daily Roster
                        </button>
                        <button
                            onClick={() => handleNav('scanner')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'scanner'
                                ? 'bg-white border border-slate-200 shadow-sm text-slate-800'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white'
                                }`}
                        >
                            Attendance
                        </button>
                        <button
                            onClick={() => handleNav('announcements')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'announcements'
                                ? 'bg-white border border-slate-200 shadow-sm text-slate-800'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white'
                                }`}
                        >
                            Announcements
                        </button>
                        <button
                            onClick={() => handleNav('profile')}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile'
                                ? 'bg-white border border-slate-200 shadow-sm text-slate-800'
                                : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white'
                                }`}
                        >
                            Profile
                        </button>
                    </div>
                </header>

                {error && activeTab === 'roster' && (
                    <div className="mb-8 p-5 rounded-2xl flex items-center gap-4 border bg-rose-50 text-rose-700 border-rose-100">
                        <span className="text-xl">🚫</span>
                        <p className="font-black text-[10px] uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {activeTab === 'scanner' && (
                    <div className="animate-fade-in max-w-2xl mx-auto">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-slate-800 mb-2">Attendance Scanner</h1>
                            <p className="text-slate-500">Scan student QR code or enter manually.</p>
                        </div>

                        {/* Scanner UI */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 mb-8">
                            <div id="reader" className="rounded-xl overflow-hidden mb-6"></div>

                            <div className="text-center mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase">OR ENTER MANUALLY</p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-4">
                                <input
                                    type="text"
                                    value={qrInput}
                                    onChange={(e) => setQrInput(e.target.value)}
                                    placeholder="Enter Code"
                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20 transition-all uppercase"
                                />
                                <button type="submit" disabled={loading} className="w-full btn-maroon h-14 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-mg/20">
                                    {loading ? 'Verifying...' : 'Check Attendance'}
                                </button>
                            </form>
                        </div>

                        {/* Results Overlay (Fixed Position or Inline) */}
                        {scanResult && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                                <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full mx-6 shadow-2xl text-center border-4 border-emerald-100">
                                    <div className="w-24 h-24 rounded-full bg-emerald-100 mx-auto flex items-center justify-center text-5xl mb-6 shadow-inner">✅</div>
                                    <h3 className="text-2xl font-black text-emerald-800 mb-2">Access Granted</h3>
                                    <p className="text-lg font-bold text-slate-700 mb-1">{scanResult.user}</p>
                                    <p className="font-mono text-sm text-slate-400 mb-6">{scanResult.slot}</p>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full bg-emerald-500 animate-[progress_3s_linear_forwards]"></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Next scan in 3s...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                                <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full mx-6 shadow-2xl text-center border-4 border-rose-100">
                                    <div className="w-24 h-24 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-5xl mb-6 shadow-inner">🚫</div>
                                    <h3 className="text-2xl font-black text-rose-800 mb-2">Access Denied</h3>
                                    <p className="text-lg font-bold text-slate-700 mb-6">{error}</p>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full bg-rose-500 animate-[progress_3s_linear_forwards]"></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Retrying in 3s...</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'roster' && (
                    <>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-800">Daily Roster</h1>
                                <p className="text-slate-500 mt-2 font-medium">{formatDateDisplay(selectedDate)}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label htmlFor="roster-date" className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Select Date:
                                </label>
                                <input
                                    id="roster-date"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20"
                                />
                                <button
                                    type="button"
                                    onClick={downloadRosterCsv}
                                    disabled={loading || !slots || slots.length === 0}
                                    className="btn-maroon h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-mg/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download roster as CSV"
                                >
                                    Download CSV
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div
                                    className="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin"
                                    style={{ borderTopColor: 'var(--mg)' }}
                                ></div>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="p-10 lg:p-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                                <div className="text-6xl mb-6">🗓️</div>
                                <h3 className="text-2xl font-bold text-slate-800">No Slots Available</h3>
                                <p className="text-slate-500 mt-2">There are no sessions scheduled for this date.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {slots.map((slot) => {
                                    const bookingCount = slot.bookings?.length || 0;
                                    const capacityPercent = (bookingCount / slot.capacity) * 100;

                                    return (
                                        <div
                                            key={slot._id}
                                            className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span
                                                            className={`w-3 h-3 rounded-full ${slot.status === 'open'
                                                                ? 'bg-emerald-500 animate-pulse'
                                                                : 'bg-slate-300'
                                                                }`}
                                                        ></span>
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                            {slot.status === 'open' ? 'Active Session' : slot.status}
                                                        </p>
                                                    </div>
                                                    <h3 className="text-3xl font-black text-slate-800">
                                                        {formatTime(slot.startTime)}{' '}
                                                        <span className="text-slate-300 font-light">-</span>{' '}
                                                        {formatTime(slot.endTime)}
                                                    </h3>
                                                </div>
                                                <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 min-w-[180px]">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                        Attendance
                                                    </p>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-3xl font-black text-slate-800">{bookingCount}</span>
                                                        <span className="text-sm font-bold text-slate-400 mb-1">/ {slot.capacity}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${capacityPercent > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                                                                }`}
                                                            style={{ width: `${capacityPercent}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 pt-6">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                                    Registered Swimmers
                                                </h4>
                                                {slot.bookings && slot.bookings.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {slot.bookings.map((student) => (
                                                            <div
                                                                key={student._id}
                                                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all group"
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                                    {student.profilePic ? (
                                                                        <img
                                                                            src={`${baseURL}${student.profilePic}`}
                                                                            alt={student.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-slate-600">
                                                                            {student.name.charAt(0)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-sm font-bold text-slate-700 truncate">{student.name}</p>
                                                                    <p className="text-[10px] font-medium text-slate-400 truncate">
                                                                        {student.studentId || 'No ID'} • {student.email}
                                                                    </p>
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
                    </>
                )}

                {activeTab === 'announcements' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-2">Post an Announcement</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                This will appear in the student notices feed as a Coach notice.
                            </p>

                            {noticeError && (
                                <div className="mb-6 p-4 rounded-2xl border bg-rose-50 text-rose-700 border-rose-100">
                                    <p className="font-black text-[10px] uppercase tracking-widest">{noticeError}</p>
                                </div>
                            )}
                            {noticeSuccess && (
                                <div className="mb-6 p-4 rounded-2xl border bg-emerald-50 text-emerald-800 border-emerald-100">
                                    <p className="font-black text-[10px] uppercase tracking-widest">{noticeSuccess}</p>
                                </div>
                            )}

                            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                <input
                                    value={noticeTitle}
                                    onChange={(e) => setNoticeTitle(e.target.value)}
                                    placeholder="Title"
                                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20"
                                />
                                <textarea
                                    value={noticeContent}
                                    onChange={(e) => setNoticeContent(e.target.value)}
                                    placeholder="Write your message..."
                                    rows={5}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20"
                                />
                                <button
                                    type="submit"
                                    disabled={noticeLoading}
                                    className="btn-maroon h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-mg/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {noticeLoading ? 'Posting...' : 'Post Announcement'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <h3 className="text-xl font-black text-slate-800">Recent Coach Notices</h3>
                                <button
                                    type="button"
                                    onClick={fetchCoachNotices}
                                    disabled={noticeLoading}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50"
                                >
                                    Refresh
                                </button>
                            </div>

                            {noticeLoading ? (
                                <div className="flex justify-center py-10">
                                    <div
                                        className="w-10 h-10 border-4 border-slate-200 rounded-full animate-spin"
                                        style={{ borderTopColor: 'var(--mg)' }}
                                    ></div>
                                </div>
                            ) : coachNotices.length === 0 ? (
                                <div className="p-10 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                    <div className="text-5xl mb-4">📢</div>
                                    <p className="text-slate-600 font-bold">No coach notices yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {coachNotices.map((n) => (
                                        <div key={n._id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                <h4 className="text-lg font-black text-slate-800">{n.title}</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                                                </p>
                                            </div>
                                            <p className="text-slate-600 mt-2 whitespace-pre-wrap">{n.content}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-3">
                                                Posted by {n.postedByName || 'Coach'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-2">Coach Profile</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Update your specialization and availability.
                            </p>

                            <div className="mb-8 p-6 rounded-[2rem] bg-slate-50 border border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                        {user?.profilePic ? (
                                            <img
                                                src={`${baseURL}${user.profilePic}`}
                                                alt={user?.name || 'Coach'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-black text-slate-600">
                                                {(user?.name || 'C').charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-800 truncate">{user?.name || 'Coach'}</p>
                                        <p className="text-xs font-bold text-slate-500 truncate">{user?.email || ''}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                            Profile Photo
                                        </p>
                                    </div>
                                </div>

                                {profilePicError && (
                                    <div className="mt-5 p-4 rounded-2xl border bg-rose-50 text-rose-700 border-rose-100">
                                        <p className="font-black text-[10px] uppercase tracking-widest">{profilePicError}</p>
                                    </div>
                                )}
                                {profilePicSuccess && (
                                    <div className="mt-5 p-4 rounded-2xl border bg-emerald-50 text-emerald-800 border-emerald-100">
                                        <p className="font-black text-[10px] uppercase tracking-widest">{profilePicSuccess}</p>
                                    </div>
                                )}

                                <form onSubmit={handleProfilePicUpload} className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            setProfilePicError(null);
                                            setProfilePicSuccess(null);
                                            setProfilePicFile(e.target.files?.[0] || null);
                                        }}
                                        className="w-full sm:flex-1 h-12 bg-white border border-slate-200 rounded-xl px-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20"
                                    />
                                    <button
                                        type="submit"
                                        disabled={profilePicUploading}
                                        className="btn-maroon h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-mg/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {profilePicUploading ? 'Uploading...' : 'Upload Photo'}
                                    </button>
                                </form>
                            </div>

                            {profileError && (
                                <div className="mb-6 p-4 rounded-2xl border bg-rose-50 text-rose-700 border-rose-100">
                                    <p className="font-black text-[10px] uppercase tracking-widest">{profileError}</p>
                                </div>
                            )}
                            {profileSuccess && (
                                <div className="mb-6 p-4 rounded-2xl border bg-emerald-50 text-emerald-800 border-emerald-100">
                                    <p className="font-black text-[10px] uppercase tracking-widest">{profileSuccess}</p>
                                </div>
                            )}

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Specialization
                                    </label>
                                    <input
                                        value={profileSpecialization}
                                        onChange={(e) => setProfileSpecialization(e.target.value)}
                                        placeholder="e.g., Swimming Instructor"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Availability / Schedule
                                    </label>
                                    <input
                                        value={profileSchedule}
                                        onChange={(e) => setProfileSchedule(e.target.value)}
                                        placeholder="e.g., Mon - Fri"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={profileSaving}
                                    className="btn-maroon h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-mg/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {profileSaving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                            <h3 className="text-xl font-black text-slate-800 mb-2">Contact</h3>
                            <p className="text-slate-500 text-sm mb-6">Use the landing page contact form to message the admin team.</p>
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = '/#contact';
                                }}
                                className="btn-maroon h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-mg/20"
                            >
                                Go to Contact Form
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoachDashboard;

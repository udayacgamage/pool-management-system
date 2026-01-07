import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api, { getAuthHeader } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';

const CoachDashboard = () => {
    const { user, logout } = useAuth();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('roster'); // 'roster', 'scanner'
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

    useEffect(() => {
        if (activeTab === 'scanner') {
            // Give DOM time to render the id="reader" element
            setTimeout(() => {
                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
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
                scannerRef.current.clear().catch(err => console.error(err));
                scannerRef.current = null;
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error(err));
                scannerRef.current = null;
            }
        };
    }, [activeTab]);

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

    const baseURL = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';

    return (
        <div className="min-h-screen bg-[#f0f4f8] font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-auto py-4 md:py-0 md:h-20 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                    <Logo size="md" />
                    <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('roster')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'roster' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Roster
                            </button>
                            <button
                                onClick={() => setActiveTab('scanner')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'scanner' ? 'bg-white shadow-sm text-mg' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Scanner
                            </button>
                        </div>

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
                                <p className="text-slate-500 mt-2 font-medium">
                                    {formatDateDisplay(selectedDate)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label htmlFor="roster-date" className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Date:</label>
                                <input
                                    id="roster-date"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-mg/20"
                                />
                            </div>
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
                                <h3 className="text-xl font-bold text-slate-700">No Sessions Scheduled</h3>
                                <p className="text-slate-400 mt-2">There are no pool slots scheduled for this date.</p>
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
                                                        <span className={`w-3 h-3 rounded-full ${slot.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{slot.status === 'open' ? 'Active Session' : slot.status}</p>
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
                                                            <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                                                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                                    {student.profilePic ? (
                                                                        <img src={`${baseURL}${student.profilePic}`} alt={student.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-xs font-bold text-slate-600">{student.name.charAt(0)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <p className="text-sm font-bold text-slate-700 truncate">{student.name}</p>
                                                                    <p className="text-[10px] font-medium text-slate-400 truncate">{student.studentId || 'No ID'} • {student.email}</p>
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
            </main>
        </div>
    );
};

export default CoachDashboard;

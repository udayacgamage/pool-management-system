import React, { useState, useEffect, useRef } from 'react';
import api, { getAuthHeader } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const QRScanner = () => {
    const { user, logout } = useAuth();
    const [qrInput, setQrInput] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cameraSupported, setCameraSupported] = useState(false);
    const [useCamera, setUseCamera] = useState(false);
    const [scanning, setScanning] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const detectorRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        setCameraSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        try {
            setError(null);
            setScanResult(null);
            // Request camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            // Init barcode detector
            detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
            setScanning(true);
            const loop = async () => {
                if (!detectorRef.current || !videoRef.current) return;
                try {
                    const codes = await detectorRef.current.detect(videoRef.current);
                    if (codes && codes.length > 0) {
                        const value = codes[0].rawValue;
                        setQrInput(value);
                        await handleVerify(); // Auto-verify on detection
                        stopScanner();
                        return;
                    }
                } catch (e) {
                    // ignore transient detection errors
                }
                rafRef.current = requestAnimationFrame(loop);
            };
            rafRef.current = requestAnimationFrame(loop);
        } catch (e) {
            setError('Camera unavailable or permission denied');
            setUseCamera(false);
            stopScanner();
        }
    };

    const stopScanner = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        detectorRef.current = null;
        setScanning(false);
    };

    const toggleCamera = async () => {
        if (!useCamera) {
            setUseCamera(true);
            await startScanner();
        } else {
            setUseCamera(false);
            stopScanner();
        }
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        setScanResult(null);
        setLoading(true);

        try {
            const config = { headers: getAuthHeader() };
            const response = await api.post('/bookings/verify', {
                qrCodeData: qrInput
            }, config);

            setScanResult(response.data);
            setQrInput('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Security Verification Offline';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050914] text-slate-200 font-sans selection:bg-primary-500/30">
            {/* Header / Nav */}
            <nav className="border-b border-white/5 bg-white/5 backdrop-blur-2xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Logo size="md" dark />
                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-white leading-none capitalize">{user?.name}</p>
                            <p className="text-xs font-black text-primary-500 uppercase tracking-widest mt-1">
                                {user?.role === 'coach' ? 'Head Coach' : 'Verification Officer'}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/10 hover:border-rose-500/30"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-xl mx-auto px-6 pt-16 pb-24">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-4 italic">Security Clearance</h1>
                    <p className="text-slate-500 font-medium">Position the candidate's QR code or enter the digital reference index to verify identity and facility access status.</p>
                </div>

                {/* Input Console */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-primary-400 to-secondary-500 rounded-[2.5rem] blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-[#0d1221] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-10">
                            {/* Camera controls */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Verification Console</div>
                                {cameraSupported && (
                                    <button
                                        type="button"
                                        onClick={toggleCamera}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all motion-soft ${useCamera ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {useCamera ? 'Stop Camera' : 'Scan with Camera'}
                                    </button>
                                )}
                            </div>

                            {/* Live camera preview */}
                            {useCamera && (
                                <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
                                    <video ref={videoRef} className="w-full aspect-video object-cover" muted playsInline />
                                    {scanning && (
                                        <div className="p-3 bg-black/40 text-center text-[10px] font-black uppercase tracking-widest animate-pulse-slow">Scanning...</div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label htmlFor="qrInput" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Detection Terminal</label>
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                            <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        id="qrInput"
                                        autoFocus={!useCamera}
                                        required
                                        className="block w-full h-20 bg-black/40 border-2 border-slate-800/50 rounded-2xl text-white placeholder-slate-700 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-2xl font-black tracking-[0.2em] text-center transition-all outline-none"
                                        placeholder={cameraSupported ? 'Scan or paste code' : 'Enter code'}
                                        value={qrInput}
                                        onChange={(e) => setQrInput(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !qrInput}
                                    className={`w-full group/btn relative h-16 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all overflow-hidden motion-soft
                                        ${loading || !qrInput
                                            ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5'
                                            : 'btn-maroon'
                                        }
                                    `}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Authenticate Entry <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                        </span>
                                    )}
                                </button>
                            </form>
                        </div>
                        {/* High-tech detailing */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
                    </div>
                </div>

                {/* Feedback Hub */}
                <div className="mt-12 space-y-6">
                    {error && (
                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-[2rem] p-8 text-center animate-shake backdrop-blur-sm">
                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl text-rose-500 leading-none italic">✕</span>
                            </div>
                            <h3 className="text-xl font-black text-rose-500 mb-2 uppercase tracking-tighter italic font-heading">Unauthorized Access</h3>
                            <p className="text-slate-400 font-bold text-sm tracking-tight">{error}</p>
                            <div className="mt-6 flex justify-center gap-2">
                                <div className="h-1 w-8 bg-rose-500 rounded-full"></div>
                                <div className="h-1 w-2 bg-rose-500 opacity-30 rounded-full"></div>
                                <div className="h-1 w-2 bg-rose-500 opacity-10 rounded-full"></div>
                            </div>
                        </div>
                    )}

                    {scanResult && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8 animate-fade-in backdrop-blur-sm">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-4xl text-emerald-500">✓</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter italic font-heading">Clearance Confirmed</h3>
                                        <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full">Validated</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-8">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Affiliation</p>
                                            <p className="text-lg font-black text-white tracking-tight truncate uppercase italic">{scanResult.user}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Slot Reference</p>
                                            <p className="text-lg font-black text-cyan-400 tracking-tight font-mono">{scanResult.slot.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Control Bridge Footer */}
                <div className="mt-12 text-center">
                    <Link 
                        to={user?.role === 'admin' ? "/admin" : user?.role === 'coach' ? "/coach" : "/"} 
                        className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-primary-500 transition-colors py-4 px-8 border border-white/5 rounded-full inline-block group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform inline-block mr-1">←</span> 
                        {user?.role === 'staff' ? 'Return Home' : 'Return to Dashboard'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;


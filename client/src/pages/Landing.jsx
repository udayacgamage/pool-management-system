import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import poolView from '../assets/gallery/pool_view.jpg';
import poolAction from '../assets/gallery/pool_action.jpg';
import poolLanes from '../assets/gallery/pool_lanes.jpg';
import poolStarting from '../assets/gallery/pool_starting.jpg';

const Landing = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen font-sans">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Logo />
                        <div className="hidden md:flex items-center space-x-10 text-xs font-black uppercase tracking-[0.2em]">
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-slate-600 hover:text-primary-700 transition-colors"
                            >
                                Home
                            </button>
                            <a href="#features" className="text-slate-600 hover:text-primary-700 transition-colors">Infrastructure</a>
                            <a href="#about" className="text-slate-600 hover:text-primary-700 transition-colors">Guidelines</a>
                            <a href="#gallery" className="text-slate-600 hover:text-primary-700 transition-colors">Gallery</a>
                        </div>
                        <div className="flex items-center gap-4">
                            {user ? (
                                <Link to={user.role === 'admin' ? "/admin" : "/dashboard"} className="btn-primary">
                                    {user.role === 'admin' ? "Admin" : "Student"} Portal
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="text-xs font-black uppercase tracking-widest text-primary-700 hover:text-primary-800 transition-colors">Sign In</Link>
                                    <Link to="/register" className="btn-primary !px-6 !py-2.5 !text-xs uppercase tracking-[0.2em]">GET STARTED</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden bg-[#fafcff]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[10%] left-[-5%] w-[500px] h-[500px] bg-secondary-100/30 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-10">
                        <Logo size="xl" showText={false} className="animate-fade-in hover:rotate-6 transition-transform duration-500" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white shadow-xl shadow-primary-900/10 text-primary-700 rounded-full text-xs font-black mb-10 animate-fade-in border border-primary-50 uppercase tracking-[0.2em] italic">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Online: Semester 2 Bookings Open
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-8 animate-slide-up">
                        USJ <span className="text-primary-700">AQUATIC</span> <br />
                        MANAGEMENT
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-medium mb-12 animate-slide-up leading-relaxed">
                        Official pool management portal for the University of Sri Jayewardenepura.
                        Digitalizing aquatic facility access for students and faculty.
                    </p>
                    <div className="flex justify-center flex-col sm:flex-row gap-6 animate-slide-up">
                        <Link to={user ? "/dashboard" : "/login"} className="btn-primary !px-12 !py-5 !text-lg uppercase tracking-widest bg-primary-700 shadow-2xl shadow-primary-700/30 hover:shadow-primary-700/50">
                            Book Your Slot
                        </Link>
                        <a href="#features" className="btn-secondary !px-12 !py-5 !text-lg uppercase tracking-widest border-slate-200">
                            Explore Facility
                        </a>
                    </div>
                </div>
            </section>

            {/* Visual Infrastructure Display (Gallery) */}
            <section id="gallery" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[250px]">
                        <div className="lg:col-span-2 lg:row-span-2 rounded-[2.5rem] overflow-hidden group relative shadow-2xl">
                            <img src={poolView} alt="USJ Pool Overview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex flex-col justify-end">
                                <h4 className="text-white text-2xl font-black uppercase tracking-tighter italic">Olympic Standard</h4>
                                <p className="text-white/70 text-sm font-bold">Largest government university pool in Sri Lanka.</p>
                            </div>
                        </div>
                        <div className="rounded-[2rem] overflow-hidden group relative">
                            <img src={poolAction} alt="USJ Pool Action" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        </div>
                        <div className="lg:row-span-2 rounded-[2rem] overflow-hidden group relative shadow-xl">
                            <img src={poolLanes} alt="USJ Pool Lanes" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-[10px] font-black uppercase tracking-[0.2em]">International Specs</p>
                            </div>
                        </div>
                        <div className="rounded-[2rem] overflow-hidden group relative">
                            <img src={poolStarting} alt="USJ Pool Starting" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-slate-50 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-700/5 -skew-x-12 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
                        <div className="max-w-xl">
                            <p className="text-primary-700 text-[10px] font-black uppercase tracking-[0.4em] mb-4 italic">Next-gen management</p>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">PREMIER AQUATIC <br />EXPERIENCE.</h2>
                        </div>
                        <div className="hidden lg:block w-32 h-1.5 bg-secondary-500 rounded-full mb-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Dynamic Reservation', desc: 'Secure your lane through our real-time occupancy mesh. Instant scheduling for peak university performance.', icon: '⚡', highlight: 'border-primary-500/10' },
                            { title: 'Digital Clearance', desc: 'Contactless verification protocol using encrypted QR identities. Enter the facility with professional speed.', icon: '📱', highlight: 'border-amber-500/10' },
                            { title: 'Capacity Intelligence', desc: 'Smart analytics monitoring pool load and high-demand windows. Plan your session with precision data.', icon: '📊', highlight: 'border-emerald-500/10' },
                        ].map((feature, idx) => (
                            <div key={idx} className={`p-10 lg:p-12 rounded-[2.5rem] bg-white border ${feature.highlight} shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all group group`}>
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-10 group-hover:bg-primary-700 group-hover:text-white transition-all duration-500 shadow-inner">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tighter italic font-heading">{feature.title}</h3>
                                <p className="text-slate-400 font-bold text-base leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Full Facility Specs Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-primary-900 rounded-[3rem] p-10 lg:p-20 overflow-hidden relative">
                        {/* Graphic Elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 opacity-20"></div>

                        <div className="relative flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 text-white">
                                <span className="inline-block px-4 py-2 bg-secondary-500 text-primary-900 text-[10px] font-black uppercase tracking-widest rounded-full mb-8 italic">World-Class Specifications</span>
                                <h2 className="text-4xl lg:text-5xl font-black mb-10 leading-tight">PRO-FEEL <br />INFRASTRUCTURE.</h2>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="border-l-2 border-primary-700 pl-6 py-2">
                                        <p className="text-primary-300 text-[10px] font-black uppercase tracking-widest mb-1">Length</p>
                                        <p className="text-3xl font-black italic">50.0m</p>
                                    </div>
                                    <div className="border-l-2 border-primary-700 pl-6 py-2">
                                        <p className="text-primary-300 text-[10px] font-black uppercase tracking-widest mb-1">Width</p>
                                        <p className="text-3xl font-black italic">25.0m</p>
                                    </div>
                                    <div className="border-l-2 border-primary-700 pl-6 py-2">
                                        <p className="text-primary-300 text-[10px] font-black uppercase tracking-widest mb-1">Depth</p>
                                        <p className="text-3xl font-black italic">1.3 - 2.0m</p>
                                    </div>
                                    <div className="border-l-2 border-primary-700 pl-6 py-2">
                                        <p className="text-primary-300 text-[10px] font-black uppercase tracking-widest mb-1">Type</p>
                                        <p className="text-3xl font-black italic">Semi-Olympic</p>
                                    </div>
                                </div>

                                <div className="mt-12 inline-flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <div className="text-3xl">🏆</div>
                                    <div>
                                        <p className="text-white font-black text-sm uppercase tracking-tighter">Gold Standard Certification</p>
                                        <p className="text-primary-300 text-[10px] font-bold">Largest swimming pool in a Sri Lankan government university</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full relative">
                                <div className="aspect-square bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl overflow-hidden group">
                                    <img src={poolView} alt="USJ Pool Feature" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[2s]" />
                                    <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-primary-900 to-transparent text-white">
                                        <p className="text-white text-xl font-black italic uppercase tracking-tighter">Official University Training Grounds</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works / Instructions */}
            <section id="about" className="py-32 bg-[#050914] text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-24">
                        <p className="text-primary-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4 italic">Protocol</p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase">How to Secure Access</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-0 right-0 h-0.5 bg-white/5 -z-10"></div>

                        {[
                            { step: '01', title: 'Authenticate', desc: 'Sign in with your university credentials and complete your biometric profile.' },
                            { step: '02', title: 'Reserve Window', desc: 'Choose your desired session from the real-time availability mesh.' },
                            { step: '03', title: 'Execute Entry', desc: 'Generate your digital access token and present it at the gate terminal.' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group">
                                <div className="w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center bg-[#0d1221] group-hover:border-primary-500 group-hover:bg-primary-900 transition-all duration-500 shadow-2xl mb-10">
                                    <span className="text-3xl font-black text-white italic">{item.step}</span>
                                </div>
                                <h4 className="text-xl font-black uppercase tracking-widest mb-4 italic group-hover:text-primary-400 transition-colors tracking-tight">{item.title}</h4>
                                <p className="text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pool Rules Section */}
            <section id="rules" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-card p-12 rounded-[2.5rem] border-primary-100 flex flex-col md:flex-row items-center gap-12 bg-primary-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-700 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                        <div className="z-10 flex-1">
                            <h2 className="text-4xl font-black mb-6">Important Pool Rules</h2>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-xs text-primary-900 font-bold">✓</span>
                                    Valid USJ ID Card is mandatory for entry.
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-xs text-primary-900 font-bold">✓</span>
                                    Proper swimming attire must be worn at all times.
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-xs text-primary-900 font-bold">✓</span>
                                    Shower before entering the pool area.
                                </li>
                            </ul>
                            <button className="btn-secondary !bg-secondary-500 !border-none !text-primary-900 !font-bold hover:!bg-secondary-600">Download Handbook (PDF)</button>
                        </div>
                        <div className="z-10 flex-shrink-0">
                            <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                                <span className="text-6xl">⚠️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-20 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <Logo size="sm" dark />
                            <p className="max-w-sm text-slate-400">
                                Digitalizing pool management for the University of Sri Jayewardenepura.
                                Efficient booking and facility oversight at your fingertips.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-primary-500 transition-colors">About USJ</a></li>
                                <li><a href="#" className="hover:text-primary-500 transition-colors">Physical Education Department</a></li>
                                <li><a href="#" className="hover:text-primary-500 transition-colors">Pool Calendar</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Support</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-primary-500 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary-500 transition-colors">Contact Support</a></li>
                                <li><a href="#" className="hover:text-primary-500 transition-colors">Rules & Regulations</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© {new Date().getFullYear()} University of Sri Jayewardenepura. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;


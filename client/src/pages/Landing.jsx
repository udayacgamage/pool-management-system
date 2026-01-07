import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import api from '../services/api';
import poolView from '../assets/gallery/pool_view.jpg';
import poolAction from '../assets/gallery/pool_action.jpg';
import poolLanes from '../assets/gallery/pool_lanes.jpg';
import poolStarting from '../assets/gallery/pool_starting.jpg';

const Landing = () => {
    const { user } = useAuth();
    const [coaches, setCoaches] = React.useState([]);
    const [announcements, setAnnouncements] = React.useState([
        { title: 'Semester 2 Registration', desc: 'Student slot bookings are open. Please review pool rules before reserving.', date: 'Updated today' },
        { title: 'Maintenance Notice', desc: 'Lane 6 closed for scheduled maintenance on Friday 10:00–12:00.', date: 'This week' },
    ]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState('home'); // new

    // Contact Form State
    const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
    const [status, setStatus] = React.useState({ loading: false, success: null, error: null });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: null, error: null });

        try {
            await api.post('/contact', formData);
            setStatus({ loading: false, success: 'Message sent successfully!', error: null });
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            setStatus({ loading: false, success: null, error: err.response?.data?.message || 'Failed to send message.' });
        }
    };

    // Scrollspy: track which section is in view
    React.useEffect(() => {
        const ids = ['home', 'specs', 'about', 'gallery', 'features', 'coaches', 'contact'];
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) setActiveSection(visible[0].target.id);
            },
            { rootMargin: '-40% 0px -40% 0px', threshold: [0.1, 0.25, 0.5, 0.75] }
        );
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
        // Use static data as requested
        // Use static data as requested
        setCoaches([
            { name: 'Kithsiri Duminda', specialization: 'Head Coach', email: 'coach.kithsiri@sjp.ac.lk', schedule: 'Mon - Fri' },
            { name: 'Waruni Liyanage', specialization: 'Swimming Instructor', email: 'coach.waruni@sjp.ac.lk', schedule: 'Mondays' },
            { name: 'Banula Devapriya', specialization: 'Swimming Instructor', email: 'coach.banula@sjp.ac.lk', schedule: 'Tuesdays' },
            { name: 'Vihara Jayathilaka', specialization: 'Swimming Instructor', email: 'coach.vihara@sjp.ac.lk', schedule: 'Wednesdays' },
            { name: 'Amadhi Kiripitige', specialization: 'Swimming Instructor', email: 'coach.amadhi@sjp.ac.lk', schedule: 'Thu - Fri' }
        ]);
    }, []);

    // Role-aware portal helpers
    const getPortalRoute = (u) => {
        if (!u) return '/login';
        switch (u.role) {
            case 'admin': return '/admin';
            case 'coach': return '/coach';
            case 'staff': return '/scanner';
            default: return '/dashboard';
        }
    };
    const getPortalLabel = (u) => {
        if (!u) return 'Student Portal';
        switch (u.role) {
            case 'admin': return 'Admin Portal';
            case 'coach': return 'Coach Portal';
            case 'staff': return 'Gate Scanner';
            default: return 'Student Portal';
        }
    };

    const navLinks = [
        { id: 'home', label: 'Home' },
        { id: 'specs', label: 'Infrastructure' },
        { id: 'about', label: 'Guidelines' },
        { id: 'gallery', label: 'Gallery' },
        { id: 'features', label: 'Services' },
        { id: 'coaches', label: 'Coaches' },
        { id: 'contact', label: 'Contact' },
    ];

    return (
        <div className="min-h-screen font-sans bg-mg-soft">
            {/* Navbar (glassmorphic) */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex justify-between h-16 items-center">
                        {/* Left: Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Logo />
                        </div>

                        {/* Center: Nav Links (Absolute Positioned for perfect centering) */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8 text-xs font-black uppercase tracking-[0.2em]">
                            {navLinks.map(link => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    className={`nav-underline motion-soft transition-colors ${activeSection === link.id ? 'text-mg' : 'text-slate-700 hover-text-mg'}`}
                                    aria-current={activeSection === link.id ? 'page' : undefined}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-4">
                            {/* Mobile-only Portal button (placed before toggle) */}
                            <Link
                                to={getPortalRoute(user)}
                                className="btn-maroon motion-soft !px-4 !py-2 text-xs uppercase tracking-widest block md:hidden"
                            >
                                {getPortalLabel(user)}
                            </Link>

                            {/* Mobile Menu Button (now appears after portal button) */}
                            <button
                                className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 active:scale-95"
                                onClick={() => setIsMobileMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                ☰
                            </button>

                            {/* Desktop Portal button (hidden on mobile) */}
                            <Link
                                to={getPortalRoute(user)}
                                className="btn-maroon motion-soft !px-6 !py-3 hidden md:inline-flex shadow-lg shadow-maroon/20"
                            >
                                {getPortalLabel(user)}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[70]">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl border-l border-slate-100 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <Logo size="sm" />
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg border border-slate-200" aria-label="Close menu">✕</button>
                        </div>
                        <nav className="flex-1 space-y-3 text-sm font-black uppercase tracking-widest">
                            {navLinks.map(link => (
                                <a
                                    key={link.id}
                                    href={`#${link.id}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg hover:bg-slate-50 motion-soft ${activeSection === link.id ? 'text-mg' : 'text-slate-700 hover-text-mg'
                                        }`}
                                    aria-current={activeSection === link.id ? 'page' : undefined}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Hero: centered logo, status pill, heading */}
            <header id="home" className="relative min-h-screen overflow-hidden flex items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f5] via-[#fdeaea] to-[#fbe9e9]" />
                <img
                    src={poolView}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none"
                />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
                    {/* center emblem */}
                    <div className="flex justify-center mb-6">
                        <Logo size="xl" showText={false} />
                    </div>

                    {/* status pill */}
                    <div className="pill-status mx-auto mb-10">
                        <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            SYSTEM ONLINE: SEMESTER 2 BOOKINGS OPEN
                        </span>
                    </div>

                    {/* large heading */}
                    <h1 className="text-[54px] sm:text-[64px] md:text-[78px] font-black tracking-tight leading-[1.05]">
                        <span className="text-slate-900">USJ </span>
                        <span className="text-[#800000]">AQUATIC </span>
                        <span className="text-slate-900">MANAGEMENT</span>
                    </h1>

                    {/* tagline */}
                    <p className="mt-8 text-slate-600 text-lg max-w-3xl mx-auto">
                        Official pool management portal for the University of Sri Jayewardenepura.
                        Digitalizing aquatic facility access for students and faculty.
                    </p>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to={getPortalRoute(user)}
                            className="btn-maroon !px-8 !py-4 !text-base uppercase tracking-widest motion-soft"
                        >
                            {getPortalLabel(user)}
                        </Link>
                        <a
                            href="#gallery"
                            className="btn-gold !px-8 !py-4 !text-base uppercase tracking-widest motion-soft"
                        >
                            EXPLORE FACILITY
                        </a>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main>
                {/* About (modern cards) */}
                <section id="about" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">About Our System</h2>
                            <p className="text-lg text-slate-700">Streamlined booking, secure QR verification, and role-based dashboards.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: 'Secure Access', desc: 'QR identity for fast entry with time-window checks.' },
                                { title: 'Smart Scheduling', desc: 'Live availability, occupancy indicators, and reminders.' },
                                { title: 'Role-based Portals', desc: 'Students, Staff, Coaches, and Admins get tailored tools.' },
                            ].map((card, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all">
                                    <h3 className="text-xl font-black text-slate-800 mb-3">{card.title}</h3>
                                    <p className="text-slate-600">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Student Services (interactive grid) */}
                <section id="features" className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <p className="text-primary-700 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Designed for Students</p>
                                <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Student Services</h2>
                                <p className="text-slate-600 mt-2 font-medium">Book, verify, and track attendance in one place.</p>
                            </div>
                            <div className="flex gap-3">
                                <Link to={getPortalRoute(user)} className="btn-maroon motion-soft !px-6 !py-3">
                                    {getPortalLabel(user)}
                                </Link>
                                <Link to="/register" className="btn-secondary motion-soft !px-6 !py-3">Join Now</Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: '🏊', title: 'Slot Booking', desc: 'Reserve sessions instantly with live occupancy.' },
                                { icon: '🎫', title: 'QR Identity', desc: 'Persistent QR for seamless verification.' },
                                { icon: '📜', title: 'Attendance', desc: 'View attended sessions and outcomes.' },
                                { icon: '🆘', title: 'Support', desc: 'Guidelines and departmental help resources.' },
                            ].map((f, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all motion-soft">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-6">{f.icon}</div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">{f.title}</h3>
                                    <p className="text-slate-600">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Specs (glass) */}
                <section id="specs" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div
                            className="rounded-[2.5rem] p-10 lg:p-16 overflow-hidden relative text-slate-900 border motion-soft"
                            style={{
                                background: 'linear-gradient(135deg, #fff5f5 0%, #fdeaea 50%, #fbe9e9 100%)',
                                borderColor: '#f1caca'
                            }}
                        >
                            {/* soft maroon blobs */}
                            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl animate-float-slow" style={{ backgroundColor: 'rgba(128,0,0,0.10)' }}></div>
                            <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full blur-2xl animate-float-reverse" style={{ backgroundColor: 'rgba(128,0,0,0.06)' }}></div>

                            <div className="relative flex flex-col lg:flex-row items-center gap-16">
                                <div className="flex-1">
                                    <span className="tag-mg-gold mb-6">World-Class Specifications</span>
                                    <h2 className="text-4xl lg:text-5xl font-black leading-tight text-mg">PRO-FEEL <br /> INFRASTRUCTURE.</h2>

                                    <div className="grid grid-cols-2 gap-8 mt-10">
                                        <div className="border-l-2 pl-6 py-2" style={{ borderColor: 'rgba(128,0,0,0.25)' }}>
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Length</p>
                                            <p className="text-2xl md:text-3xl font-black text-mg">50.0m</p>
                                        </div>
                                        <div className="border-l-2 pl-6 py-2" style={{ borderColor: 'rgba(128,0,0,0.25)' }}>
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Width</p>
                                            <p className="text-2xl md:text-3xl font-black text-mg">25.0m</p>
                                        </div>
                                        <div className="border-l-2 pl-6 py-2" style={{ borderColor: 'rgba(128,0,0,0.25)' }}>
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Depth</p>
                                            <p className="text-2xl md:text-3xl font-black text-mg">1.3 - 2.0m</p>
                                        </div>
                                        <div className="border-l-2 pl-6 py-2" style={{ borderColor: 'rgba(128,0,0,0.25)' }}>
                                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Type</p>
                                            <p className="text-2xl md:text-3xl font-black text-mg">Semi-Olympic</p>
                                        </div>
                                    </div>

                                    <div className="mt-12 inline-flex items-center gap-4 p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.6)', borderColor: '#f1caca' }}>
                                        <div className="text-3xl">🏆</div>
                                        <div>
                                            <p className="font-black text-sm uppercase tracking-tighter text-slate-800">Gold Standard Certification</p>
                                            <p className="text-slate-600 text-[10px] font-bold">Largest swimming pool in a Sri Lankan government university</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl border" style={{ background: 'rgba(255,255,255,0.6)', borderColor: '#f1caca' }}>
                                        <img src={poolView} alt="Specification visual" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery (hover reveal) */}
                <section id="gallery" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">Our Facilities</h2>
                            <p className="text-lg text-slate-700">A look at our state-of-the-art environment.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="group perspective">
                                <div className="relative h-64 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                                    <img src={poolView} alt="Pool View" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-lg font-semibold">Main Pool - Overview</p>
                                    </div>
                                </div>
                            </div>
                            <div className="group perspective">
                                <div className="relative h-64 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                                    <img src={poolAction} alt="Pool Action" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-lg font-semibold">Pool Action Shot</p>
                                    </div>
                                </div>
                            </div>
                            <div className="group perspective">
                                <div className="relative h-64 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                                    <img src={poolLanes} alt="Pool Lanes" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-lg font-semibold">Swimming Lanes</p>
                                    </div>
                                </div>
                            </div>
                            <div className="group perspective">
                                <div className="relative h-64 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                                    <img src={poolStarting} alt="Pool Starting Blocks" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-lg font-semibold">Starting Blocks</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Coaches (modern cards) */}
                <section id="coaches" className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <p className="text-primary-700 text-[10px] font-black uppercase tracking-[0.4em] mb-2 italic">Expert Guidance</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Meet Our Coaches</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {coaches.length === 0 ? (
                                <div className="col-span-full text-center p-10 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-slate-600">No coaches available at the moment.</p>
                                </div>
                            ) : (
                                coaches.map(coach => (
                                    <div key={coach._id || coach.id} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-xl">🏊</div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800">{coach.name}</h3>
                                                <p className="text-xs font-black text-primary-600 uppercase tracking-widest">{coach.specialization || 'Coach'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Available On</p>
                                            <p className="font-bold text-slate-700 text-sm">{coach.schedule}</p>
                                        </div>
                                        <p className="text-slate-500 text-xs mt-4">Connect via <span className="font-mono text-mg">{coach.email}</span></p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Important Pool Rules (maroon card) */}
                <section id="rules" className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/10 text-white
                                        bg-gradient-to-br from-[#5a0000] via-[#6a0000] to-[#800000]">
                            <h3 className="text-3xl font-black tracking-tight mb-6">Important Pool Rules</h3>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-[#0f172a] text-sm font-black">✓</span>
                                    <span className="text-slate-100">Valid USJ ID Card is mandatory for entry.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-[#0f172a] text-sm font-black">✓</span>
                                    <span className="text-slate-100">Proper swimming attire must be worn at all times.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-[#0f172a] text-sm font-black">✓</span>
                                    <span className="text-slate-100">Shower before entering the pool area.</span>
                                </li>
                            </ul>

                            <div className="mt-8">
                                <a href="/handbook.pdf" target="_blank" rel="noopener" className="btn-gold">
                                    Download Handbook (PDF)
                                </a>
                            </div>

                            {/* Caution bubble */}
                            <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                                <span className="text-3xl">⚠️</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">Get In Touch</h2>
                            <p className="text-lg text-slate-700">Questions or feedback? Reach out anytime.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold mb-4">Contact Details</h3>
                                <p className="text-slate-700 mb-2"><strong>Email:</strong> usjppool@gmail.com</p>
                                <p className="text-slate-700 mb-2"><strong>Phone:</strong> +94 11 2758000</p>
                                <p className="text-slate-700"><strong>Address:</strong> University of Sri Jayewardenepura, Gangodawila, Nugegoda, Sri Lanka</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold mb-4">Send Us a Message</h3>
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    {status.success && <p className="text-green-600 font-bold bg-green-50 p-2 rounded">{status.success}</p>}
                                    {status.error && <p className="text-red-600 font-bold bg-red-50 p-2 rounded">{status.error}</p>}

                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="block w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Your Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="block w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Your Message</label>
                                        <textarea
                                            name="message"
                                            id="message"
                                            rows="4"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            required
                                            className="block w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status.loading}
                                        className="w-full btn-maroon motion-soft !px-6 !py-3 !text-sm sm:!text-base uppercase tracking-[0.2em] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {status.loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#800000] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                        {/* Brand & description */}
                        <div className="motion-soft">
                            <div className="flex items-center gap-3 mb-4">
                                <Logo size="sm" dark />
                            </div>
                            <p className="text-white/80">
                                Digital portal for the University of Sri Jayewardenepura aquatic centre.
                                Book sessions, verify access, and explore facilities.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div className="motion-soft">
                            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Quick Links</h4>
                            <ul className="space-y-3">
                                <li><a href="#home" className="hover:text-[#ffbf00] transition-colors">Home</a></li>
                                <li><a href="#specs" className="hover:text-[#ffbf00] transition-colors">Infrastructure</a></li>
                                <li><a href="#gallery" className="hover:text-[#ffbf00] transition-colors">Gallery</a></li>
                                <li><a href="#features" className="hover:text-[#ffbf00] transition-colors">Services</a></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="motion-soft">
                            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Support</h4>
                            <ul className="space-y-3">
                                <li><a href="#about" className="hover:text-[#ffbf00] transition-colors">Guidelines</a></li>
                                <li><a href="#contact" className="hover:text-[#ffbf00] transition-colors">Contact Support</a></li>
                                <li><Link to="/scanner" className="hover:text-[#ffbf00] transition-colors">Gate Scanner</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-white/80">&copy; 2026 USJ Pool Management System. All rights reserved.</p>
                        <div className="flex gap-4">
                            <Link to="/privacy" className="text-sm hover:text-[#ffbf00] transition-colors">Privacy</Link>
                            <Link to="/terms" className="text-sm hover:text-[#ffbf00] transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;


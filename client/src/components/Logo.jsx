import React from 'react';
import { Link } from 'react-router-dom';
import usjLogo from '../assets/usj_logo.png';

const Logo = ({ className = '', size = 'md', showText = true, dark = false }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-4xl'
    };

    return (
        <Link to="/" className={`flex items-center gap-3 ${className}`}>
            <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg p-0.5 border border-slate-100 shrink-0`}>
                <img src={usjLogo} alt="USJ Logo" className="w-full h-full object-contain" />
            </div>
            {showText && (
                <span className={`${textSizes[size]} font-black tracking-tight`}>
                    <span className={dark ? 'text-slate-100' : 'text-slate-900'}>USJ</span>
                    <span className="text-mg"> Pool</span>
                </span>
            )}
        </Link>
    );
};

export default Logo;

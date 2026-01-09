import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
            <div className="relative">
                {/* Animated Rings */}
                <div className="w-24 h-24 border-4 border-primary-100 rounded-full"></div>
                <div className="w-24 h-24 border-t-4 border-primary-600 rounded-full animate-spin absolute top-0 left-0"></div>

                {/* Logo/Icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-700/30">
                        U
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
                    USJ<span className="text-primary-600">POOL</span>
                </h2>
                <p className="text-sm font-bold text-slate-400 mt-2 tracking-widest uppercase animate-pulse">
                    Synchronizing...
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;

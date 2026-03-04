import React from 'react';
import { useLanguageDirection } from '../../hooks/useLanguageDirection';
import {
    Thermometer,
    Battery,
    Clock,
    X,
    Heart,
    Zap,
    TrendingUp,
    Map as MapIcon
} from 'lucide-react';

function CowContextCard({ collar, onClose }) {
    const { t, isRTL } = useLanguageDirection();

    if (!collar) return null;

    const getStatusColor = (state) => {
        if (state === 'breach') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        if (state?.startsWith('warning')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    };

    return (
        <div className={`fixed top-32 z-30 w-80 translate-y-0 transition-all duration-500 ease-out
      ${isRTL ? 'left-6 animate-slide-in-left' : 'right-6 animate-slide-in-right'}`}
        >
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-start">
                    <div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${getStatusColor(collar.alert_state)}`}>
                            {collar.alert_state || 'SAFE'}
                        </div>
                        <h2 className="text-2xl font-bold text-white mt-2 leading-tight">
                            {collar.cattle_name || `Cattle #${collar.collar_id}`}
                        </h2>
                        <div className="flex items-center gap-2 text-white/40 text-xs mt-1">
                            <MapIcon size={12} />
                            <span>{collar.latitude?.toFixed(5)}, {collar.longitude?.toFixed(5)}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Vital Grid */}
                <div className="px-6 grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-cyan-400 mb-1">
                            <Thermometer size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">{t('temperature')}</span>
                        </div>
                        <div className="text-xl font-bold text-white">{collar.body_temp?.toFixed(1)}°C</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                            <Zap size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-tight opacity-50">{t('battery')}</span>
                        </div>
                        <div className="text-xl font-bold text-white">{collar.battery_voltage?.toFixed(1)}V</div>
                    </div>
                </div>

                {/* Health Progress Block */}
                <div className="px-6 mb-6">
                    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Heart size={16} className="text-rose-400" />
                                <span className="text-sm font-bold text-white">{t('status')}</span>
                            </div>
                            <span className="text-xs text-emerald-400 font-mono">+2.4% Today</span>
                        </div>

                        {/* Visual Sparkline Replacement */}
                        <div className="h-12 flex items-end gap-1 px-1">
                            {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-emerald-500/40 rounded-t-sm"
                                    style={{ height: `${h}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <div className="bg-white/5 p-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-2 text-white/30 text-[10px]">
                        <Clock size={12} />
                        <span>{t('last_update')}: {new Date(collar.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <TrendingUp size={14} className="text-white/20" />
                </div>
            </div>
        </div>
    );
}

export default CowContextCard;

import React from 'react';
import { useLanguageDirection } from '../../hooks/useLanguageDirection';
import { Users, AlertTriangle, Activity, Wifi } from 'lucide-react';

function KPIHud({ totalCattle = 0, activeAlerts = 0, healthScore = 0, connectivity = 100, healthAlertsCount = 0, onHealthAlertClick }) {
    const { t, isRTL } = useLanguageDirection();

    return (
        <div className={`fixed bottom-10 z-30 flex gap-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
      ${isRTL ? 'right-80 translate-x-4' : 'left-80 -translate-x-4'} opacity-0 animate-fade-in-up`}
        >
            {/* Total Cattle Card */}
            <div className="flex items-center gap-4 px-6 py-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-emerald-500/30 transition-all cursor-default group">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Users size={20} />
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">{t('total_cattle')}</div>
                    <div className="text-2xl font-black text-white leading-none mt-1">{totalCattle}</div>
                </div>
            </div>

            {/* Active Alerts Card */}
            <div className="flex items-center gap-4 px-6 py-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-rose-500/30 transition-all cursor-default group">
                <div className={`p-3 rounded-xl transition-all group-hover:scale-110 ${activeAlerts > 0 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-white/5 text-white/20'}`}>
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">{t('active_alerts')}</div>
                    <div className={`text-2xl font-black leading-none mt-1 ${activeAlerts > 0 ? 'text-rose-400' : 'text-white'}`}>
                        {activeAlerts}
                    </div>
                </div>
            </div>

            {/* Health Alerts Card */}
            {healthAlertsCount > 0 && (
                <div
                    onClick={onHealthAlertClick}
                    className="flex items-center gap-4 px-6 py-4 bg-black/40 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-amber-500/10 transition-all cursor-pointer group animate-fade-in-up"
                >
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform animate-pulse">
                        <Activity size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Health Alerts</div>
                        <div className="text-2xl font-black text-amber-400 leading-none mt-1">{healthAlertsCount}</div>
                    </div>
                </div>
            )}

            {/* Health Score Card */}
            <div className="flex items-center gap-4 px-5 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
                <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
                    <Activity size={20} />
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('avg_health')}</div>
                    <div className="text-2xl font-black text-white leading-none mt-1">{healthScore}%</div>
                </div>
            </div>

            {/* Connectivity Status */}
            <div className="flex items-center gap-4 px-5 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Wifi size={20} />
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t('connectivity')}</div>
                    <div className="text-2xl font-black text-white leading-none mt-1">{connectivity}%</div>
                </div>
            </div>
        </div>
    );
}

export default KPIHud;

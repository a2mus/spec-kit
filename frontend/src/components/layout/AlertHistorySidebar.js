import React from 'react';
import { useLanguageDirection } from '../../hooks/useLanguageDirection';
import { X, Activity, AlertCircle, Clock, CheckCircle } from 'lucide-react';

/**
 * AlertHistorySidebar Component
 * 
 * Displays a persistent list of active health anomalies.
 * Styled with premium glassmorphism.
 */
function AlertHistorySidebar({ alerts = [], isOpen, onClose, onDismiss }) {
    const { t, isRTL } = useLanguageDirection();

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-y-0 z-50 w-80 bg-black/40 backdrop-blur-3xl border-white/10 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col
            ${isRTL ? 'left-0 border-r translate-x-0' : 'right-0 border-l translate-x-0'}`}
        >
            <div className="p-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                        <Activity size={18} />
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Health Alerts</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-white/20">
                        <CheckCircle size={40} strokeWidth={1} className="mb-4" />
                        <p className="text-sm font-medium">All herd members healthy</p>
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div
                            key={`${alert.collar_id}-${alert.alert_type}-${idx}`}
                            className={`p-4 rounded-2xl border transition-all hover:bg-white/5 group
                                ${alert.severity === 'critical'
                                    ? 'bg-rose-500/5 border-rose-500/20'
                                    : 'bg-amber-500/5 border-amber-500/20'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black uppercase tracking-widest
                                        ${alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                                        {alert.alert_type.replace('_', ' ')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onDismiss(alert)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-emerald-400 transition-all"
                                    title="Mark as Resolved"
                                >
                                    <CheckCircle size={14} />
                                </button>
                            </div>

                            <div className="text-sm text-white/80 font-medium mb-3">
                                {alert.cattle_name ? `${alert.cattle_name} (#${alert.collar_id})` : `Collar #${alert.collar_id}`}
                            </div>

                            <p className="text-xs text-white/50 leading-relaxed mb-3">
                                {alert.description}
                            </p>

                            <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-tighter">
                                <Clock size={10} />
                                {new Date(alert.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="flex justify-between text-[10px] text-white/40 font-black uppercase tracking-widest">
                    <span>Active Anomalies</span>
                    <span className="text-white">{alerts.length}</span>
                </div>
            </div>
        </div>
    );
}

export default AlertHistorySidebar;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    ar: {
        translation: {
            "dashboard": "لوحة التحكم",
            "live_map": "الخريطة الحية",
            "health_monitor": "مراقبة الصحة",
            "fencing_zones": "مناطق السياج",
            "cattle_roster": "قائمة الماشية",
            "hardware_units": "وحدات الجهاز",
            "settings": "الإعدادات",
            "total_cattle": "إجمالي الماشية",
            "active_alerts": "تنبيهات نشطة",
            "avg_health": "متوسط الصحة",
            "battery": "البطارية",
            "temperature": "الحرارة",
            "status": "الحالة",
            "last_update": "آخر تحديث",
            "herd_efficiency": "كفاءة القطيع",
            "connectivity": "الاتصال"
        }
    },
    fr: {
        translation: {
            "dashboard": "Tableau de bord",
            "live_map": "Carte en direct",
            "health_monitor": "Suivi de santé",
            "fencing_zones": "Zones de clôture",
            "cattle_roster": "Registre du bétail",
            "hardware_units": "Unités matérielles",
            "settings": "Paramètres",
            "total_cattle": "Bétail total",
            "active_alerts": "Alertes actives",
            "avg_health": "Santé moyenne",
            "battery": "Batterie",
            "temperature": "Température",
            "status": "Statut",
            "last_update": "Dernière mise à jour",
            "herd_efficiency": "Efficacité du troupeau",
            "connectivity": "Connectivité"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'fr',
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;

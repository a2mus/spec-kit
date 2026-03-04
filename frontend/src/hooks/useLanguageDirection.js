import { useUI } from '../context/UIContext';
import { useTranslation } from 'react-i18next';

export const useLanguageDirection = () => {
    const { language, direction, setLanguage } = useUI();
    const { t } = useTranslation();

    return {
        language,
        direction,
        setLanguage,
        t,
        isRTL: direction === 'rtl'
    };
};

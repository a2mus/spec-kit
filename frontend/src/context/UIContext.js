import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n/config';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [language, setLanguageState] = useState(i18n.language);
    const [direction, setDirection] = useState(i18n.language === 'ar' ? 'rtl' : 'ltr');
    const [selectedCowId, setSelectedCowId] = useState(null);

    const setLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLanguageState(lng);
    };

    useEffect(() => {
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        setDirection(dir);
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
    }, [language]);

    return (
        <UIContext.Provider value={{ language, direction, setLanguage, selectedCowId, setSelectedCowId }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { SignUpModal, SignInModal } from '../components/AuthModals';

type ModalType = 'signup' | 'signin' | null;
type Language = 'English' | 'German' | 'French';

const WelcomePage: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const renderVision = () => {
        const visionText = t('welcome.vision');
        const keywordsKey = t('welcome.vision_keywords');
        
        // Handle cases where translations might not be loaded yet
        if (keywordsKey === 'welcome.vision_keywords') return visionText;

        const visionKeywords = keywordsKey.split(',').map(kw => kw.trim());
        
        // Use a regex that ignores case for matching but captures the actual word for rendering
        const regex = new RegExp(`(${visionKeywords.join('|')})`, 'gi');
        const parts = visionText.split(regex);

        return (
            <span>
                "...
                {parts.map((part, i) => {
                    const isKeyword = visionKeywords.some(kw => kw.toLowerCase() === part.toLowerCase());
                    return (
                        <span key={i} className={isKeyword ? "text-hey-church-orange-500 font-black" : ""}>
                            {part}
                        </span>
                    );
                })}
                "
            </span>
        );
    };

    const languages: { code: Language; label: string }[] = [
        { code: 'German', label: 'Deutsch' },
        { code: 'English', label: 'English' },
        { code: 'French', label: 'Français' },
    ];

    return (
        <>
            <div className="min-h-screen bg-hey-church-bg flex flex-col items-center justify-center p-6 text-white text-center">

                <div className="max-w-md w-full space-y-2">
                    <h1 className="text-6xl font-black text-hey-church-orange-500 uppercase tracking-tighter drop-shadow-lg">
                        HEY LIFE
                    </h1>
                    <p className="text-lg font-bold text-gray-200 tracking-wide">
                        {t('welcome.tagline')}
                    </p>
                </div>

                <div className="max-w-md w-full mt-10">
                    <p className="text-2xl font-extrabold text-white leading-tight drop-shadow-md">
                        {renderVision()}
                    </p>
                </div>

                <div className="max-w-md w-full mt-12 space-y-8">
                    <div>
                        <p className="text-gray-400 font-bold mb-4 uppercase text-[10px] tracking-[0.2em]">
                            {t('welcome.select_language')}
                        </p>
                        <div className="flex justify-center space-x-2">
                            {languages.map(({ code, label }) => (
                                <button
                                    key={code}
                                    onClick={() => setLanguage(code)}
                                    className={`px-5 py-2.5 rounded-xl font-black text-sm border-2 transition-all ${
                                        language === code
                                            ? 'bg-hey-church-blue border-hey-church-blue text-white shadow-lg scale-105'
                                            : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={() => setActiveModal('signup')}
                            className="w-full bg-hey-church-orange-500 text-white font-black py-5 rounded-2xl text-xl shadow-xl transition-all active:scale-95 uppercase tracking-widest"
                        >
                            {t('welcome.join')}
                        </button>
                        <button
                            onClick={() => setActiveModal('signin')}
                            className="w-full bg-gray-800 text-white font-black py-5 rounded-2xl text-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest border border-white/5"
                        >
                            {t('welcome.signin')}
                        </button>
                    </div>
                </div>
            </div>

            {activeModal === 'signup' && <SignUpModal onClose={() => setActiveModal(null)} onSwitchToSignIn={() => setActiveModal('signin')} />}
            {activeModal === 'signin' && <SignInModal onClose={() => setActiveModal(null)} onSwitchToSignUp={() => setActiveModal('signup')} />}
        </>
    );
};

export default WelcomePage;
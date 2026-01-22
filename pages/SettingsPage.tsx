
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { signOutUser, getLearningGroups, updateUserData } from '../services/firebaseService';
import { 
    ArrowLeft, UserCheck, Users, HeartHandshake, Bell, 
    LogOut, PlusCircle, Smartphone, Share2, Download, 
    Globe, Check, Share, PlusSquare, CheckCircle2 
} from 'lucide-react';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [isAssignedLeader, setIsAssignedLeader] = useState(false);
    const [canInstall, setCanInstall] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const checkLeadership = async () => {
            if (user) {
                const learningGroups = await getLearningGroups();
                const isUserLeading = learningGroups.some(g => g.leaderId === user.id);
                setIsAssignedLeader(user.role === 'leader' || user.role === 'admin' || isUserLeading);
            }
        };
        checkLeadership();

        // Check if already installed
        const checkStandalone = () => {
            const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
            setIsStandalone(isPWA);
        };
        checkStandalone();

        // Detect iOS
        const detectIOS = () => {
            const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            setIsIOS(isIOSDevice);
        };
        detectIOS();

        const checkInstall = () => {
            if (window.deferredInstallPrompt) {
                setCanInstall(true);
            }
        };
        checkInstall();
        window.addEventListener('beforeinstallprompt', checkInstall);
        window.addEventListener('appinstalled', () => {
            setIsStandalone(true);
            setCanInstall(false);
        });

        return () => window.removeEventListener('beforeinstallprompt', checkInstall);
    }, [user]);

    const handleInstall = async () => {
        const promptEvent = window.deferredInstallPrompt;
        if (!promptEvent) return;
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
            window.deferredInstallPrompt = null;
            setCanInstall(false);
        }
    };

    const handleShareApp = async () => {
        const shareData = {
            title: 'Hey Life App',
            text: 'I want to invite you to join me on Hey Life! Let\'s grow in Spirit, Soul, and Body together.',
            url: window.location.origin
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.origin);
            alert('App link copied to clipboard!');
        }
    };

    const handleLanguageChange = async (newLang: 'English' | 'German' | 'French') => {
        if (!user) return;
        setLanguage(newLang);
        await updateUserData(user.id, { language: newLang });
    };

    const handleLogout = async () => {
        await signOutUser();
        navigate('/welcome');
    };

    if (!user) {
        return null;
    }

    const languages: { code: 'English' | 'German' | 'French'; label: string }[] = [
        { code: 'English', label: 'English' },
        { code: 'German', label: 'Deutsch' },
        { code: 'French', label: 'Français' },
    ];

    return (
        <div className="p-4 space-y-6 bg-hey-church-bg min-h-screen text-white pb-24">
            <div className="flex items-center">
                <button onClick={() => navigate('/my-plan')} className="text-hey-church-orange-400">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-extrabold uppercase ml-4">{t('settings.title')}</h1>
            </div>

            {/* Language Selection */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Language Settings</p>
                <div className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700">
                    <div className="flex flex-col space-y-2">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                    language === lang.code 
                                        ? 'bg-hey-church-blue/20 text-white' 
                                        : 'hover:bg-gray-700 text-gray-400'
                                }`}
                            >
                                <div className="flex items-center">
                                    <Globe size={18} className="mr-3 text-hey-church-orange-400" />
                                    <span className="font-bold">{lang.label}</span>
                                </div>
                                {language === lang.code && <Check size={18} className="text-hey-church-blue" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Installation & Sharing */}
            <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">App Experience</p>
                <div className="bg-gradient-to-br from-hey-church-blue to-blue-700 rounded-[2.5rem] p-7 shadow-lg relative overflow-hidden">
                    <Smartphone className="absolute -right-4 -bottom-4 text-white opacity-10" size={120} />
                    
                    <div className="relative z-10">
                        <h3 className="font-black text-2xl uppercase tracking-tighter mb-1">Make it Official</h3>
                        
                        {isStandalone ? (
                            <div className="flex items-center space-x-2 text-blue-100 mb-6">
                                <CheckCircle2 size={18} className="text-hey-church-green" />
                                <p className="text-sm font-bold uppercase tracking-wider">App Successfully Installed</p>
                            </div>
                        ) : (
                            <p className="text-blue-100 text-sm mb-6 font-medium">Install Hey Life to your home screen for the fastest experience and offline access.</p>
                        )}

                        <div className="flex flex-col gap-3 relative z-10">
                            {isStandalone ? (
                                <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl py-4 flex items-center justify-center border border-white/20">
                                    <span className="font-black text-xs uppercase tracking-widest text-white/60 italic leading-none">Ready for the mission</span>
                                </div>
                            ) : isIOS ? (
                                // Custom Instruction for Safari/iOS users
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-hey-church-yellow text-center">Safari Installation Guide</p>
                                    <div className="flex items-center justify-center space-x-4 text-sm font-bold text-white">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white/20 p-2 rounded-lg mb-1"><Share size={18} /></div>
                                            <span className="text-[9px] uppercase">1. Tap Share</span>
                                        </div>
                                        <div className="h-4 w-px bg-white/20"></div>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white/20 p-2 rounded-lg mb-1"><PlusSquare size={18} /></div>
                                            <span className="text-[9px] uppercase">2. Add to Home</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Native PWA Button for Chrome/Android/Desktop
                                <button 
                                    onClick={handleInstall}
                                    disabled={!canInstall}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                                        canInstall 
                                            ? 'bg-white text-hey-church-blue shadow-xl scale-100 active:scale-95' 
                                            : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
                                    }`}
                                >
                                    <Download size={20} /> {canInstall ? 'Install Now' : 'Check Browser Support'}
                                </button>
                            )}

                            <button 
                                onClick={handleShareApp}
                                className="w-full flex items-center justify-center gap-3 bg-hey-church-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                            >
                                <Share2 size={20} /> Share With Friends
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Menu */}
            <div className="bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-700">
                {user.role === 'admin' && (
                    <button onClick={() => navigate('/admin')} className="w-full text-left p-5 flex items-center font-bold text-hey-church-yellow hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                        <UserCheck className="mr-4" size={22} /> {t('settings.menu.admin')}
                    </button>
                )}
                
                {isAssignedLeader && (
                    <>
                        <button onClick={() => navigate('/leader-dashboard')} className="w-full text-left p-5 flex items-center font-bold text-hey-church-blue hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                            <Users className="mr-4" size={22} /> {t('settings.menu.leader')}
                        </button>
                        <button 
                            onClick={() => navigate('/leader-dashboard', { state: { createNew: true } })} 
                            className="w-full text-left p-5 flex items-center font-bold text-hey-church-green hover:bg-gray-700/50 transition-colors border-b border-gray-700"
                        >
                            <PlusCircle className="mr-4" size={22} /> Create Group/Class
                        </button>
                    </>
                )}
                
                <button onClick={() => navigate('/giving')} className="w-full text-left p-5 flex items-center hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                    <HeartHandshake className="mr-4 text-gray-400" size={22} /> {t('settings.menu.giving')}
                </button>
                <button className="w-full text-left p-5 flex items-center hover:bg-gray-700/50 transition-colors border-b border-gray-700">
                    <Bell className="mr-4 text-gray-400" size={22} /> {t('settings.menu.notifications')}
                </button>
                <button onClick={handleLogout} className="w-full text-left p-5 flex items-center text-hey-church-orange-400 hover:bg-gray-700/50 font-black uppercase tracking-widest transition-colors">
                    <LogOut className="mr-4" size={22} /> {t('settings.menu.logout')}
                </button>
            </div>

            <div className="text-center pt-10 opacity-30">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.4em]">Hey Life Experience v1.1</p>
            </div>
        </div>
    );
};

export default SettingsPage;

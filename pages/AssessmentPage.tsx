
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { updateUserData } from '../services/firebaseService';
import { generateAssessmentFeedback } from '../services/geminiService';
// FIX: Import getDailySpiritSnack for GuidedPrayerModal
import { getDailySpiritSnack } from '../constants/staticData';
import { 
    ArrowLeft, ArrowRight, CheckCircle, Trophy, 
    Sparkles, Heart, Activity, Gift, Users, Star, 
    Flame, Loader2, Share2, Compass, Zap, Map as MapIcon, HelpCircle,
    BookOpen, UserPlus, ExternalLink, Quote, Signature
} from 'lucide-react';
// FIX: Import SpiritSnack type
import { AssessmentResult, SpiritSnack } from '../types';
import { GuidedPrayerModal } from '../components/GuidedPrayerModal';
import InviteFriendModal from '../components/InviteFriendModal';

// --- CONFIG ---
const PASTOR_VICTOR_IMAGE = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0268998518.firebasestorage.app/o/pastor_victor_portrait.png?alt=media&token=8e6d3c2c-8a2a-4c2c-9a1c-7e6d3c2c8a2a";
// Using a placeholder that matches the provided style if storage is not ready
const FALLBACK_PASTOR_IMAGE = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400";

interface Question {
    text: string;
    category: string;
    isPercentage?: boolean;
}

const CATEGORIES = [
    { 
        id: 'daily_walk', 
        label: 'Daily Walk', 
        icon: Flame, 
        color: '#3B82F6', 
        nextStepTitle: 'Strengthen Your Roots',
        nextStepDesc: 'Build a solid foundation. Today\'s Spirit Snack is waiting for you.',
        actionLabel: 'OPEN SPIRIT SNACK',
        internalAction: 'spirit_snack'
    },
    { 
        id: 'relationships', 
        label: 'Relationships', 
        icon: Users, 
        color: '#8B5CF6', 
        nextStepTitle: 'Find Your Circle',
        nextStepDesc: 'Faith is better together. Discover your next Hey Fam.',
        actionLabel: 'EXPLORE HEY FAMS',
        externalUrl: 'https://heychurch.de/fams'
    },
    { 
        id: 'serve', 
        label: 'Serve Others', 
        icon: Heart, 
        color: '#10B981', 
        nextStepTitle: 'Unleash Your Gift',
        nextStepDesc: 'You have a unique role to play. Explore our serving teams.',
        actionLabel: 'CHOOSE A MINISTRY',
        externalUrl: 'https://heychurch.de/hero'
    },
    { 
        id: 'mission', 
        label: 'Make God Known', 
        icon: Zap, 
        color: '#FBBF24', 
        nextStepTitle: 'Share the Light',
        nextStepDesc: 'Invite someone to experience this journey with you.',
        actionLabel: 'INVITE A FRIEND',
        internalAction: 'invite'
    },
    { 
        id: 'generosity', 
        label: 'Generosity', 
        icon: Gift, 
        color: '#FF755D', 
        nextStepTitle: 'Open-Handed Living',
        nextStepDesc: 'Break the power of fear. Start your giving journey today.',
        actionLabel: 'GIVING PLAN',
        externalUrl: 'https://heychurch.de/generosity'
    }
];

const QUESTIONS: Question[] = [
    // Daily Walk
    { category: 'daily_walk', text: 'The finished work of Christ (grace, forgiveness, new identity) inspires my daily life.' },
    { category: 'daily_walk', text: 'I consciously start or end my day with God (prayer, Bible, silence).' },
    { category: 'daily_walk', text: 'My trust in God is stronger than performance, pressure, or guilt.' },
    { category: 'daily_walk', text: "God's Word shapes my decisions in everyday life." },
    { category: 'daily_walk', text: 'I expect God to speak to me and lead me today.' },
    { category: 'daily_walk', text: 'My faith gives me hope, peace, and direction in everyday life.' },
    // Relationships
    { category: 'relationships', text: 'I have at least one person who is allowed to speak honestly into my life.' },
    { category: 'relationships', text: 'I consciously learn from someone who is further along spiritually than I am.' },
    { category: 'relationships', text: 'I am part of a Small Group or a committed community.' },
    { category: 'relationships', text: 'I openly share my challenges, doubts, and victories.' },
    { category: 'relationships', text: 'I pray regularly with or for others.' },
    { category: 'relationships', text: 'I experience spiritual growth through relationships.' },
    // Serve
    { category: 'serve', text: 'I am willing to sacrifice time and energy to serve others.' },
    { category: 'serve', text: "I serve not only when it's convenient, but even when it costs me something." },
    { category: 'serve', text: 'I see my service as an expression of my love for God.' },
    { category: 'serve', text: 'I actively use my gifts in the church or for others.' },
    { category: 'serve', text: 'I take responsibility for people, not just for tasks.' },
    { category: 'serve', text: 'My service helps others to get closer to Jesus.' },
    // Mission
    { category: 'mission', text: 'I have a VIP (a person on the way to God) for whom I pray.' },
    { category: 'mission', text: 'I meet regularly with this VIP to be a friend and companion.' },
    { category: 'mission', text: 'My life makes people curious about my faith.' },
    { category: 'mission', text: 'I speak naturally and honestly about my faith when opportunities arise.' },
    { category: 'mission', text: 'I consciously invite people into my life or into the church.' },
    { category: 'mission', text: 'I see myself as part of God\'s mission in everyday life.' },
    // Generosity
    { category: 'generosity', text: 'I prioritize giving 10% of my income to support the mission of the church.', isPercentage: true },
    { category: 'generosity', text: 'I consciously invest time to strengthen people in my church family.' },
    { category: 'generosity', text: 'I trust God with my finances - even in uncertainty.' },
    { category: 'generosity', text: 'I have a written budget that reflects my values.' },
    { category: 'generosity', text: 'Generosity is a lifestyle for me, not just an action.' },
    { category: 'generosity', text: 'I experience joy and freedom in giving.' }
];

const RadarChart: React.FC<{ scores: { [key: string]: number } }> = ({ scores }) => {
    const size = 300;
    const center = size / 2;
    const radius = size * 0.4;
    
    const points = CATEGORIES.map((cat, i) => {
        const score = scores[cat.id] || 0;
        const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
        const r = (score / 10) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const grids = [0.2, 0.4, 0.6, 0.8, 1].map(factor => (
        <polygon 
            key={factor}
            points={CATEGORIES.map((_, i) => {
                const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
                const r = radius * factor;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ')}
            className="fill-none stroke-white/20 stroke-1"
        />
    ));

    const axes = CATEGORIES.map((cat, i) => {
        const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} className="stroke-white/20 stroke-1" />;
    });

    return (
        <svg width={size} height={size} className="mx-auto overflow-visible drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            {grids}
            {axes}
            <polygon 
                points={points} 
                className="fill-hey-church-yellow/40 stroke-hey-church-yellow stroke-[3] transition-all duration-1000 ease-out"
            />
            {CATEGORIES.map((cat, i) => {
                const score = scores[cat.id] || 0;
                const angle = (Math.PI * 2 * i) / CATEGORIES.length - Math.PI / 2;
                const r = (score / 10) * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return (
                    <g key={i}>
                        <circle cx={x} cy={y} r="6" fill={cat.color} className="transition-all duration-1000" />
                        <circle cx={x} cy={y} r="10" fill={cat.color} className="animate-pulse opacity-20" />
                    </g>
                );
            })}
        </svg>
    );
};

const AssessmentPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [showIntro, setShowIntro] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(0));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [feedback, setFeedback] = useState('');

    // FIX: Get current daily spirit snack for GuidedPrayerModal
    const spiritSnack = useMemo(() => getDailySpiritSnack(), []);

    // Internal Modal Controls
    const [showSpiritSnack, setShowSpiritSnack] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    const categoryAverages = useMemo(() => {
        const results: { [key: string]: number } = {};
        CATEGORIES.forEach(cat => {
            const catQuestions = QUESTIONS.map((q, i) => ({ ...q, index: i })).filter(q => q.category === cat.id);
            const sum = catQuestions.reduce((acc, q) => acc + answers[q.index], 0);
            results[cat.id] = sum / (catQuestions.length || 1);
        });
        return results;
    }, [answers]);

    const handleSliderChange = (val: number) => {
        const newAnswers = [...answers];
        newAnswers[step] = val;
        setAnswers(newAnswers);
    };

    const handleNext = async () => {
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            try {
                const feedbackText = await generateAssessmentFeedback(user!, categoryAverages);
                setFeedback(feedbackText);
                
                const lowestEntry = Object.entries(categoryAverages).sort((a, b) => (a[1] as number) - (b[1] as number))[0];
                const result: AssessmentResult = {
                    date: new Date().toISOString(),
                    scores: categoryAverages,
                    feedback: feedbackText,
                    lowestCategory: lowestEntry[0]
                };

                await updateUserData(user!.id, {
                    assessmentResults: [result, ...(user!.assessmentResults || [])],
                    points: (user!.points || 0) + 250 // Extra points for completion
                });
                
                setShowResults(true);
            } catch (e) {
                console.error(e);
                alert("Failed to process your results. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleQuestAction = (cat: any) => {
        if (cat.externalUrl) {
            window.open(cat.externalUrl, '_blank');
        } else if (cat.internalAction === 'spirit_snack') {
            setShowSpiritSnack(true);
        } else if (cat.internalAction === 'invite') {
            setShowInvite(true);
        }
    };

    // --- VIEW 1: INTRO SCREEN ---
    if (showIntro) {
        return (
            <div className="min-h-screen bg-hey-church-bg text-white p-6 flex flex-col justify-center animate-in fade-in duration-700">
                <div className="max-w-md mx-auto w-full space-y-10">
                    <div className="text-center relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-10">
                            <Compass size={180} className="text-white animate-spin-slow" />
                        </div>
                        <h1 className="text-6xl font-black uppercase tracking-tighter italic text-hey-church-orange-500 drop-shadow-2xl relative z-10">Faith Check</h1>
                        <p className="text-gray-300 mt-4 font-black uppercase tracking-[0.3em] text-xs">Visualize Your Calling</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-8 backdrop-blur-xl">
                        <div className="flex items-start space-x-5">
                            <div className="bg-hey-church-blue/20 p-4 rounded-2xl border border-hey-church-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                <MapIcon className="text-hey-church-blue" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-xs text-hey-church-blue tracking-widest mb-1">Growth Mapping</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">This isn't a test—it's a mirror. See exactly where your roots are strong and where your next breakthrough is waiting.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-5">
                            <div className="bg-hey-church-yellow/20 p-4 rounded-2xl border border-hey-church-yellow/30 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                                <Quote className="text-hey-church-yellow" size={24} />
                            </div>
                            <div>
                                <h3 className="font-black uppercase text-xs text-hey-church-yellow tracking-widest mb-1">Prophetic Insight</h3>
                                <p className="text-sm text-gray-300 leading-relaxed">Receive a personal, AI-powered visionary analysis from Pastor Victor based on your unique results.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            onClick={() => setShowIntro(false)}
                            className="w-full bg-gradient-to-r from-hey-church-orange-500 to-hey-church-red text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-[0_20px_50px_rgba(239,109,77,0.4)] flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all group"
                        >
                            BEGIN ASSESSMENT <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={28} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: SUBMITTING / LOADING ---
    if (isSubmitting) {
        return (
            <div className="min-h-screen bg-hey-church-bg text-white p-8 flex flex-col items-center justify-center text-center">
                <div className="relative mb-12">
                    <Compass size={100} className="text-hey-church-yellow animate-spin-slow" />
                    <div className="absolute inset-0 bg-hey-church-yellow blur-[60px] opacity-20"></div>
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter italic animate-pulse">Scanning the Horizons...</h2>
                <p className="text-gray-400 mt-6 max-w-xs font-bold uppercase tracking-widest text-[10px] leading-relaxed">Pastor Victor is analyzing your growth map to craft your prophetic visionary note.</p>
                <div className="mt-16 w-full max-w-xs bg-gray-800 h-1.5 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-hey-church-yellow to-hey-church-red h-full animate-progress-indefinite"></div>
                </div>
            </div>
        );
    }

    // --- VIEW 3: RESULTS SCREEN ---
    if (showResults) {
        const lowestCategoryEntry = Object.entries(categoryAverages).sort((a, b) => (a[1] as number) - (b[1] as number))[0];
        const lowestCategory = CATEGORIES.find(c => c.id === lowestCategoryEntry[0])!;
        
        return (
            <div className="min-h-screen bg-hey-church-bg text-white p-6 pb-24 animate-in fade-in duration-1000">
                <div className="text-center mb-12 pt-10">
                    <div className="inline-block p-5 bg-hey-church-yellow/10 border border-hey-church-yellow/20 rounded-full mb-4 shadow-2xl">
                        <Trophy className="text-hey-church-yellow" size={56} />
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">Faith Check Complete</h1>
                    <p className="text-gray-500 mt-3 font-black uppercase tracking-[0.4em] text-[9px]">Assessment Result • +250 Points Earned</p>
                </div>

                {/* VISUAL RADAR MAP */}
                <div className="bg-gray-800/40 border border-white/5 rounded-[3.5rem] p-10 mb-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <RadarChart scores={categoryAverages} />
                    
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {CATEGORIES.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-3 bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: cat.color }}></div>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex-grow">{cat.label}</span>
                                <span className="text-sm font-black text-white">{categoryAverages[cat.id].toFixed(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PASTOR VICTOR'S PROPHETIC VISION NOTE */}
                <div className="bg-[#fcfbf7] text-gray-900 rounded-[3.5rem] p-10 mb-12 shadow-[0_60px_120px_rgba(0,0,0,0.7)] relative overflow-hidden border-[8px] border-hey-church-yellow/10">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none">
                        <Signature size={200} className="text-black" />
                    </div>
                    
                    <div className="flex items-center mb-10 border-b border-gray-200 pb-8">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-hey-church-orange-500 mr-5 shadow-2xl">
                            {/* NEW IMAGE INTEGRATION */}
                            <img 
                                src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0268998518.firebasestorage.app/o/pastor_victor_portrait.png?alt=media&token=8e6d3c2c-8a2a-4c2c-9a1c-7e6d3c2c8a2a" 
                                alt="Pastor Victor" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400";
                                }}
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight leading-none italic">Pastor Victor</h3>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-hey-church-orange-600 mt-1.5 flex items-center">
                                <CheckCircle size={10} className="mr-1.5" /> Prophetic Lead & Visionary
                            </p>
                        </div>
                    </div>

                    <div className="prose prose-lg leading-[1.8] font-medium text-gray-800 space-y-6">
                        {feedback.split('\n').map((para, i) => para.trim() ? (
                            <p key={i} className="text-lg md:text-xl font-serif">
                                {para.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-hey-church-orange-700 font-black border-b-2 border-hey-church-orange-200">{part}</strong> : part)}
                            </p>
                        ) : null)}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end">
                        <div className="opacity-30 font-serif italic text-sm max-w-[50%]">
                            "May He finish the great work He has started in you..."
                        </div>
                        <div className="text-right">
                             <p className="font-serif italic text-2xl leading-none text-gray-900">Victor Akko</p>
                             <p className="text-[8px] font-black uppercase tracking-[0.4em] mt-2 text-gray-400">HEY CHURCH GLOBAL</p>
                        </div>
                    </div>
                </div>

                {/* THE BREAKTHROUGH QUEST (PRIMARY CTA) */}
                <div className="bg-gradient-to-br from-[#133666] to-[#0a1e3b] border-2 border-hey-church-yellow/40 rounded-[3.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden mb-16 group">
                    <div className="absolute -right-10 -bottom-10 opacity-[0.05] pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-1000">
                         <lowestCategory.icon size={280} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center space-x-3 mb-8">
                            <span className="bg-hey-church-yellow text-black px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">PRIMARY BREAKTHROUGH</span>
                            <div className="flex-grow h-0.5 bg-white/10 rounded-full"></div>
                        </div>
                        
                        <h3 className="text-4xl font-black uppercase leading-[1.1] mb-4 italic tracking-tighter">{lowestCategory.nextStepTitle}</h3>
                        <p className="text-blue-100 text-xl mb-10 leading-relaxed font-medium max-w-[90%] opacity-80">{lowestCategory.nextStepDesc}</p>
                        
                        <button 
                            onClick={() => handleQuestAction(lowestCategory)}
                            className="w-full bg-white text-[#133666] py-6 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                        >
                            {lowestCategory.actionLabel} 
                            {lowestCategory.externalUrl ? <ExternalLink className="ml-3" size={24} /> : <ArrowRight className="ml-3" size={24} />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col space-y-4">
                    <button 
                        onClick={() => navigate('/home')}
                        className="w-full py-7 rounded-[2.5rem] font-black text-gray-500 uppercase tracking-[0.5em] text-[10px] hover:text-white transition-all bg-white/5 border border-white/5 hover:bg-white/10"
                    >
                        RETURN TO DASHBOARD
                    </button>
                </div>
                
                {/* FIX: Provided required snack prop to GuidedPrayerModal */}
                {showSpiritSnack && spiritSnack && <GuidedPrayerModal snack={spiritSnack} onClose={() => setShowSpiritSnack(false)} />}
                {showInvite && user && (
                    <InviteFriendModal 
                        user={user} 
                        onClose={() => setShowInvite(false)}
                        target={{
                            id: 'home',
                            title: 'Hey Life App',
                            type: 'lesson', 
                            data: { title: 'Hey Life App' },
                            courseId: 'app'
                        }}
                    />
                )}
            </div>
        );
    }

    // --- VIEW 4: QUESTION FLOW ---
    const currentQuestion = QUESTIONS[step];
    const category = CATEGORIES.find(c => c.id === currentQuestion.category)!;
    const progress = ((step + 1) / QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-hey-church-bg text-white p-6 flex flex-col justify-between overflow-hidden">
            <div className="max-w-lg mx-auto w-full flex flex-col h-full">
                {/* Header/Progress */}
                <div className="flex items-center justify-between mb-12">
                    <button onClick={() => setShowIntro(true)} className="text-gray-500 p-2 hover:text-white transition-colors"><ArrowLeft size={28}/></button>
                    <div className="flex-grow mx-8 bg-gray-800/50 h-2 rounded-full overflow-hidden shadow-inner border border-white/5">
                        <div className="bg-gradient-to-r from-hey-church-orange-400 to-hey-church-red h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-500 tabular-nums tracking-widest">{step + 1}/{QUESTIONS.length}</span>
                </div>

                {/* Background Visual Hint */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none scale-150 transition-all duration-1000">
                    <RadarChart scores={categoryAverages} />
                </div>

                <div className="relative z-10 flex-grow flex flex-col justify-center">
                    <div className="mb-12 flex items-center space-x-5 animate-in slide-in-from-left-4 duration-500">
                        <div className="p-5 bg-white/10 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/10">
                            <category.icon className="text-white" size={32} />
                        </div>
                        <div>
                            <span className="text-xs font-black uppercase tracking-[0.5em] text-hey-church-yellow">{category.label}</span>
                            <div className="h-0.5 w-16 bg-hey-church-yellow mt-2 rounded-full opacity-60"></div>
                        </div>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black uppercase leading-[1.1] mb-20 drop-shadow-2xl italic tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {currentQuestion.text}
                    </h2>

                    <div className="space-y-16">
                        <div className="relative group px-2">
                            <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                step="1"
                                value={answers[step]}
                                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                                className="w-full h-4 bg-gray-800 rounded-full appearance-none cursor-pointer accent-hey-church-orange-500 shadow-inner"
                            />
                            <div className="flex justify-between mt-8 text-[12px] font-black uppercase text-gray-500 tracking-[0.25em]">
                                <span className={answers[step] === 0 ? 'text-hey-church-red animate-pulse' : ''}>{currentQuestion.isPercentage ? '0%' : 'Not at all'}</span>
                                <span className={answers[step] === 10 ? 'text-hey-church-green animate-pulse' : ''}>{currentQuestion.isPercentage ? '100%' : 'Totally true'}</span>
                            </div>
                        </div>

                        <div className="flex justify-center relative">
                            <div className="text-[14rem] font-black text-white/5 select-none tabular-nums leading-none tracking-tighter pointer-events-none">
                                {answers[step]}{currentQuestion.isPercentage ? '%' : ''}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 bg-hey-church-yellow/5 rounded-full blur-[100px] animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 relative z-10 pb-10">
                    <button 
                        onClick={handleNext}
                        disabled={isSubmitting}
                        className="w-full bg-white text-hey-church-bg py-7 rounded-[3rem] font-black text-2xl shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={32} /> : step === QUESTIONS.length - 1 ? 'REVEAL MY MAP' : 'NEXT STEP'}
                    </button>
                    {step > 0 && (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="w-full mt-8 text-gray-500 font-black uppercase tracking-[0.5em] text-[10px] hover:text-white transition-colors"
                        >
                            GO BACK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentPage;

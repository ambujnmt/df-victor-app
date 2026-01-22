
import React, { useState, useEffect, FC, useRef } from 'react';
import { Course, Session, AcademyPathId, QuizQuestion, Challenge, User, HeyFam, Submission, ResourceLink, GlobalContent } from '../types';
import { 
    ArrowLeft, Loader2, PlusCircle, Edit, Trash2, X, 
    Youtube, BookOpen, MessageSquare, Award, Users, 
    HelpCircle, ChevronDown, AlignLeft, Book, Plus,
    CheckCircle, Shield, UserCheck, Search, Filter,
    Trash, Save, ExternalLink, MessageCircle, Upload, Settings, Play, Image as ImageIcon, CreditCard, QrCode, Zap, AlertCircle, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as firebaseService from '../services/firebaseService';
import { useAuth } from '../App';
import { PATHS } from '../constants/academyPaths';

const getYouTubeId = (url: string) => {
    if (!url) return '';
    const cleanUrl = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) return cleanUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    if (match && match[2].length >= 11) return match[2].substring(0, 11);
    return cleanUrl;
};

// --- BIBLE VERSE EDITOR ---
const BibleVerseEditor: FC<{ verses: {reference: string, text: string}[], onChange: (v: any[]) => void }> = ({ verses, onChange }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                <Book size={12} className="mr-1.5 text-hey-church-yellow"/> Bible Verses (Study Tab)
            </h4>
            <button onClick={() => onChange([...(verses || []), { reference: '', text: '' }])} className="text-[10px] text-hey-church-yellow font-black flex items-center uppercase tracking-widest">
                <Plus size={12} className="mr-1"/> Add Verse
            </button>
        </div>
        {(verses || []).map((v, i) => (
            <div key={i} className="bg-gray-900/40 p-4 rounded-2xl border border-white/5 space-y-3 relative group animate-in slide-in-from-left-2">
                <button onClick={() => onChange(verses.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors">
                    <X size={16}/>
                </button>
                <div className="pr-10">
                    <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Reference</label>
                    <input 
                        placeholder="e.g. John 3:16" 
                        value={v.reference} 
                        onChange={e => { const newV = [...verses]; newV[i].reference = e.target.value; onChange(newV); }}
                        className="bg-transparent border-b border-gray-700 text-sm font-black text-hey-church-orange-400 outline-none w-full pb-1"
                    />
                </div>
                <div>
                    <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Full Scripture Text</label>
                    <textarea 
                        placeholder="Paste the verse content here..." 
                        value={v.text}
                        onChange={e => { const newV = [...verses]; newV[i].text = e.target.value; onChange(newV); }}
                        className="w-full bg-gray-900/50 p-3 rounded-lg text-xs text-gray-300 outline-none h-20 resize-none italic leading-relaxed"
                    />
                </div>
            </div>
        ))}
    </div>
);

// --- QUIZ EDITOR ---
const QuizEditor: FC<{ questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }> = ({ questions, onChange }) => {
    const addQuestion = () => {
        onChange([...(questions || []), { id: `q_${Date.now()}_${questions?.length || 0}`, question: '', options: ['', '', '', ''], correctAnswerIndices: [], explanation: '' }]);
    };
    const updateQ = (idx: number, field: keyof QuizQuestion, val: any) => {
        const newQs = [...questions];
        (newQs[idx] as any)[field] = val;
        onChange(newQs);
    };
    const toggleCorrectIndex = (qIdx: number, oIdx: number) => {
        const currentIndices = questions[qIdx].correctAnswerIndices || [];
        let newIndices;
        if (currentIndices.includes(oIdx)) {
            newIndices = currentIndices.filter(i => i !== oIdx);
        } else {
            newIndices = [...currentIndices, oIdx];
        }
        updateQ(qIdx, 'correctAnswerIndices', newIndices);
    };
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                    <HelpCircle size={12} className="mr-1.5 text-hey-church-blue"/> Knowledge Check
                </h4>
                <button onClick={addQuestion} className="text-[10px] bg-hey-church-blue/20 text-hey-church-blue px-3 py-1.5 rounded-full flex items-center font-black uppercase tracking-widest">
                    <Plus size={12} className="mr-1" /> Add Question
                </button>
            </div>
            {(questions || []).map((q, qIdx) => (
                <div key={q.id} className="bg-gray-900/40 p-5 rounded-2xl border border-white/5 space-y-4 relative group">
                    <button onClick={() => onChange(questions.filter((_, i) => i !== qIdx))} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                    <div>
                        <label className="text-[9px] font-black text-gray-600 uppercase mb-1 ml-1 block">Question Title</label>
                        <input placeholder="Type question here..." value={q.question} onChange={e => updateQ(qIdx, 'question', e.target.value)} className="w-full bg-gray-900 p-3 rounded-xl text-sm font-bold text-white border border-gray-800 outline-none" />
                    </div>
                    <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correctAnswerIndices?.includes(oIdx);
                            return (
                                <div key={oIdx} className={`flex items-center gap-3 p-2 rounded-xl ${isCorrect ? 'bg-hey-church-green/10 border border-hey-church-green/30' : ''}`}>
                                    <input type="checkbox" checked={isCorrect} onChange={() => toggleCorrectIndex(qIdx, oIdx)} className="w-5 h-5 rounded border-gray-700 text-hey-church-green" />
                                    <input placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => { const newOpts = [...q.options]; newOpts[oIdx] = e.target.value; updateQ(qIdx, 'options', newOpts); }} className="flex-grow bg-transparent text-xs text-white outline-none" />
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        <label className="text-[9px] font-black text-hey-church-yellow uppercase mb-1 ml-1 flex items-center">
                            <Lightbulb size={12} className="mr-1" /> Recap / Deep Dive Statement
                        </label>
                        <textarea 
                            placeholder="This text appears after the user answers correctly to reinforce the lesson..." 
                            value={q.explanation || ''} 
                            onChange={e => updateQ(qIdx, 'explanation', e.target.value)} 
                            className="w-full bg-gray-900 p-3 rounded-xl text-xs text-gray-300 border border-gray-800 outline-none h-20 resize-none focus:border-hey-church-yellow transition-colors"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- MODAL EDITORS ---
const CourseEditor: FC<{ course: Course | null, onSave: (c: Course) => void, onClose: () => void }> = ({ course, onSave, onClose }) => {
    const [form, setForm] = useState<Course>(course || { id: `course_${Date.now()}`, title: '', description: '', pathId: 'foundation', thumbnail: '', order: 1, isPublished: true, sessions: [] } as Course);
    const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);
    const updateSession = (idx: number, field: string, value: any) => {
        const newSessions = [...form.sessions];
        (newSessions[idx] as any)[field] = value;
        setForm({ ...form, sessions: newSessions });
    };
    return (
        <div className="fixed inset-0 bg-black/90 z-[50] flex flex-col overflow-hidden font-sans">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase italic">{course ? 'Edit Course' : 'New Course'}</h2>
                <div className="flex gap-3"><button onClick={onClose} className="px-5 py-2 text-gray-400 font-black uppercase text-xs">Cancel</button><button onClick={() => onSave(form)} className="px-8 py-2.5 bg-hey-church-green text-white rounded-xl font-black uppercase text-xs">Save Course</button></div>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-[#133666]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-800/40 p-8 rounded-[2.5rem] border border-white/5">
                    <div className="md:col-span-2 space-y-5">
                        <div><label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Course Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-black text-xl italic outline-none"/></div>
                        <div><label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Short Pitch</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white text-sm h-24 outline-none"/></div>
                    </div>
                    <div className="space-y-5">
                        <div><label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Learning Path</label><select value={form.pathId} onChange={e => setForm({...form, pathId: e.target.value as AcademyPathId})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-bold outline-none">{PATHS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
                        <div><label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Cover Image URL</label><input value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white text-xs font-mono"/></div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-2"><h3 className="text-2xl font-black text-white uppercase italic">Curriculum</h3><button onClick={() => setForm({...form, sessions: [...(form.sessions || []), { id: `s_${Date.now()}`, title: '', videoId: '', reflectionQuestions: [], bibleVerses: [], keyTakeaways: [] } as Session]}) } className="bg-hey-church-blue px-6 py-2.5 rounded-xl text-xs font-black uppercase flex items-center shadow-lg"><PlusCircle className="mr-2" size={16}/> Add Session</button></div>
                    <div className="space-y-4">{(form.sessions || []).map((session, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl">
                            <div className="p-5 bg-gray-750 flex justify-between items-center cursor-pointer hover:bg-gray-700" onClick={() => setEditingSessionIdx(editingSessionIdx === idx ? null : idx)}>
                                <div className="flex items-center gap-4"><span className="bg-gray-900 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black text-hey-church-orange-400">{idx + 1}</span><span className="font-black text-white uppercase italic">{session.title || 'Untitled Session'}</span></div>
                                <ChevronDown size={20} className={`text-gray-500 transition-transform ${editingSessionIdx === idx ? 'rotate-180' : ''}`}/>
                            </div>
                            {editingSessionIdx === idx && (
                                <div className="p-8 space-y-10 bg-gray-800/80 border-t border-white/5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div><label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Session Title</label><input value={session.title} onChange={e => updateSession(idx, 'title', e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold outline-none"/></div>
                                        <div><label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">YouTube URL / ID</label><input value={session.videoId} onChange={e => updateSession(idx, 'videoId', getYouTubeId(e.target.value))} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm outline-none"/></div>
                                    </div>
                                    <BibleVerseEditor verses={session.bibleVerses || []} onChange={v => updateSession(idx, 'bibleVerses', v)} />
                                    <QuizEditor questions={session.quizQuestions || []} onChange={qs => updateSession(idx, 'quizQuestions', qs)} />
                                    <div className="pt-6 border-t border-red-900/20 flex justify-end"><button onClick={() => { if(confirm('Remove?')) setForm({...form, sessions: form.sessions.filter((_, i) => i !== idx)}); }} className="text-red-500 text-[10px] font-black uppercase flex items-center hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"><Trash2 size={14} className="mr-2"/> Remove Session</button></div>
                                </div>
                            )}
                        </div>
                    ))}</div>
                </div>
            </div>
        </div>
    );
};

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'academy' | 'challenges' | 'fams' | 'users' | 'globals'>('academy');
    
    // Data States
    const [courses, setCourses] = useState<Course[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [fams, setFams] = useState<HeyFam[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [globalConfig, setGlobalConfig] = useState<GlobalContent | null>(null);
    
    // Edit States
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { 
        setLoading(true);
        if (activeTab === 'academy') firebaseService.getCourses().then(c => { setCourses(c); setLoading(false); }).catch(() => setLoading(false)); 
        if (activeTab === 'challenges') firebaseService.getChallenges().then(c => { setChallenges(c); setLoading(false); }).catch(() => setLoading(false));
        if (activeTab === 'fams') firebaseService.getHeyFams().then(f => { setFams(f); setLoading(false); }).catch(() => setLoading(false));
        if (activeTab === 'users') firebaseService.getAllUsers().then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
        if (activeTab === 'globals') firebaseService.getGlobalContent().then(g => { 
            setGlobalConfig(g); 
            setLoading(false); 
        }).catch(() => setLoading(false));
    }, [activeTab]);

    if (!user || user.role !== 'admin') return <div className="p-8 text-white text-center font-sans"><Shield size={64} className="mx-auto text-hey-church-red mb-6" /><h1 className="text-3xl font-black uppercase">Access Restricted</h1></div>;

    const handleSaveGlobalConfig = async () => {
        if (!globalConfig) return;
        setIsSavingConfig(true);
        try {
            await firebaseService.updateGlobalContent(globalConfig);
            alert("Settings updated successfully!");
        } catch (e) {
            alert("Failed to save settings.");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const sidebarItems = [
        { id: 'academy', label: 'Academy', icon: BookOpen },
        { id: 'challenges', label: 'Challenges', icon: Award },
        { id: 'fams', label: 'Hey Fams', icon: Users },
        { id: 'users', label: 'Members', icon: UserCheck },
        { id: 'globals', label: 'Global Config', icon: Settings }
    ];

    const isInAppGivingActive = !!(globalConfig?.paypalClientId || window.HEYCHURCH_APP_CONFIG?.PAYPAL_CLIENT_ID);

    return (
        <div className="bg-hey-church-bg min-h-screen text-white flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0">
                <div className="p-6 border-b border-gray-800"><h1 className="text-xl font-black uppercase italic">Hey Admin</h1></div>
                <nav className="p-4 space-y-2">
                    <button onClick={() => navigate('/home')} className="w-full flex items-center p-3 text-gray-500 hover:text-white rounded-2xl transition-all mb-4 font-black text-xs uppercase tracking-widest"><ArrowLeft size={16} className="mr-3"/> Back</button>
                    {sidebarItems.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center p-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === item.id ? 'bg-hey-church-blue text-white' : 'text-gray-500 hover:bg-gray-800'}`}>
                            <item.icon size={18} className="mr-3"/> {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow p-6 md:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    
                    {activeTab === 'academy' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex justify-between items-end mb-8"><h2 className="text-4xl font-black uppercase italic">Academy Courses</h2><button onClick={() => setIsCreatingCourse(true)} className="bg-hey-church-green px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center"><PlusCircle className="mr-2" size={18}/> New Course</button></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <div key={course.id} className="bg-gray-800 rounded-[2.5rem] p-6 border border-white/5 flex flex-col justify-between min-h-[160px]">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[8px] px-3 py-1.5 rounded-full bg-gray-900 text-gray-400 uppercase font-black tracking-[0.2em]">{course.pathId?.replace('_', ' ')}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingCourse(course)} className="p-2.5 bg-blue-900/30 text-blue-400 rounded-xl"><Edit size={16}/></button>
                                            </div>
                                        </div>
                                        <div><h3 className="font-black text-xl mb-1 text-white uppercase italic">{course.title}</h3><p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{course.sessions?.length || 0} sessions</p></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'globals' && (
                        <div className="animate-in fade-in duration-500 space-y-8">
                             <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h2 className="text-4xl font-black uppercase italic">Global Settings</h2>
                                    <p className="text-gray-500 text-xs mt-2 uppercase font-bold tracking-widest">Master controls for app-wide features</p>
                                </div>
                                <button onClick={handleSaveGlobalConfig} disabled={isSavingConfig} className="bg-hey-church-green px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-2xl hover:scale-105 transition-all">
                                    {isSavingConfig ? <Loader2 size={18} className="animate-spin mr-2"/> : <Save className="mr-2" size={18}/>} Save Config
                                </button>
                             </div>

                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Sermon Manager */}
                                <div className="bg-gray-800 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-6">
                                    <div className="flex items-center space-x-3 mb-2"><div className="p-3 bg-hey-church-red/20 rounded-2xl"><Youtube className="text-hey-church-red" /></div><h3 className="text-xl font-black uppercase italic">Hero Content</h3></div>
                                    <div className="space-y-4">
                                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Latest Sermon Title</label><input value={globalConfig?.latestMessage?.title || ''} onChange={e => setGlobalConfig(prev => prev ? {...prev, latestMessage: {...(prev.latestMessage || {videoId: ''}), title: e.target.value}} : null)} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-bold outline-none focus:border-hey-church-red" /></div>
                                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">YouTube Video ID / URL</label><input value={globalConfig?.latestMessage?.videoId || ''} onChange={e => setGlobalConfig(prev => prev ? {...prev, latestMessage: {...(prev.latestMessage || {title: ''}), videoId: getYouTubeId(e.target.value)}} : null)} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-mono text-sm outline-none focus:border-hey-church-red" /></div>
                                    </div>
                                </div>

                                {/* Donation Gate Manager */}
                                <div className="bg-gray-800 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3"><div className="p-3 bg-hey-church-blue/20 rounded-2xl"><CreditCard className="text-hey-church-blue" /></div><h3 className="text-xl font-black uppercase italic">Donation Gate</h3></div>
                                        {isInAppGivingActive ? (
                                            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center border border-green-500/30">
                                                <Zap size={10} className="mr-1"/> In-App Active
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center border border-yellow-500/30">
                                                <ExternalLink size={10} className="mr-1"/> Fallback Active
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-blue-900/10 p-4 rounded-2xl border border-blue-900/20">
                                            <p className="text-[10px] text-blue-300 leading-relaxed italic">
                                                Tip: Setting a <strong>PayPal Client ID</strong> enables members to give directly inside the app using Apple/Google Pay. If blank, the app uses your PayPal.me link as a fallback.
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">PayPal Client ID (Recommended)</label>
                                            <input 
                                                value={globalConfig?.paypalClientId || ''} 
                                                onChange={e => setGlobalConfig(prev => prev ? {...prev, paypalClientId: e.target.value} : null)}
                                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-mono text-xs outline-none focus:border-hey-church-blue"
                                                placeholder="Paste ID from PayPal Developer Portal..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">PayPal.me Link (Fallback)</label>
                                            <input 
                                                value={globalConfig?.donation?.paypalLink || ''} 
                                                onChange={e => setGlobalConfig(prev => prev ? {...prev, donation: {...(prev.donation || {}), paypalLink: e.target.value}} : null)}
                                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-bold outline-none focus:border-hey-church-blue"
                                                placeholder="https://paypal.me/yourchurch"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">QR Code Media Link</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    value={globalConfig?.donation?.qrCodeUrl || ''} 
                                                    onChange={e => setGlobalConfig(prev => prev ? {...prev, donation: {...(prev.donation || {}), qrCodeUrl: e.target.value}} : null)}
                                                    className="flex-grow p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white text-xs font-mono outline-none"
                                                    placeholder="Link to your donation QR graphic..."
                                                />
                                                <div className="bg-gray-900 p-4 rounded-2xl border border-gray-700 flex items-center justify-center">
                                                    <QrCode size={20} className="text-gray-600"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => navigate('/giving')} 
                                        className="w-full py-4 bg-gray-700/50 hover:bg-gray-700 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5"
                                    >
                                        <Play size={14} className="mr-2"/> Preview Member Giving View
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {(editingCourse || isCreatingCourse) && (
                <CourseEditor course={editingCourse} onSave={async (c) => { if (isCreatingCourse) await firebaseService.addCourse(c); else await firebaseService.updateCourse(c.id, c); setIsCreatingCourse(false); setEditingCourse(null); firebaseService.getCourses().then(setCourses); }} onClose={() => { setEditingCourse(null); setIsCreatingCourse(false); }} />
            )}
        </div>
    );
};

export default AdminPage;

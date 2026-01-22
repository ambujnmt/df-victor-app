
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { LearningGroup, User, Session, Course, Challenge, HeyFam } from '../types';
import * as firebaseService from '../services/firebaseService';
import { ArrowLeft, Users, CheckCircle, Circle, Send, Award, MessageSquare, Loader2, PlusCircle, Settings, Save, Upload, MapPin, Clock, X, Plus } from 'lucide-react';

// Helper for image processing (reused)
const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context error'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
        reader.onerror = (error) => reject(error);
    });
};

const LeaderDashboardPage: React.FC = () => {
    const { user: leader } = useAuth();
    const navigate = useNavigate();
    
    // Data State
    const [ledGroups, setLedGroups] = useState<HeyFam[]>([]); // Using HeyFam instead of LearningGroup for unification
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<HeyFam | null>(null);
    
    // UI Actions State
    const [announcement, setAnnouncement] = useState('');
    const [challengeSuggestion, setChallengeSuggestion] = useState('');
    
    // Edit Group Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<HeyFam>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);

    // Create Group State
    const [isCreatingFam, setIsCreatingFam] = useState(false);
    const [newFam, setNewFam] = useState({ name: '', description: '', meetingTime: '', meetingLocation: '' });

    useEffect(() => {
        const fetchData = async () => {
            if (!leader) return;
            setLoading(true);
            try {
                // Fetch ALL data needed
                const [fams, users, challenges] = await Promise.all([
                    firebaseService.getHeyFams(),
                    firebaseService.getAllUsers(),
                    firebaseService.getChallenges()
                ]);
                
                // Filter groups led by current user
                const userLedGroups = fams.filter(g => g.leaderId === leader.id);
                setLedGroups(userLedGroups);
                setAllUsers(users);
                setAllChallenges(challenges);
                
                if (userLedGroups.length > 0) {
                    setSelectedGroup(userLedGroups[0]);
                }
            } catch (error) {
                console.error("Error fetching leader data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [leader]);

    const groupMembers = useMemo(() => {
        if (!selectedGroup) return [];
        return allUsers.filter(u => selectedGroup.memberIds.includes(u.id));
    }, [selectedGroup, allUsers]);
    
    const handleSendAnnouncement = async () => {
        if (!announcement.trim() || !selectedGroup || !leader) return;
        const message = { userId: leader.id, userName: leader.name, userAvatar: leader.avatar, content: announcement };
        // Use the HeyFam specific service
        await firebaseService.addMessageToHeyFam(selectedGroup.id, { ...message, type: 'announcement' });
        setAnnouncement('');
        alert('Announcement sent to group chat!');
    };
    
    const handleSuggestChallenge = async () => {
        if (!challengeSuggestion || !selectedGroup || !leader) return;
        const challenge = allChallenges.find(c => c.id === challengeSuggestion);
        if (challenge) {
            // NOTE: Using the generic group notification service, updated to handle HeyFam ID if needed
            // For now, we will post it as an announcement in the Hey Fam chat
             const message = { 
                 userId: leader.id, 
                 userName: leader.name, 
                 userAvatar: leader.avatar, 
                 content: `I challenge us to try the "${challenge.title}" challenge together!`,
                 type: 'announcement'
            };
            await firebaseService.addMessageToHeyFam(selectedGroup.id, message);
            setChallengeSuggestion('');
            alert('Challenge suggestion posted!');
        }
    };

    const handleCreateFam = async () => {
        if(!leader || !newFam.name || !newFam.description) return;
        const famData: Omit<HeyFam, 'id'> = {
            name: newFam.name,
            description: newFam.description,
            meetingTime: newFam.meetingTime,
            meetingLocation: newFam.meetingLocation,
            leaderId: leader.id,
            memberIds: [leader.id],
            avatar: `https://ui-avatars.com/api/?name=${newFam.name}&background=random`,
            messages: [],
            resources: [],
            memberCount: 1
        };
        
        try {
            const id = await firebaseService.createHeyFam(famData);
            await firebaseService.joinHeyFam(leader.id, id);
            alert("Hey Fam Created! Refresh to manage it.");
            setIsCreatingFam(false);
            setNewFam({ name: '', description: '', meetingTime: '', meetingLocation: '' });
            window.location.reload(); 
        } catch(e) {
            console.error(e);
            alert("Failed to create group.");
        }
    };

    // --- EDIT GROUP FUNCTIONS ---
    const openEditModal = () => {
        if (selectedGroup) {
            setEditForm({
                name: selectedGroup.name,
                description: selectedGroup.description,
                meetingTime: selectedGroup.meetingTime,
                meetingLocation: selectedGroup.meetingLocation,
                avatar: selectedGroup.avatar
            });
            setIsEditing(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedGroup || !editForm.name) return;
        try {
            await firebaseService.updateHeyFam(selectedGroup.id, editForm);
            // Update local state
            const updatedGroup = { ...selectedGroup, ...editForm } as HeyFam;
            setSelectedGroup(updatedGroup);
            setLedGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
            setIsEditing(false);
            alert("Group Settings Saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save changes.");
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsProcessingImage(true);
            try {
                const base64 = await processImage(file);
                setEditForm(prev => ({ ...prev, avatar: base64 }));
            } catch (error) {
                console.error("Image upload failed", error);
                alert("Failed to process image.");
            } finally {
                setIsProcessingImage(false);
            }
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-hey-church-bg flex items-center justify-center text-white"><Loader2 className="animate-spin h-8 w-8"/></div>;
    }

    return (
        <div className="p-4 space-y-6 bg-hey-church-bg min-h-screen text-white pb-24">
            <div className="flex justify-between items-center">
                <button onClick={() => navigate('/my-plan')} className="flex items-center text-hey-church-orange-400">
                    <ArrowLeft size={16} className="mr-2"/> Back to Profile
                </button>
                <div className="text-xs bg-hey-church-blue px-2 py-1 rounded-full font-bold">Leader Mode</div>
            </div>
            
            <h1 className="text-3xl font-extrabold uppercase">Leader Dashboard</h1>

            {/* Create Hey Fam Section (Visible if no groups or want to add more) */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-hey-church-blue/30">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold flex items-center"><Users className="mr-2 text-hey-church-orange-400"/> My Groups</h2>
                    <button onClick={() => setIsCreatingFam(!isCreatingFam)} className="text-xs bg-hey-church-green px-3 py-1 rounded-full flex items-center font-bold">
                        <PlusCircle size={14} className="mr-1"/> Create New
                    </button>
                </div>
                
                {isCreatingFam && (
                    <div className="space-y-3 bg-gray-700 p-4 rounded-lg animate-in fade-in slide-in-from-top-2 mt-4">
                        <h3 className="font-bold text-sm text-gray-300">New Group Details</h3>
                        <input placeholder="Group Name (e.g. Morning Crew)" value={newFam.name} onChange={e => setNewFam({...newFam, name: e.target.value})} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"/>
                        <input placeholder="Short Description" value={newFam.description} onChange={e => setNewFam({...newFam, description: e.target.value})} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"/>
                        <input placeholder="Meeting Time (e.g. Tuesdays 7pm)" value={newFam.meetingTime} onChange={e => setNewFam({...newFam, meetingTime: e.target.value})} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"/>
                        <input placeholder="Location" value={newFam.meetingLocation} onChange={e => setNewFam({...newFam, meetingLocation: e.target.value})} className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"/>
                        <button onClick={handleCreateFam} className="w-full bg-hey-church-red font-bold py-2 rounded hover:bg-opacity-90">Launch Group</button>
                    </div>
                )}
            </div>

            {/* Group Selector */}
            {ledGroups.length > 0 ? (
                <div className="space-y-4">
                    <select 
                        value={selectedGroup?.id || ''} 
                        onChange={e => setSelectedGroup(ledGroups.find(g => g.id === e.target.value) || null)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-bold"
                    >
                        {ledGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
            ) : (
                 <p className="text-gray-400 text-sm">You are not leading any groups yet.</p>
            )}
            
            {/* ACTIVE GROUP MANAGEMENT */}
            {selectedGroup && (
                <div className="space-y-6 animate-in fade-in">
                    
                    {/* 1. Group Profile Card */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-xl border border-gray-700 relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center">
                                <img src={selectedGroup.avatar} className="w-16 h-16 rounded-full border-4 border-hey-church-blue object-cover shadow-md mr-4"/>
                                <div>
                                    <h2 className="text-xl font-extrabold text-white">{selectedGroup.name}</h2>
                                    <p className="text-sm text-gray-400 font-medium">{groupMembers.length} Members</p>
                                </div>
                            </div>
                            <button 
                                onClick={openEditModal}
                                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors flex flex-col items-center"
                                title="Edit Group Settings"
                            >
                                <Settings size={20} className="mb-1 text-hey-church-orange-400"/>
                                <span className="text-[10px] font-bold uppercase">Edit</span>
                            </button>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm relative z-10">
                            <div className="bg-black/20 p-2 rounded-lg flex items-center">
                                <Clock size={16} className="text-hey-church-yellow mr-2"/>
                                <span className="truncate">{selectedGroup.meetingTime || 'Set Time'}</span>
                            </div>
                            <div className="bg-black/20 p-2 rounded-lg flex items-center">
                                <MapPin size={16} className="text-hey-church-yellow mr-2"/>
                                <span className="truncate">{selectedGroup.meetingLocation || 'Set Location'}</span>
                            </div>
                        </div>
                        
                        {/* Background decoration */}
                        <Users size={120} className="absolute -right-4 -bottom-4 text-white opacity-5 pointer-events-none"/>
                    </div>

                    {/* 2. Communication Tools */}
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                         <h2 className="text-lg font-bold mb-4 flex items-center"><MessageSquare className="mr-2 text-hey-church-orange-400"/> Group Communication</h2>
                         
                         <div className="mb-4">
                             <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Post Announcement</label>
                             <div className="flex gap-2">
                                <input 
                                    value={announcement}
                                    onChange={e => setAnnouncement(e.target.value)}
                                    placeholder="Important message..."
                                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                                />
                                <button onClick={handleSendAnnouncement} className="bg-hey-church-blue p-2 rounded-md text-white hover:bg-opacity-90">
                                    <Send size={18}/>
                                </button>
                             </div>
                         </div>

                         <div>
                             <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Suggest Challenge</label>
                             <div className="flex gap-2">
                                 <select
                                    value={challengeSuggestion}
                                    onChange={e => setChallengeSuggestion(e.target.value)}
                                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                                 >
                                    <option value="">-- Select Challenge --</option>
                                    {allChallenges.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                 </select>
                                 <button onClick={handleSuggestChallenge} className="bg-hey-church-green p-2 rounded-md text-white hover:bg-opacity-90">
                                    <Award size={18}/>
                                 </button>
                             </div>
                         </div>
                    </div>
                    
                    {/* 3. Member List (Read Only for now) */}
                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg">
                        <h2 className="text-lg font-bold mb-3 flex items-center"><Users className="mr-2 text-gray-400"/> Members</h2>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {groupMembers.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center">
                                        <img src={m.avatar} className="w-8 h-8 rounded-full mr-3"/>
                                        <span className="font-semibold text-sm">{m.name}</span>
                                    </div>
                                    <span className="text-xs text-hey-church-yellow font-mono">{m.points} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- EDIT GROUP MODAL --- */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative border border-gray-700">
                        <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24}/></button>
                        <h2 className="text-xl font-bold mb-6 flex items-center text-white"><Settings className="mr-2 text-hey-church-orange-400"/> Edit Group Profile</h2>
                        
                        <div className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-4">
                                <img src={editForm.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"/>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isProcessingImage}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-bold flex items-center"
                                >
                                    {isProcessingImage ? <Loader2 className="animate-spin mr-2" size={16}/> : <Upload className="mr-2" size={16}/>}
                                    Change Image
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Group Name</label>
                                <input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white mt-1"/>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                                <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white mt-1 h-20"/>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Meeting Time</label>
                                    <input value={editForm.meetingTime || ''} onChange={e => setEditForm({...editForm, meetingTime: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white mt-1"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
                                    <input value={editForm.meetingLocation || ''} onChange={e => setEditForm({...editForm, meetingLocation: e.target.value})} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white mt-1"/>
                                </div>
                            </div>

                            <button onClick={handleSaveEdit} className="w-full bg-hey-church-green text-white font-bold py-3 rounded-xl mt-4 flex items-center justify-center hover:scale-[1.02] transition-transform">
                                <Save className="mr-2" size={18}/> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderDashboardPage;

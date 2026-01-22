import React, { useState } from 'react';
import { User, Challenge, Session } from '../types';
import { X, Send, Loader2, Share2 } from 'lucide-react';
import { sendChallengeInvitation, sendLessonInvitation } from '../services/firebaseService';

interface InviteFriendModalProps {
    target: {
        id: string;
        title: string;
        type: 'challenge' | 'lesson';
        data?: any; // Challenge or Session object
        courseId?: string; // Required if type is 'lesson'
    };
    user: User;
    onClose: () => void;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ target, user, onClose }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSendDirectInvitation = async () => {
        if (!email.trim()) {
            setStatus('error');
            setMessage('Please enter an email address.');
            return;
        }
        setStatus('sending');
        setMessage('');
        
        let result;
        
        if (target.type === 'challenge') {
             result = await sendChallengeInvitation(user, email, target.data as Challenge);
        } else if (target.type === 'lesson' && target.courseId) {
             result = await sendLessonInvitation(user, email, target.data as Session, target.courseId);
        } else {
            result = { success: false, message: "Invalid invitation type." };
        }

        if (result.success) {
            setStatus('success');
        } else {
            setStatus('error');
        }
        setMessage(result.message);
    };

    const handleShareLink = () => {
        const link = target.type === 'lesson' 
            ? `${window.location.origin}/#/academy/${target.courseId}/session/${target.id}`
            : `${window.location.origin}/#/challenges/${target.id}`;

        const text = target.type === 'lesson'
            ? `${user.name} invited you to watch the lesson "${target.title}" on Hey Life!`
            : `${user.name} invited you to the "${target.title}" challenge on Hey Life!`;

        if (navigator.share) {
            navigator.share({
                title: `Join me on Hey Life!`,
                text: text,
                url: link,
            }).catch(error => console.error('Error sharing:', error));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(`${text} ${link}`);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold">Invite a Friend</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-300 font-medium text-center">
                        Share "{target.title}"
                    </p>

                    <div>
                        <p className="text-sm text-gray-400 mb-2">For anyone, on any platform:</p>
                        <button onClick={handleShareLink} className="w-full bg-hey-church-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 flex items-center justify-center transition-transform hover:scale-105">
                            <Share2 className="mr-2" size={18}/> Share Invite Link
                        </button>
                    </div>
                    
                    <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-gray-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">OR</span>
                        <div className="flex-grow border-t border-gray-700"></div>
                    </div>
                    
                    <div>
                         <p className="text-sm text-gray-400 mb-2">For an existing Hey Life member:</p>
                        <div className="flex space-x-2">
                             <input 
                                type="email" 
                                placeholder="Enter their email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
                            />
                            <button onClick={handleSendDirectInvitation} disabled={status === 'sending'} className="bg-hey-church-red text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 flex items-center justify-center disabled:bg-gray-600">
                                {status === 'sending' ? <Loader2 className="animate-spin" size={20}/> : <Send size={18}/>}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm text-center ${status === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteFriendModal;
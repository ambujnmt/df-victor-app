import React from 'react';
import { useAuth } from '../App';
import { AppNotification } from '../types';
import { X, Check, Bell, ThumbsDown, ArrowRight, PlayCircle } from 'lucide-react';
import { respondToChallengeInvitation, markNotificationAsRead } from '../services/firebaseService';
import { useNavigate } from 'react-router-dom';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationCard: React.FC<{ notification: AppNotification; onClosePanel: () => void }> = ({ notification, onClosePanel }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const handleResponse = async (accepted: boolean) => {
        if (!user) return;
        try {
            await respondToChallengeInvitation(notification.relatedId, notification.id, user, accepted);
            // The listener in App.tsx will update the UI.
        } catch (error) {
            console.error("Failed to respond to invitation:", error);
            alert("Could not respond to the invitation. Please try again.");
        }
    };

    const handleMarkAsRead = async () => {
        if (!user) return;
        await markNotificationAsRead(user.id, notification.id);
    };

    const handleViewChallenge = () => {
        navigate('/challenges');
        onClosePanel();
    };
    
    const handleViewLesson = () => {
        // notification.relatedId is formatted as "courseId/session/sessionId"
        navigate(`/academy/${notification.relatedId}`);
        onClosePanel();
        handleMarkAsRead();
    };

    const timeAgo = (date: any) => {
        if (!date || !date.seconds) return 'just now';
        const seconds = Math.floor((new Date().getTime() - new Date(date.seconds * 1000).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className={`p-4 rounded-lg ${notification.isRead ? 'bg-gray-800' : 'bg-hey-church-blue/50'}`}>
            <p className="text-sm text-gray-300">{notification.text}</p>
            <p className="text-xs text-gray-500 mt-1">{timeAgo(notification.createdAt)}</p>
            {notification.type === 'challenge_invitation' && !notification.isRead && (
                <div className="flex space-x-2 mt-3">
                    <button onClick={() => handleResponse(true)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 text-xs rounded-lg flex items-center justify-center">
                        <Check size={14} className="mr-1"/> Accept
                    </button>
                    <button onClick={() => handleResponse(false)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 text-xs rounded-lg flex items-center justify-center">
                        <ThumbsDown size={14} className="mr-1"/> Decline
                    </button>
                </div>
            )}
            {notification.type === 'group_challenge_suggestion' && !notification.isRead && (
                 <button onClick={handleViewChallenge} className="w-full mt-3 bg-hey-church-orange-600 text-white font-bold py-2 px-3 text-xs rounded-lg flex items-center justify-center">
                    View Challenge <ArrowRight size={14} className="ml-1"/>
                </button>
            )}
            {notification.type === 'lesson_invitation' && (
                 <button onClick={handleViewLesson} className="w-full mt-3 bg-hey-church-red text-white font-bold py-2 px-3 text-xs rounded-lg flex items-center justify-center">
                    Watch Lesson <PlayCircle size={14} className="ml-1"/>
                </button>
            )}
            {notification.type === 'generic' && !notification.isRead && (
                 <button onClick={handleMarkAsRead} className="w-full mt-3 bg-gray-700 text-white font-bold py-2 px-3 text-xs rounded-lg">
                    Mark as Read
                </button>
            )}
        </div>
    );
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const { notifications } = useAuth();

    return (
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold flex items-center"><Bell className="mr-2"/> Notifications</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto flex-grow">
                    {notifications.length > 0 ? (
                        notifications.map(n => <NotificationCard key={n.id} notification={n} onClosePanel={onClose}/>)
                    ) : (
                        <div className="text-center text-gray-500 pt-10">
                            <p>You're all caught up!</p>
                            <p className="text-xs mt-1">New notifications will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPanel;
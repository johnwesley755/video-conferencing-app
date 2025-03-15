import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWebRTC } from '../../hooks/useWebRTC';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, X } from 'lucide-react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export const Chat: React.FC<ChatProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { authState } = useAuth();
  const { meetingId } = useWebRTC();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!meetingId) return;
    
    const messagesRef = collection(db, 'meetings', meetingId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          timestamp: data.timestamp.toDate(),
        } as ChatMessage;
      });
      
      setMessages(newMessages);
    });
    
    return () => unsubscribe();
  }, [meetingId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !meetingId || !authState.user) return;
    
    try {
      await addDoc(collection(db, 'meetings', meetingId, 'messages'), {
        senderId: authState.user.uid,
        senderName: authState.user.displayName || 'Anonymous',
        text: message,
        timestamp: new Date(),
      });
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-20 flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-medium">Chat</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.senderId === authState.user?.uid ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`px-3 py-2 rounded-lg max-w-[80%] ${
                msg.senderId === authState.user?.uid 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="p-4 border-t border-border flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
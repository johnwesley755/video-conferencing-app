import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { collection, query, where, getDocs, orderBy, FirestoreError } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Meeting } from '../types/webrtc.types';
import { formatDate } from '../lib/utils';
import { Video, Calendar, Clock, Users, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export const Dashboard: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchMeetings = async () => {
      if (!authState.user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const meetingsRef = collection(db, 'meetings');
        
        // Use a simpler query if we've had an index error before
        const meetingsData: Meeting[] = [];
        
        try {
          // First try with the complex query
          const q = query(
            meetingsRef,
            where('participants', 'array-contains', authState.user.uid),
            orderBy('startTime', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            meetingsData.push({
              id: data.id,
              hostId: data.hostId,
              title: data.title,
              description: data.description,
              startTime: data.startTime.toDate(),
              participants: data.participants,
              isActive: data.isActive,
            });
          });
        } catch (indexErr) {
          // If we get an index error, try a simpler query
          const firestoreError = indexErr as FirestoreError;
          if (firestoreError.message && firestoreError.message.includes('requires an index')) {
            setError('The database requires an index to be created. Results may not be sorted correctly.');
            
            // Use simpler query without orderBy
            const simpleQuery = query(
              meetingsRef,
              where('participants', 'array-contains', authState.user.uid)
            );
            
            const querySnapshot = await getDocs(simpleQuery);
            
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              meetingsData.push({
                id: data.id,
                hostId: data.hostId,
                title: data.title,
                description: data.description,
                startTime: data.startTime.toDate(),
                participants: data.participants,
                isActive: data.isActive,
              });
            });
            
            // Sort manually
            meetingsData.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
          } else {
            // Re-throw if it's not an index error
            throw indexErr;
          }
        }
        
        setMeetings(meetingsData);
      } catch (error) {
        console.error('Error fetching meetings:', error);
        setError('Failed to load meetings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetings();
  }, [authState.user]);
  
  const joinMeeting = (meetingId: string) => {
    navigate(`/meeting/${meetingId}`);
  };
  
  const createNewMeeting = () => {
    navigate('/create-meeting');
  };
  
  const renderMeetingCard = (meeting: Meeting) => (
    <Card key={meeting.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{meeting.title}</CardTitle>
        <CardDescription>
          {meeting.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formatDate(meeting.startTime)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>{meeting.participants.length} participants</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span className={meeting.isActive ? 'text-green-500' : 'text-muted-foreground'}>
              {meeting.isActive ? 'Active' : 'Ended'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => joinMeeting(meeting.id)} 
          disabled={!meeting.isActive}
          className="w-full"
        >
          <Video className="mr-2 h-4 w-4" />
          {meeting.isActive ? 'Join Meeting' : 'Meeting Ended'}
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={createNewMeeting}>
            <Video className="mr-2 h-4 w-4" />
            New Meeting
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Meetings</TabsTrigger>
            <TabsTrigger value="active">Active Meetings</TabsTrigger>
            <TabsTrigger value="past">Past Meetings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8">Loading meetings...</div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have any meetings yet.</p>
                <Button onClick={createNewMeeting}>Create Your First Meeting</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map(renderMeetingCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-8">Loading meetings...</div>
            ) : meetings.filter(m => m.isActive).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have any active meetings.</p>
                <Button onClick={createNewMeeting}>Create a Meeting</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.filter(m => m.isActive).map(renderMeetingCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="text-center py-8">Loading meetings...</div>
            ) : meetings.filter(m => !m.isActive).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any past meetings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.filter(m => !m.isActive).map(renderMeetingCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout/Header';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Edit, User, Mail, Shield, Clock } from 'lucide-react';
import { showToast } from '../lib/toast-utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { auth } from '../config/firebase';

export const Profile: React.FC = () => {
  const { authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(authState.user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);

  // Format the role for display (capitalize first letter)
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = async () => {
    if (!authState.user) return;
    
    try {
      setIsLoading(true);
      
      // Update display name in Firebase Auth
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: displayName
        });
      }
      
      // Update display name in Firestore
      const userRef = doc(db, 'users', authState.user.uid);
      await updateDoc(userRef, {
        displayName: displayName
      });
      
      showToast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!authState.user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Available</h1>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={authState.user.photoURL || ''} alt={authState.user.displayName || 'User'} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {getInitials(authState.user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{authState.user.displayName}</CardTitle>
                  <CardDescription>{authState.user.email}</CardDescription>
                  <Badge variant="outline" className="mt-2">
                    {formatRole(authState.user.role)}
                  </Badge>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Profile Details */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    {isEditing 
                      ? 'Edit your profile information below' 
                      : 'View and manage your account details'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Personal Information</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        {isEditing ? (
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <div className="p-2 rounded-md bg-muted mt-1">
                            {authState.user.displayName}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <div className="p-2 rounded-md bg-muted mt-1 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          {authState.user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Account Information</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Account Type</Label>
                        <div className="p-2 rounded-md bg-muted mt-1 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatRole(authState.user.role)}
                        </div>
                      </div>
                      
                      <div>
                        <Label>User ID</Label>
                        <div className="p-2 rounded-md bg-muted mt-1 text-xs text-muted-foreground font-mono">
                          {authState.user.uid}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                {isEditing && (
                  <CardFooter>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isLoading || !displayName.trim()}
                      className="ml-auto"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent meetings and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your recent activity will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
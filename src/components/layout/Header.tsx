import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Video, LogOut, User, Settings, Plus, Menu } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

export const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">VideoMeet</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/features">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Features</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Pricing</Button>
            </Link>
            <Link to="/support">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Support</Button>
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {authState.user ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate('/create-meeting')}
                className="flex items-center gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Plus className="h-4 w-4" />
                New Meeting
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-background">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={authState.user.photoURL || undefined} alt={authState.user.displayName || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(authState.user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{authState.user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{authState.user.email}</p>
                      <Badge variant="outline" className="mt-2 w-fit text-xs">{authState.user.role}</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                    <Video className="mr-2 h-4 w-4" />
                    <span>My Meetings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')} className="hover:bg-primary/10 hover:text-primary">
                Login
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 shadow-sm">
                Register
              </Button>
            </>
          )}
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8">
                  <div className="rounded-full bg-primary/10 p-1.5">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xl font-bold">VideoMeet</span>
                </div>
                
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/features')}>
                    Features
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/pricing')}>
                    Pricing
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/support')}>
                    Support
                  </Button>
                </div>
                
                <div className="border-t my-6"></div>
                
                {authState.user ? (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={authState.user.photoURL || undefined} alt={authState.user.displayName || 'User'} />
                        <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(authState.user.displayName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{authState.user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{authState.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/create-meeting')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Meeting
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
                        <Video className="mr-2 h-4 w-4" />
                        My Meetings
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </div>
                    
                    <div className="mt-auto">
                      <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 mt-auto">
                    <Button className="w-full" onClick={() => navigate('/register')}>
                      Register
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                      Login
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
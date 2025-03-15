import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Video, Users, Shield, Globe, Zap, Calendar, MessageSquare } from 'lucide-react';
import { showToast } from '../lib/toast-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

export const Home: React.FC = () => {
  const [meetingId, setMeetingId] = useState('');
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for login success from query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const loginSuccess = queryParams.get('loginSuccess');
    
    if (loginSuccess === 'true') {
      showToast.success('Login successful!');
      // Remove the query parameter to avoid showing the toast on refresh
      navigate('/', { replace: true });
    }
  }, [location, navigate]);
  
  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId.trim()) {
      navigate(`/meeting/${meetingId.trim()}`);
    }
  };
  
  const handleCreateMeeting = () => {
    navigate('/create-meeting');
  };
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section with Background Image */}
        <section className="hero-section relative py-32 overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/30 to-secondary/30">
            <div className="absolute inset-0 bg-[url('https://www.acefone.com/blog/wp-content/uploads/2021/12/What-are-the-Benefits-of-Video-Conferencing-1.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          </div>

          {/* Animated background elements */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="container relative z-10 mx-auto max-w-6xl px-4">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <Badge
                  variant="outline"
                  className="px-5 py-2 text-sm font-medium mb-2 bg-background/70 backdrop-blur-sm border-primary/30 shadow-sm"
                >
                  <span className="mr-2 text-primary">★</span>
                  Trusted by 10,000+ teams worldwide
                </Badge>

                <h1 className="hero-title text-5xl md:text-7xl font-bold">
                  Connect <span>Seamlessly</span> From
                  <br />Anywhere
                </h1>

                <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed">
                  Experience crystal-clear video meetings with enterprise-grade
                  security and intuitive collaboration tools.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 pt-8">
                  {authState.user ? (
                    <>
                      <Button
                        size="lg"
                        className="hero-button bg-primary hover:bg-primary/90 text-lg h-14 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                        onClick={handleCreateMeeting}
                      >
                        <Video className="mr-2 h-5 w-5" />
                        Start New Meeting
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="hero-button border-2 text-lg h-14 px-8 hover:bg-background/10 backdrop-blur-sm transition-all hover:scale-105"
                        onClick={handleGoToDashboard}
                      >
                        <Users className="mr-2 h-5 w-5" />
                        My Meetings
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        className="hero-button bg-primary hover:bg-primary/90 text-lg h-14 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                        onClick={() => navigate("/register")}
                      >
                        Sign Up Free
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="hero-button border-2 text-lg h-14 px-8 hover:bg-background/10 backdrop-blur-sm transition-all hover:scale-105"
                        onClick={() => navigate("/login")}
                      >
                        Log In
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 mt-10 md:mt-0">
                <Card className="hero-card backdrop-blur-sm bg-background/80 border-primary/20 shadow-xl overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">Join a Meeting</CardTitle>
                    <CardDescription className="text-base">
                      Enter a meeting ID to join an existing meeting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <form onSubmit={handleJoinMeeting} className="space-y-4">
                      <div className="flex gap-3">
                        <Input
                          value={meetingId}
                          onChange={(e) => setMeetingId(e.target.value)}
                          placeholder="Enter meeting ID"
                          className="flex-1 h-12 text-base border-primary/20 focus-visible:ring-primary"
                        />
                        <Button 
                          type="submit" 
                          disabled={!meetingId.trim()}
                          className="hero-button h-12 px-6 bg-primary hover:bg-primary/90"
                        >
                          Join
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  10M+
                </p>
                <p className="text-muted-foreground">Daily Users</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  190+
                </p>
                <p className="text-muted-foreground">Countries</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  99.9%
                </p>
                <p className="text-muted-foreground">Uptime</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  5★
                </p>
                <p className="text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Tabs */}
        <section className="py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Powerful Features for Seamless Collaboration
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for productive meetings, all in one place
              </p>
            </div>

            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                <TabsTrigger value="recording">Recording</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      HD Video Conferencing
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Crystal clear video and audio for seamless communication
                      with your team or clients. Adaptive streaming ensures
                      quality even with varying network conditions.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Zap className="h-5 w-5 text-primary mr-2" />
                        <span>Up to 1080p HD video quality</span>
                      </li>
                      <li className="flex items-center">
                        <Zap className="h-5 w-5 text-primary mr-2" />
                        <span>Background noise suppression</span>
                      </li>
                      <li className="flex items-center">
                        <Zap className="h-5 w-5 text-primary mr-2" />
                        <span>Virtual backgrounds and blur</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="https://5.imimg.com/data5/NV/YB/KB/GLADMIN-9380956/boardroom-video-conferencing-500x500.jpg"
                      alt="HD Video Conferencing"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="https://www.webex.com/content/dam/www/us/en/images/solutions/cross-platform/security/security-hero.jpg"
                      alt="Secure Meetings"
                      className="w-full h-auto"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      Enterprise-Grade Security
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      End-to-end encryption and role-based access control to
                      keep your conversations private. Meeting passwords and
                      waiting rooms for additional security.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Shield className="h-5 w-5 text-primary mr-2" />
                        <span>End-to-end encryption</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="h-5 w-5 text-primary mr-2" />
                        <span>Meeting access controls</span>
                      </li>
                      <li className="flex items-center">
                        <Shield className="h-5 w-5 text-primary mr-2" />
                        <span>GDPR compliant data handling</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="accessibility">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      Accessible Anywhere
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Join meetings from any device with a browser. No downloads
                      required. Mobile-optimized interface for on-the-go
                      meetings.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Globe className="h-5 w-5 text-primary mr-2" />
                        <span>Browser-based, no downloads needed</span>
                      </li>
                      <li className="flex items-center">
                        <Globe className="h-5 w-5 text-primary mr-2" />
                        <span>Mobile-responsive design</span>
                      </li>
                      <li className="flex items-center">
                        <Globe className="h-5 w-5 text-primary mr-2" />
                        <span>Low-bandwidth mode for poor connections</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="https://ezcast-pro.com/wp-content/uploads/2022/06/1655197968354-1.jpg"
                      alt="Accessible Anywhere"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recording">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="https://cdn.staticont.net/page_type/0023/57/a04714c458381d150df5766fa9bbf531e114b1bc.webp"
                      alt="Meeting Recording"
                      className="w-full h-auto"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      Cloud Recording
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Record your meetings and save them to the cloud for easy
                      access and sharing. Automatic transcription for searchable
                      meeting content.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Zap className="h-5 w-5 text-primary mr-2" />
                        <span>One-click recording</span>
                      </li>
                      <li className="flex items-center">
                        <Zap className="h-5 w-5 text-primary mr-2" />
                        <span>Automatic transcription</span>
                      </li>
                      <li className="flex items-center">
                        <Zap className="h-5 w-5 text-primary mr-2" />
                        <span>Secure sharing options</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      In-Meeting Chat
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Share messages, links, and files during meetings without
                      interrupting the speaker. Private and group chat options
                      for flexible communication.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-primary mr-2" />
                        <span>Real-time messaging</span>
                      </li>
                      <li className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-primary mr-2" />
                        <span>File sharing capabilities</span>
                      </li>
                      <li className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-primary mr-2" />
                        <span>Emoji reactions and threaded replies</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="https://it.tufts.edu/sites/default/files/inline-images/ChatPanel_0.png"
                      alt="In-Meeting Chat"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="rounded-lg overflow-hidden shadow-xl">
                    <img
                      src="https://assets.mailshake.com/wp-content/uploads/2020/04/05045549/1509325_UpdateOldBlogImages-7_1_120222.jpg"
                      alt="Meeting Scheduling"
                      className="w-full h-auto"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      Smart Scheduling
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Plan and schedule meetings with ease. Send calendar
                      invites and reminders to ensure everyone joins on time.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-2" />
                        <span>Calendar integration</span>
                      </li>
                      <li className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-2" />
                        <span>Automated reminders</span>
                      </li>
                      <li className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-2" />
                        <span>Recurring meeting support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied users who have transformed their
                virtual meetings
              </p>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3 p-2">
                  <Card className="h-full">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img
                            src="/assets/testimonials/user1.jpg"
                            alt="Sarah Johnson"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">Sarah Johnson</h4>
                          <p className="text-sm text-muted-foreground">
                            Marketing Director, CreativeMinds
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground flex-grow">
                        "VideoMeet has transformed how our remote team
                        collaborates. The video quality is exceptional and the
                        interface is intuitive."
                      </p>
                      <div className="flex mt-4">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>

                <CarouselItem className="md:basis-1/2 lg:basis-1/3 p-2">
                  <Card className="h-full">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img
                            src="/assets/testimonials/user2.jpg"
                            alt="Michael Chen"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">Michael Chen</h4>
                          <p className="text-sm text-muted-foreground">
                            Software Engineer, TechInnovate
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground flex-grow">
                        "I've tried many video conferencing tools, but VideoMeet
                        stands out with its reliability and security features."
                      </p>
                      <div className="flex mt-4">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>

                <CarouselItem className="md:basis-1/2 lg:basis-1/3 p-2">
                  <Card className="h-full">
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img
                            src="/assets/testimonials/user3.jpg"
                            alt="Emily Rodriguez"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold">Emily Rodriguez</h4>
                          <p className="text-sm text-muted-foreground">
                            Project Manager, GlobalSolutions
                          </p>
                        </div>
                      </div>
                      <p className="text-muted-foreground flex-grow">
                        "The screen sharing and recording features have made our
                        client presentations so much more professional."
                      </p>
                      <div className="flex mt-4">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to transform your meetings?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-6">
                  Join thousands of teams who have already upgraded their
                  virtual collaboration experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/register")}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Schedule a Demo
                  </Button>
                </div>
              </div>
              <div className="w-full max-w-md">
                <img
                  src="https://www.itctech.com.cn/Public/upload/2021-04-23/1619146879.9977_wm_591.jpg"
                  alt="Video conference illustration"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">VideoMeet</h3>
              <p className="text-muted-foreground mb-4">
                Connecting teams worldwide with secure, high-quality video
                conferencing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Developers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Legal
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} VideoMeet. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.3 9 4-.5-1.2-.9-2.5-1-3.9 2.9-2 6.7 1 7 3.9z"></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
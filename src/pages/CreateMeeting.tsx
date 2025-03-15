import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { generateMeetingId } from "../lib/utils";
import {
  Copy,
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Link as LinkIcon,
  Twitter,
  Mail,
  Linkedin,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { showToast } from "../lib/toast-utils";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "../components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Define a type for Firebase errors
interface FirebaseError extends Error {
  code?: string;
}

export const CreateMeeting: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [muteParticipants, setMuteParticipants] = useState(false);
  
  // Scheduling options
  const [scheduleType, setScheduleType] = useState("now");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("12:00");
  const [duration, setDuration] = useState("60");

  const { authState } = useAuth();
  const navigate = useNavigate();

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authState.user) {
      setError("You must be logged in to create a meeting");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const newMeetingId = generateMeetingId();
      
      // Calculate the start time based on scheduling options
      let startTime = new Date();
      
      if (scheduleType === "later" && date) {
        const [hours, minutes] = time.split(":").map(Number);
        startTime = new Date(date);
        startTime.setHours(hours, minutes, 0, 0);
      }

      await addDoc(collection(db, "meetings"), {
        id: newMeetingId,
        title: title || "Untitled Meeting",
        description,
        hostId: authState.user.uid,
        startTime,
        scheduledFor: scheduleType === "later" ? startTime.toISOString() : null,
        duration: parseInt(duration),
        isActive: scheduleType === "now",
        participants: [authState.user.uid],
        settings: {
          waitingRoom: enableWaitingRoom,
          muteParticipants: muteParticipants,
        },
      });

      const url = `${window.location.origin}/meeting/${newMeetingId}`;

      setMeetingId(newMeetingId);
      setMeetingUrl(url);

      // Only navigate immediately if the meeting is starting now
      if (scheduleType === "now") {
        setTimeout(() => {
          navigate(`/meeting/${newMeetingId}`);
        }, 500);
      }
    } catch (err: unknown) {
      const firebaseError = err as FirebaseError;
      setError(firebaseError.message || "Failed to create meeting");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    if (meetingUrl) {
      try {
        await navigator.clipboard.writeText(meetingUrl);
        setIsLinkCopied(true);
        showToast.success("Meeting link copied to clipboard");

        // Reset the copied state after 3 seconds
        setTimeout(() => {
          setIsLinkCopied(false);
        }, 3000);
      } catch (err) {
        console.error("Failed to copy:", err);
        showToast.error("Failed to copy meeting link");
      }
    }
  };

  const joinMeeting = () => {
    if (meetingId) {
      console.log("Navigating to meeting:", meetingId);
      navigate(`/meeting/${meetingId}`);
    }
  };
  
  const shareToSocialMedia = (platform: string) => {
    if (!meetingUrl) return;
    
    const text = `Join my meeting: ${title || "Video Conference"}`;
    let shareUrl = "";
    
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n${description ? description + "\n\n" : ""}Join using this link: ${meetingUrl}`)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(meetingUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(meetingUrl)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(`Invitation: ${title || "Video Conference"}`)}&body=${encodeURIComponent(`${text}\n\n${description ? description + "\n\n" : ""}Join using this link: ${meetingUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank");
  };
  
  const addToCalendar = () => {
    if (!meetingUrl || !meetingId) return;
    
    // Format date for calendar
    const startDate = scheduleType === "later" && date 
      ? new Date(date.setHours(parseInt(time.split(":")[0]), parseInt(time.split(":")[1]), 0, 0))
      : new Date();
    
    const endDate = new Date(startDate.getTime() + parseInt(duration) * 60000);
    
    const startDateStr = startDate.toISOString().replace(/-|:|\.\d+/g, "");
    const endDateStr = endDate.toISOString().replace(/-|:|\.\d+/g, "");
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title || "Video Conference")}&details=${encodeURIComponent(`${description || ""}\n\nJoin using this link: ${meetingUrl}`)}&dates=${startDateStr}/${endDateStr}`;
    
    window.open(calendarUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            {!meetingId ? "Create a New Meeting" : "Your Meeting is Ready"}
          </h1>

          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">
                {!meetingId ? (
                  <div className="flex items-center">
                    <Video className="h-5 w-5 mr-2 text-primary" />
                    Create a Meeting
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                    Meeting Created Successfully
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {!meetingId
                  ? "Fill in the details to start a new video conference"
                  : "Your meeting is ready. Share the link with participants to join."}
              </CardDescription>
            </CardHeader>

            {!meetingId ? (
              <form onSubmit={handleCreateMeeting}>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base">
                      Meeting Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter meeting title"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter meeting description"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Schedule</h3>
                    
                    <RadioGroup 
                      value={scheduleType} 
                      onValueChange={setScheduleType}
                      className="flex flex-col space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="now" id="now" />
                        <Label htmlFor="now" className="cursor-pointer">Start meeting now</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="later" id="later" />
                        <Label htmlFor="later" className="cursor-pointer">Schedule for later</Label>
                      </div>
                    </RadioGroup>
                    
                    {scheduleType === "later" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Select value={time} onValueChange={setTime}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, hour) => (
                                <React.Fragment key={hour}>
                                  <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                  </SelectItem>
                                  <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                                    {`${hour.toString().padStart(2, '0')}:30`}
                                  </SelectItem>
                                </React.Fragment>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label>Duration</Label>
                          <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="90">1.5 hours</SelectItem>
                              <SelectItem value="120">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Meeting Settings</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          className="text-base cursor-pointer"
                          htmlFor="waiting-room"
                        >
                          Enable Waiting Room
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Participants need approval to join the meeting
                        </p>
                      </div>
                      <Switch
                        id="waiting-room"
                        checked={enableWaitingRoom}
                        onCheckedChange={setEnableWaitingRoom}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          className="text-base cursor-pointer"
                          htmlFor="mute-participants"
                        >
                          Mute Participants on Entry
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Participants will join with their microphone muted
                        </p>
                      </div>
                      <Switch
                        id="mute-participants"
                        checked={muteParticipants}
                        onCheckedChange={setMuteParticipants}
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating Meeting..." : scheduleType === "now" ? "Start Meeting Now" : "Schedule Meeting"}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">
                        {title || "Untitled Meeting"}
                      </h3>
                      {description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="text-sm">
                      {scheduleType === "now" 
                        ? `${new Date().toLocaleDateString()} • Starting now` 
                        : `${date?.toLocaleDateString()} • ${time} • ${duration} minutes`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="text-sm">
                      {scheduleType === "now" 
                        ? "Waiting for participants to join" 
                        : "Send invitations to participants"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Meeting ID
                    </Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-base">
                      {meetingId}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Meeting Link
                    </Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm font-mono truncate">{meetingUrl}</p>
                    </div>
                  </div>
                </div>

                {/* Share options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Share Meeting
                  </Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center justify-center h-20 p-2"
                      onClick={() => shareToSocialMedia("whatsapp")}
                    >
                      <MessageCircle className="h-6 w-6 mb-1 text-green-600" />
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center justify-center h-20 p-2"
                      onClick={() => shareToSocialMedia("twitter")}
                    >
                      <Twitter className="h-6 w-6 mb-1 text-blue-400" />
                      <span className="text-xs">Twitter</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center justify-center h-20 p-2"
                      onClick={() => shareToSocialMedia("linkedin")}
                    >
                      <Linkedin className="h-6 w-6 mb-1 text-blue-700" />
                      <span className="text-xs">LinkedIn</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center justify-center h-20 p-2"
                      onClick={() => shareToSocialMedia("email")}
                    >
                      <Mail className="h-6 w-6 mb-1 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center justify-center h-20 p-2 col-span-2 md:col-span-1"
                      onClick={addToCalendar}
                    >
                      <CalendarDays className="h-6 w-6 mb-1 text-green-600" />
                      <span className="text-xs">Calendar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center justify-center h-20 p-2 col-span-3 md:col-span-1"
                      onClick={copyToClipboard}
                    >
                      {isLinkCopied ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 mb-1 text-green-500" />
                          <span className="text-xs">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-6 w-6 mb-1 text-gray-600 dark:text-gray-400" />
                          <span className="text-xs">Copy Link</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 pt-2">
                  {scheduleType === "now" ? (
                    <Button
                      className="w-full h-11 bg-primary hover:bg-primary/90"
                      onClick={joinMeeting}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Join Meeting Now
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        className="w-full h-11"
                        onClick={addToCalendar}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Add to Calendar
                      </Button>
                      <Button
                        className="w-full h-11"
                        onClick={() => navigate("/dashboard")}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};
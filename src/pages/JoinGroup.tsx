
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useGroup } from "@/context/GroupContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";

export default function JoinGroup() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { joinGroup, groups, loading: groupLoading } = useGroup();
  
  const [status, setStatus] = useState<'loading' | 'invalid' | 'already_member' | 'ready' | 'success'>('loading');
  const [targetGroup, setTargetGroup] = useState<{ id: string; name: string } | null>(null);
  const [joining, setJoining] = useState(false);

  // Check if the invite code is valid
  useEffect(() => {
    const checkInviteCode = async () => {
      if (!inviteCode) {
        setStatus('invalid');
        return;
      }
      
      // Wait for auth to load
      if (authLoading) return;

      // If user is not logged in, redirect to login
      if (!user) {
        navigate(`/auth/login?redirect=/join/${inviteCode}`);
        return;
      }
      
      // Find the group with this invite code
      const group = groups.find(g => g.inviteCode === inviteCode);
      
      if (!group) {
        setStatus('invalid');
        return;
      }
      
      // Check if the user is already a member
      if (group.members.some(m => m.userId === user.id)) {
        setTargetGroup(group);
        setStatus('already_member');
        return;
      }
      
      // Valid code, ready to join
      setTargetGroup(group);
      setStatus('ready');
    };
    
    checkInviteCode();
  }, [inviteCode, groups, user, authLoading, navigate]);

  // Handle join button click
  const handleJoin = async () => {
    if (!inviteCode || !user) return;
    
    setJoining(true);
    try {
      const success = await joinGroup(inviteCode);
      
      if (success) {
        setStatus('success');
        toast.success("You've successfully joined the group!");
        
        // After a short delay, navigate to the group
        setTimeout(() => {
          if (targetGroup) {
            navigate(`/groups/${targetGroup.id}`);
          } else {
            navigate("/groups");
          }
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to join group. Please try again.");
      console.error("Error joining group:", error);
    } finally {
      setJoining(false);
    }
  };

  // Helper function for UI based on status
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Checking invite code...</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We're verifying your invitation
            </p>
          </div>
        );
        
      case 'invalid':
        return (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h3 className="mt-4 text-lg font-semibold">Invalid Invite Code</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This invite code doesn't exist or has expired.
            </p>
            <Button 
              variant="secondary" 
              className="mt-6"
              onClick={() => navigate("/groups")}
            >
              Browse Your Groups
            </Button>
          </div>
        );
        
      case 'already_member':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Already a Member</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You're already a member of {targetGroup?.name}.
            </p>
            <Button 
              className="mt-6"
              onClick={() => navigate(`/groups/${targetGroup?.id}`)}
            >
              Go to Group
            </Button>
          </div>
        );
        
      case 'ready':
        return (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Join {targetGroup?.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You've been invited to join this expense sharing group.
            </p>
            <Button 
              className="mt-6"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Group"
              )}
            </Button>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-primary" />
            <h3 className="mt-4 text-xl font-semibold">Successfully Joined!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You're now a member of {targetGroup?.name}.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Redirecting you to the group...
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background/50 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mx-auto mb-8 text-center">
          <Logo />
        </div>
        
        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Group Invitation</CardTitle>
            <CardDescription className="text-center">
              Join a shared expense group
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-muted-foreground">
              <Link to="/groups" className="text-primary hover:underline">
                Back to Groups
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

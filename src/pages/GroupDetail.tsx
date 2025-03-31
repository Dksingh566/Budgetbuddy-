
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useGroup } from "@/context/GroupContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Group as GroupType } from "@/types";

// This is a simple placeholder until the full group detail functionality is implemented
export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups, loading, leaveGroup, deleteGroup } = useGroup();
  const { user } = useAuth();
  const [currentGroup, setCurrentGroup] = useState<GroupType | null>(null);
  
  useEffect(() => {
    if (groupId && groups.length > 0) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setCurrentGroup(group);
      } else {
        // Group not found, redirect to groups list
        navigate('/groups');
      }
    }
  }, [groupId, groups, navigate]);
  
  if (loading) {
    return <div className="text-center py-8">Loading group details...</div>;
  }
  
  if (!currentGroup) {
    return <div className="text-center py-8">Group not found</div>;
  }
  
  const isAdmin = user && currentGroup.members.some(m => 
    m.userId === user.id && m.role === 'admin'
  );
  
  const isCreator = user && currentGroup.createdBy === user.id;
  
  const handleLeaveGroup = async () => {
    if (window.confirm(`Are you sure you want to leave "${currentGroup.name}"?`)) {
      await leaveGroup(currentGroup.id);
      navigate('/groups');
    }
  };
  
  const handleDeleteGroup = async () => {
    if (window.confirm(`Are you sure you want to delete "${currentGroup.name}"? This cannot be undone.`)) {
      await deleteGroup(currentGroup.id);
      navigate('/groups');
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">{currentGroup.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/groups')}>
            Back to Groups
          </Button>
          <Button variant="destructive" onClick={handleLeaveGroup}>
            Leave Group
          </Button>
          {isCreator && (
            <Button variant="destructive" onClick={handleDeleteGroup}>
              Delete Group
            </Button>
          )}
        </div>
      </div>
      
      {currentGroup.description && (
        <p className="text-muted-foreground">{currentGroup.description}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              People in this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {currentGroup.members.map(member => (
                <li key={member.userId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {member.role}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Invite Others</CardTitle>
            <CardDescription>
              Share this code with friends to invite them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md text-center text-xl font-mono">
              {currentGroup.inviteCode}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              People can join using the invite code at the join page.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="border-t pt-6 mt-6">
        <h2 className="text-2xl font-bold mb-4">Expenses</h2>
        <p className="text-muted-foreground">
          Group expense tracking will be available soon. Check back later!
        </p>
      </div>
    </div>
  );
}

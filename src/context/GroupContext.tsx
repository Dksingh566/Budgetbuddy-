
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Group, GroupMember } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

type GroupContextType = {
  groups: Group[];
  loading: boolean;
  fetchGroups: () => Promise<void>;
  createGroup: (name: string, description?: string) => Promise<Group | null>;
  joinGroup: (inviteCode: string) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<void>;
  addGroupMember: (groupId: string, userId: string, role: 'admin' | 'member') => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: React.ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      // Get groups that the user is a member of
      const { data: membershipData, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);
        
      if (membershipError) throw membershipError;
      
      if (!membershipData || membershipData.length === 0) {
        setGroups([]);
        return;
      }
      
      // Get the actual group data
      const groupIds = membershipData.map(item => item.group_id);
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);
      
      if (groupsError) throw groupsError;
      
      // For each group, get its members
      const groupsWithMembers = await Promise.all((groupsData || []).map(async (group) => {
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', group.id);
          
        if (membersError) throw membersError;
        
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          createdBy: group.created_by,
          createdAt: new Date(group.created_at),
          inviteCode: group.invite_code,
          members: (membersData || []).map(member => ({
            userId: member.user_id,
            name: member.name,
            email: member.email,
            role: member.role as 'admin' | 'member',
            joinedAt: new Date(member.joined_at)
          }))
        } as Group;
      }));
      
      setGroups(groupsWithMembers);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load your groups");
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string, description?: string) => {
    try {
      setLoading(true);
      if (!user) return null;
      
      const inviteCode = generateInviteCode();
      
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{
          name,
          description,
          created_by: user.id,
          invite_code: inviteCode
        }])
        .select()
        .single();
      
      if (groupError) throw groupError;
      
      if (!groupData) return null;
      
      // Add the creator as an admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupData.id,
          user_id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: 'admin'
        }]);
      
      if (memberError) throw memberError;
      
      // Create the complete group object
      const newGroup: Group = {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        createdBy: groupData.created_by,
        createdAt: new Date(groupData.created_at),
        inviteCode: groupData.invite_code,
        members: [{
          userId: user.id,
          name: user.name || user.email,
          email: user.email || '',
          role: 'admin',
          joinedAt: new Date()
        }]
      };
      
      // Update the local state
      setGroups(prev => [...prev, newGroup]);
      toast.success("Group created successfully");
      return newGroup;
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (inviteCode: string) => {
    try {
      setLoading(true);
      if (!user) return false;
      
      // Fetch the group based on the invite code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      
      if (groupError) throw groupError;
      
      if (!groupData) {
        toast.error("Invalid invite code");
        return false;
      }
      
      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (memberCheckError) throw memberCheckError;
      
      if (existingMember) {
        toast.info("You're already a member of this group");
        return true;
      }
      
      // Add the user as a member
      const { error: joinError } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupData.id,
          user_id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: 'member'
        }]);
      
      if (joinError) throw joinError;
      
      // Refresh groups to get the updated list
      await fetchGroups();
      toast.success(`You've joined "${groupData.name}"`);
      return true;
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      setLoading(true);
      if (!user) return;
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setGroups(prev => prev.filter(group => group.id !== groupId));
      toast.success("You have left the group");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  const addGroupMember = async (groupId: string, userId: string, role: 'admin' | 'member') => {
    try {
      setLoading(true);
      
      // For now, we'll use what we have available
      // In a production app, you'd want to fetch actual user details
      const userName = "New Member";
      const userEmail = "user@example.com";
      
      // Add the member
      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: userId,
          name: userName,
          email: userEmail,
          role
        }]);
      
      if (error) throw error;
      
      // Refresh groups to get the updated list
      await fetchGroups();
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Error adding group member:", error);
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const removeGroupMember = async (groupId: string, userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Refresh groups to get the updated list
      await fetchGroups();
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error removing group member:", error);
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    try {
      setLoading(true);
      
      // Convert from our Group type to database fields
      const dbUpdates = {
        name: updates.name,
        description: updates.description,
        invite_code: updates.inviteCode
      };
      
      const { error } = await supabase
        .from('groups')
        .update(dbUpdates)
        .eq('id', groupId);
      
      if (error) throw error;
      
      // Update the local state
      setGroups(prevGroups =>
        prevGroups.map(group => (group.id === groupId ? { ...group, ...updates } : group))
      );
      
      toast.success("Group updated successfully");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
      
      if (error) throw error;
      
      // Update the local state
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
      toast.success("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  // Fetch groups when the user changes
  useEffect(() => {
    if (user) {
      fetchGroups();
    } else {
      setGroups([]);
    }
  }, [user]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        fetchGroups,
        createGroup,
        joinGroup,
        leaveGroup,
        addGroupMember,
        removeGroupMember,
        updateGroup,
        deleteGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
};

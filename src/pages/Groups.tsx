
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGroup } from "@/context/GroupContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export default function Groups() {
  const { groups, loading, createGroup } = useGroup();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    setIsCreatingGroup(true);
    
    try {
      const group = await createGroup(newGroupName, newGroupDescription);
      
      if (group) {
        setNewGroupName("");
        setNewGroupDescription("");
        setOpen(false);
        toast.success(`Group "${group.name}" created successfully`);
        navigate(`/groups/${group.id}`);
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Create Group</SheetTitle>
              <SheetDescription>
                Create a new group to share expenses with friends, family, or
                colleagues.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="A short description of the group"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
            </div>
            <SheetFooter>
              <Button disabled={isCreatingGroup} onClick={handleCreateGroup}>
                {isCreatingGroup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          No groups found. Create one to get started!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {group.members.length} members
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button size="sm" onClick={() => navigate(`/groups/${group.id}`)}>
                  View Group
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

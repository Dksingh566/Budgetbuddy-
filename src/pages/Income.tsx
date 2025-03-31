
import { useExpense } from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Search, CalendarIcon, Trash2, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Income as IncomeType } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Income() {
  const { incomes, addIncome, updateIncome, deleteIncome } = useExpense();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newIncome, setNewIncome] = useState<Omit<IncomeType, "id">>({
    amount: 0,
    source: "",
    date: new Date(),
    recurring: false,
  });
  const [currentIncome, setCurrentIncome] = useState<IncomeType | null>(null);

  const handleAddIncome = () => {
    addIncome(newIncome);
    setNewIncome({
      amount: 0,
      source: "",
      date: new Date(),
      recurring: false,
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateIncome = () => {
    if (currentIncome) {
      updateIncome(currentIncome);
      setCurrentIncome(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleEditIncome = (income: IncomeType) => {
    setCurrentIncome(income);
    setIsEditDialogOpen(true);
  };

  const handleDeleteIncome = (id: string) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      deleteIncome(id);
    }
  };

  const filteredIncomes = incomes
    .filter((income) =>
      income.source.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Income</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search income..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
                <DialogDescription>
                  Enter the details of your income.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newIncome.amount}
                    onChange={(e) =>
                      setNewIncome((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={newIncome.source}
                    onChange={(e) =>
                      setNewIncome((prev) => ({
                        ...prev,
                        source: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !newIncome.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newIncome.date ? (
                          format(newIncome.date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newIncome.date}
                        onSelect={(date) =>
                          setNewIncome((prev) => ({
                            ...prev,
                            date: date || new Date(),
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={newIncome.recurring}
                    onCheckedChange={(checked) =>
                      setNewIncome((prev) => ({
                        ...prev,
                        recurring: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="recurring">This is a recurring income</Label>
                </div>
                {newIncome.recurring && (
                  <div className="grid gap-2">
                    <Label htmlFor="recurringFrequency">Frequency</Label>
                    <Select
                      value={newIncome.recurringFrequency || "monthly"}
                      onValueChange={(value) =>
                        setNewIncome((prev) => ({
                          ...prev,
                          recurringFrequency: value as "daily" | "weekly" | "monthly" | "yearly",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddIncome}>Add Income</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Income Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Income</DialogTitle>
                <DialogDescription>
                  Update the details of your income.
                </DialogDescription>
              </DialogHeader>
              {currentIncome && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">Amount</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentIncome.amount}
                      onChange={(e) =>
                        setCurrentIncome((prev) => ({
                          ...prev!,
                          amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-source">Source</Label>
                    <Input
                      id="edit-source"
                      value={currentIncome.source}
                      onChange={(e) =>
                        setCurrentIncome((prev) => ({
                          ...prev!,
                          source: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "justify-start text-left font-normal",
                            !currentIncome.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentIncome.date ? (
                            format(new Date(currentIncome.date), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={new Date(currentIncome.date)}
                          onSelect={(date) =>
                            setCurrentIncome((prev) => ({
                              ...prev!,
                              date: date || new Date(),
                            }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-recurring"
                      checked={currentIncome.recurring}
                      onCheckedChange={(checked) =>
                        setCurrentIncome((prev) => ({
                          ...prev!,
                          recurring: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="edit-recurring">This is a recurring income</Label>
                  </div>
                  {currentIncome.recurring && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-recurringFrequency">Frequency</Label>
                      <Select
                        value={currentIncome.recurringFrequency || "monthly"}
                        onValueChange={(value) =>
                          setCurrentIncome((prev) => ({
                            ...prev!,
                            recurringFrequency: value as "daily" | "weekly" | "monthly" | "yearly",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateIncome}>Update Income</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredIncomes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground">No income found</p>
              <Button 
                variant="link" 
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-2"
              >
                Add your first income
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredIncomes.map((income) => (
            <Card key={income.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white text-lg">
                      💰
                    </div>
                    <div>
                      <h3 className="font-medium">{income.source}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{format(new Date(income.date), "PPP")}</span>
                        {income.recurring && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Recurring ({income.recurringFrequency})</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-emerald-500">
                      +${income.amount.toFixed(2)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditIncome(income)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteIncome(income.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

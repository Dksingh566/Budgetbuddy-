
import { useExpense } from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Plus, Download, Search, CalendarIcon, Trash2, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Category, Expense as ExpenseType } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, categories, exportToCSV } = useExpense();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newExpense, setNewExpense] = useState<Omit<ExpenseType, "id">>({
    amount: 0,
    description: "",
    category: "food",
    date: new Date(),
    recurring: false,
  });
  const [currentExpense, setCurrentExpense] = useState<ExpenseType | null>(null);

  const handleAddExpense = () => {
    addExpense(newExpense);
    setNewExpense({
      amount: 0,
      description: "",
      category: "food",
      date: new Date(),
      recurring: false,
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateExpense = () => {
    if (currentExpense) {
      updateExpense(currentExpense);
      setCurrentExpense(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleEditExpense = (expense: ExpenseType) => {
    setCurrentExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
    }
  };

  const filteredExpenses = expenses
    .filter((expense) =>
      expense.description.toLowerCase().includes(search.toLowerCase()) ||
      categories.find(c => c.id === expense.category)?.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Enter the details of your expense.
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
                    value={newExpense.amount}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value: Category) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        category: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }} 
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !newExpense.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newExpense.date ? (
                          format(newExpense.date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newExpense.date}
                        onSelect={(date) =>
                          setNewExpense((prev) => ({
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
                    checked={newExpense.recurring}
                    onCheckedChange={(checked) =>
                      setNewExpense((prev) => ({
                        ...prev,
                        recurring: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="recurring">This is a recurring expense</Label>
                </div>
                {newExpense.recurring && (
                  <div className="grid gap-2">
                    <Label htmlFor="recurringFrequency">Frequency</Label>
                    <Select
                      value={newExpense.recurringFrequency || "monthly"}
                      onValueChange={(value) =>
                        setNewExpense((prev) => ({
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
                <Button onClick={handleAddExpense}>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Expense Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
                <DialogDescription>
                  Update the details of your expense.
                </DialogDescription>
              </DialogHeader>
              {currentExpense && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">Amount</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentExpense.amount}
                      onChange={(e) =>
                        setCurrentExpense((prev) => ({
                          ...prev!,
                          amount: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={currentExpense.description}
                      onChange={(e) =>
                        setCurrentExpense((prev) => ({
                          ...prev!,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={currentExpense.category}
                      onValueChange={(value: Category) =>
                        setCurrentExpense((prev) => ({
                          ...prev!,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }} 
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "justify-start text-left font-normal",
                            !currentExpense.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentExpense.date ? (
                            format(new Date(currentExpense.date), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={new Date(currentExpense.date)}
                          onSelect={(date) =>
                            setCurrentExpense((prev) => ({
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
                      checked={currentExpense.recurring}
                      onCheckedChange={(checked) =>
                        setCurrentExpense((prev) => ({
                          ...prev!,
                          recurring: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="edit-recurring">This is a recurring expense</Label>
                  </div>
                  {currentExpense.recurring && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-recurringFrequency">Frequency</Label>
                      <Select
                        value={currentExpense.recurringFrequency || "monthly"}
                        onValueChange={(value) =>
                          setCurrentExpense((prev) => ({
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
                <Button onClick={handleUpdateExpense}>Update Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground">No expenses found</p>
              <Button 
                variant="link" 
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-2"
              >
                Add your first expense
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => {
            const category = categories.find((c) => c.id === expense.category);
            return (
              <Card key={expense.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full text-white text-lg"
                        style={{ backgroundColor: category?.color || "#666" }}
                      >
                        {category?.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{expense.description}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{format(new Date(expense.date), "PPP")}</span>
                          <span className="mx-1">•</span>
                          <span>{category?.name || expense.category}</span>
                          {expense.recurring && (
                            <>
                              <span className="mx-1">•</span>
                              <span>Recurring ({expense.recurringFrequency})</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-bold text-rose-500">
                        -${expense.amount.toFixed(2)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

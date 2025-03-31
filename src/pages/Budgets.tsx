
import { useExpense } from "@/context/ExpenseContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Plus, Trash2, Pencil } from "lucide-react";
import { Budget, Category } from "@/types";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Budgets() {
  const { budgets, addBudget, updateBudget, deleteBudget, categories, expenses } = useExpense();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<Omit<Budget, "id">>({
    category: "food",
    limit: 0,
    period: "monthly",
    startDate: new Date(),
  });
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);

  const handleAddBudget = () => {
    addBudget(newBudget);
    setNewBudget({
      category: "food",
      limit: 0,
      period: "monthly",
      startDate: new Date(),
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateBudget = () => {
    if (currentBudget) {
      updateBudget(currentBudget);
      setCurrentBudget(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setCurrentBudget(budget);
    setIsEditDialogOpen(true);
  };

  const handleDeleteBudget = (id: string) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      deleteBudget(id);
    }
  };

  // Calculate expenses for each budget
  const calculateBudgetUsage = (budget: Budget) => {
    // Filter expenses by category and date
    const budgetStartDate = new Date(budget.startDate);
    let budgetEndDate = new Date(budgetStartDate);
    
    switch (budget.period) {
      case "daily":
        budgetEndDate.setDate(budgetEndDate.getDate() + 1);
        break;
      case "weekly":
        budgetEndDate.setDate(budgetEndDate.getDate() + 7);
        break;
      case "monthly":
        budgetEndDate.setMonth(budgetEndDate.getMonth() + 1);
        break;
      case "yearly":
        budgetEndDate.setFullYear(budgetEndDate.getFullYear() + 1);
        break;
    }

    let filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= budgetStartDate && expenseDate < budgetEndDate;
    });

    if (budget.category !== "total") {
      filteredExpenses = filteredExpenses.filter(expense => expense.category === budget.category);
    }

    const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = (totalExpense / budget.limit) * 100;

    return {
      totalExpense,
      percentage,
      remainingBudget: budget.limit - totalExpense,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Budget</DialogTitle>
              <DialogDescription>
                Set a budget limit for a category or total spending.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value: Category | "total") =>
                    setNewBudget((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="total">Total Budget</SelectItem>
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
                <Label htmlFor="limit">Budget Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBudget.limit}
                  onChange={(e) =>
                    setNewBudget((prev) => ({
                      ...prev,
                      limit: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Budget Period</Label>
                <Select
                  value={newBudget.period}
                  onValueChange={(value) =>
                    setNewBudget((prev) => ({
                      ...prev,
                      period: value as "daily" | "weekly" | "monthly" | "yearly",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !newBudget.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newBudget.startDate ? (
                        format(newBudget.startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newBudget.startDate}
                      onSelect={(date) =>
                        setNewBudget((prev) => ({
                          ...prev,
                          startDate: date || new Date(),
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget}>Add Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Budget Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
              <DialogDescription>
                Update your budget settings.
              </DialogDescription>
            </DialogHeader>
            {currentBudget && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={currentBudget.category}
                    onValueChange={(value: Category | "total") =>
                      setCurrentBudget((prev) => ({
                        ...prev!,
                        category: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total Budget</SelectItem>
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
                  <Label htmlFor="limit">Budget Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentBudget.limit}
                    onChange={(e) =>
                      setCurrentBudget((prev) => ({
                        ...prev!,
                        limit: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="period">Budget Period</Label>
                  <Select
                    value={currentBudget.period}
                    onValueChange={(value) =>
                      setCurrentBudget((prev) => ({
                        ...prev!,
                        period: value as "daily" | "weekly" | "monthly" | "yearly",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !currentBudget.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentBudget.startDate ? (
                          format(new Date(currentBudget.startDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(currentBudget.startDate)}
                        onSelect={(date) =>
                          setCurrentBudget((prev) => ({
                            ...prev!,
                            startDate: date || new Date(),
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBudget}>Update Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
          <Card className="col-span-1 md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground">No budgets found</p>
              <Button 
                variant="link" 
                onClick={() => setIsAddDialogOpen(true)}
                className="mt-2"
              >
                Create your first budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const { totalExpense, percentage, remainingBudget } = calculateBudgetUsage(budget);
            const category = categories.find((c) => c.id === budget.category);
            const isOverBudget = percentage > 100;

            return (
              <Card key={budget.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {budget.category === "total" 
                        ? "Total Budget" 
                        : category?.name || budget.category}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget - 
                      Started {format(new Date(budget.startDate), "PPP")}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditBudget(budget)}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">${budget.limit.toFixed(2)}</span>
                      <span className={cn(
                        "font-medium",
                        isOverBudget ? "text-destructive" : "text-primary"
                      )}>
                        {isOverBudget ? "Over budget" : `${percentage.toFixed(0)}% used`}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          isOverBudget 
                            ? "bg-destructive" 
                            : percentage > 80 
                              ? "bg-amber-500" 
                              : budget.category === "total" 
                                ? "bg-primary" 
                                : ""
                        )}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: percentage > 80 || budget.category === "total" 
                            ? undefined 
                            : category?.color 
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Spent</div>
                        <div className="text-lg font-bold">
                          ${totalExpense.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Remaining</div>
                        <div className={cn(
                          "text-lg font-bold",
                          remainingBudget < 0 ? "text-destructive" : ""
                        )}>
                          ${remainingBudget.toFixed(2)}
                        </div>
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

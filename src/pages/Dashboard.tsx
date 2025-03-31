
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpense } from "@/context/ExpenseContext";
import { Avatar } from "@/components/ui/avatar";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowDown, ArrowUp, DollarSign } from "lucide-react";
import { ChartData } from "@/types";

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFD166", "#6772E5", 
  "#20BF55", "#3A86FF", "#F72585", "#8338EC", 
  "#FB8500", "#98A8F8"
];

export default function Dashboard() {
  const { expenses, incomes, budgets, categories } = useExpense();
  const [timeRange, setTimeRange] = useState<string>("month");

  // Calculate total expenses and income
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Filter expenses by time range
  const filteredExpenses = expenses.filter(expense => {
    const now = new Date();
    const expenseDate = new Date(expense.date);
    
    if (timeRange === "week") {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return expenseDate >= oneWeekAgo;
    }
    
    if (timeRange === "month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return expenseDate >= oneMonthAgo;
    }
    
    if (timeRange === "year") {
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
      return expenseDate >= oneYearAgo;
    }
    
    return true;
  });

  // Calculate expenses by category
  const expensesByCategory: Record<string, number> = {};
  filteredExpenses.forEach(expense => {
    if (expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] += expense.amount;
    } else {
      expensesByCategory[expense.category] = expense.amount;
    }
  });

  // Prepare data for pie chart
  const pieData: ChartData[] = Object.keys(expensesByCategory).map(category => {
    const categoryInfo = categories.find(c => c.id === category);
    return {
      name: categoryInfo?.name || category,
      value: expensesByCategory[category],
      color: categoryInfo?.color || "#000"
    };
  });

  // Find total budget
  const totalBudget = budgets.find(budget => budget.category === 'total')?.limit || 0;
  const budgetUsedPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-emerald-100">
                  <ArrowDown className="h-4 w-4 text-emerald-500" />
                </Avatar>
                <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-rose-100">
                  <ArrowUp className="h-4 w-4 text-rose-500" />
                </Avatar>
                <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 bg-blue-100">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </Avatar>
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  ${balance.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Total Budget</div>
                  <div className="text-sm font-medium">${totalBudget.toFixed(2)}</div>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      budgetUsedPercentage > 100 
                        ? 'bg-destructive' 
                        : budgetUsedPercentage > 80 
                          ? 'bg-amber-500' 
                          : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-muted-foreground">
                    ${totalExpenses.toFixed(2)} used
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {budgetUsedPercentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Category budget progress */}
              {budgets
                .filter(budget => budget.category !== 'total')
                .map(budget => {
                  const categoryInfo = categories.find(c => c.id === budget.category);
                  const categoryExpense = expensesByCategory[budget.category as string] || 0;
                  const percentage = (categoryExpense / budget.limit) * 100;
                  
                  return (
                    <div key={budget.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium flex items-center gap-2">
                          <span 
                            className="block w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoryInfo?.color || '#666' }} 
                          />
                          {categoryInfo?.name || budget.category}
                        </div>
                        <div className="text-sm font-medium">${budget.limit.toFixed(2)}</div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage > 100 
                              ? 'bg-destructive' 
                              : percentage > 80 
                                ? 'bg-amber-500' 
                                : 'bg-primary'
                          }`}
                          style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: percentage > 80 ? undefined : categoryInfo?.color 
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm text-muted-foreground">
                          ${categoryExpense.toFixed(2)} used
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExpenses.slice(0, 5).map(expense => {
                const categoryInfo = categories.find(c => c.id === expense.category);
                return (
                  <div key={expense.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: categoryInfo?.color || '#666' }}
                      >
                        {categoryInfo?.icon}
                      </div>
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()} · {categoryInfo?.name || expense.category}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium text-rose-500">-${expense.amount.toFixed(2)}</div>
                  </div>
                );
              })}
              {filteredExpenses.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No recent expenses
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

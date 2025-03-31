
import { useExpense } from "@/context/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from "recharts";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, subMonths, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ChartData } from "@/types";
import { motion } from "framer-motion";

export default function Reports() {
  const { expenses, incomes, categories } = useExpense();
  const [timeRange, setTimeRange] = useState<string>("month");
  const [selectedTab, setSelectedTab] = useState<string>("spending");

  // Filter expenses based on the selected time range
  const filterExpensesByTime = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "week":
        startDate = subDays(now, 7);
        break;
      case "month":
        startDate = subMonths(now, 1);
        break;
      case "quarter":
        startDate = subMonths(now, 3);
        break;
      case "year":
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });
  };

  const filteredExpenses = filterExpensesByTime();

  // Spending by Category Data
  const getCategoryData = () => {
    const categoryData: Record<string, number> = {};
    
    filteredExpenses.forEach((expense) => {
      if (categoryData[expense.category]) {
        categoryData[expense.category] += expense.amount;
      } else {
        categoryData[expense.category] = expense.amount;
      }
    });

    const chartData: ChartData[] = Object.keys(categoryData).map((category) => {
      const categoryInfo = categories.find((c) => c.id === category);
      return {
        name: categoryInfo?.name || category,
        value: categoryData[category],
        color: categoryInfo?.color || "#666",
      };
    });

    return chartData.sort((a, b) => b.value - a.value);
  };

  // Monthly Spending Data
  const getMonthlySpendingData = () => {
    const monthlyData: Record<string, number> = {};
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return format(date, "MMM yyyy");
    }).reverse();

    lastSixMonths.forEach((month) => {
      monthlyData[month] = 0;
    });

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const monthYear = format(expenseDate, "MMM yyyy");
      
      if (lastSixMonths.includes(monthYear)) {
        monthlyData[monthYear] += expense.amount;
      }
    });

    return Object.keys(monthlyData).map((month) => ({
      name: month,
      value: monthlyData[month],
    }));
  };

  // Income vs Expense Data
  const getIncomeVsExpenseData = () => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    
    // Initialize the last 6 months
    for (let i = 0; i < 6; i++) {
      const date = subMonths(now, i);
      const monthYear = format(date, "MMM yyyy");
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    
    // Calculate monthly expenses
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate >= sixMonthsAgo && expenseDate <= now) {
        const monthYear = format(expenseDate, "MMM yyyy");
        if (monthlyData[monthYear]) {
          monthlyData[monthYear].expense += expense.amount;
        }
      }
    });
    
    // Calculate monthly incomes
    incomes.forEach((income) => {
      const incomeDate = new Date(income.date);
      if (incomeDate >= sixMonthsAgo && incomeDate <= now) {
        const monthYear = format(incomeDate, "MMM yyyy");
        if (monthlyData[monthYear]) {
          monthlyData[monthYear].income += income.amount;
        }
      }
    });
    
    return Object.keys(monthlyData)
      .sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      })
      .map((month) => ({
        name: month,
        Income: monthlyData[month].income,
        Expense: monthlyData[month].expense,
        Savings: monthlyData[month].income - monthlyData[month].expense,
      }));
  };

  const categoryData = getCategoryData();
  const monthlySpendingData = getMonthlySpendingData();
  const incomeVsExpenseData = getIncomeVsExpenseData();

  // Calculate total spending
  const totalSpending = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate average daily spending
  const daysInPeriod = timeRange === "week" ? 7 : timeRange === "month" ? 30 : timeRange === "quarter" ? 90 : 365;
  const avgDailySpending = totalSpending / daysInPeriod;

  // Calculate highest spending category
  const highestCategory = categoryData.length > 0 ? categoryData[0] : null;

  // Chart configuration
  const chartConfig: ChartConfig = {
    Income: {
      label: "Income",
      theme: {
        light: "#4ade80",
        dark: "#4ade80",
      },
    },
    Expense: {
      label: "Expense",
      theme: {
        light: "#f43f5e",
        dark: "#f43f5e",
      },
    },
    Savings: {
      label: "Savings",
      theme: {
        light: "#60a5fa",
        dark: "#60a5fa",
      },
    },
  };

  // Animation variants for motion components
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.h1 
          className="text-3xl font-bold"
          variants={itemVariants}
        >
          Reports & Analytics
        </motion.h1>

        <motion.div variants={itemVariants}>
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
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <motion.div
          className="col-span-1"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {timeRange === "week" ? "Past 7 days" : timeRange === "month" ? "Past 30 days" : timeRange === "quarter" ? "Past 90 days" : "Past year"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-1"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Daily Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgDailySpending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {daysInPeriod} days period
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-1"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Highest Spending Category</CardTitle>
            </CardHeader>
            <CardContent>
              {highestCategory ? (
                <>
                  <div className="text-2xl font-bold">{highestCategory.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${highestCategory.value.toFixed(2)} ({((highestCategory.value / totalSpending) * 100).toFixed(0)}% of total)
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="spending" className="text-sm">Spending by Category</TabsTrigger>
            <TabsTrigger value="monthly" className="text-sm">Monthly Spending</TabsTrigger>
            <TabsTrigger value="income" className="text-sm">Income vs Expense</TabsTrigger>
          </TabsList>
          <TabsContent value="spending">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background/95 border rounded-md shadow-lg p-2 outline-none">
                                  <p className="font-medium">{data.name}</p>
                                  <p className="text-sm">${data.value.toFixed(2)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {((data.value / totalSpending) * 100).toFixed(1)}% of total
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      No expense data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {monthlySpendingData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlySpendingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                          contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="var(--primary)" 
                          name="Spending"
                          animationBegin={0}
                          animationDuration={1000}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      No expense data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {incomeVsExpenseData.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="h-[400px]"
                    >
                      <LineChart data={incomeVsExpenseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: 'var(--foreground)' }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value}`}
                          tick={{ fill: 'var(--foreground)' }}
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="Income"
                          stroke="var(--color-Income)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          animationBegin={0}
                          animationDuration={1200}
                        />
                        <Line
                          type="monotone"
                          dataKey="Expense"
                          stroke="var(--color-Expense)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          animationBegin={200}
                          animationDuration={1200}
                        />
                        <Line
                          type="monotone"
                          dataKey="Savings"
                          stroke="var(--color-Savings)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          animationBegin={400}
                          animationDuration={1200}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      No data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

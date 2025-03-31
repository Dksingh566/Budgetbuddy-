
import { useExpense } from "@/context/ExpenseContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Download } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function History() {
  const { expenses, incomes, categories, exportToCSV } = useExpense();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "expenses" | "income">("all");
  
  // Combine expenses and incomes for the history view
  const allTransactions = [
    ...expenses.map(expense => ({
      id: expense.id,
      date: new Date(expense.date),
      description: expense.description,
      category: categories.find(c => c.id === expense.category)?.name || expense.category,
      amount: -expense.amount, // Negative for expenses
      type: 'expense' as const,
      recurring: expense.recurring,
      recurringFrequency: expense.recurringFrequency,
      color: categories.find(c => c.id === expense.category)?.color || '#666',
    })),
    ...incomes.map(income => ({
      id: income.id,
      date: new Date(income.date),
      description: income.source,
      category: 'Income',
      amount: income.amount, // Positive for income
      type: 'income' as const,
      recurring: income.recurring,
      recurringFrequency: income.recurringFrequency,
      color: '#20BF55',
    }))
  ];
  
  // Filter transactions
  const filteredTransactions = allTransactions
    .filter(t => {
      if (filter === "expenses") return t.type === "expense";
      if (filter === "income") return t.type === "income";
      return true;
    })
    .filter(t => 
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-8 min-w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={filter}
            onValueChange={(value: "all" | "expenses" | "income") => setFilter(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="expenses">Expenses</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={`${transaction.type}-${transaction.id}`}>
                  <TableCell className="font-medium">
                    {format(transaction.date, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: transaction.color }} 
                      />
                      {transaction.description}
                      {transaction.recurring && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Recurring{transaction.recurringFrequency ? ` - ${transaction.recurringFrequency}` : ''})
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>
                    <span className={transaction.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.amount < 0 ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

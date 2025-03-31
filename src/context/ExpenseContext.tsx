
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Budget, Category, CategoryWithColor, Expense, Income } from '@/types';
import { toast } from 'sonner';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  incomes: Income[];
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  categories: CategoryWithColor[];
  exportToCSV: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const categories: CategoryWithColor[] = [
  { id: 'food', name: 'Food & Dining', color: '#FF6B6B', icon: '🍔' },
  { id: 'transport', name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
  { id: 'entertainment', name: 'Entertainment', color: '#FFD166', icon: '🎬' },
  { id: 'housing', name: 'Housing & Rent', color: '#6772E5', icon: '🏠' },
  { id: 'utilities', name: 'Utilities', color: '#20BF55', icon: '💡' },
  { id: 'healthcare', name: 'Healthcare', color: '#3A86FF', icon: '🏥' },
  { id: 'shopping', name: 'Shopping', color: '#F72585', icon: '🛍️' },
  { id: 'education', name: 'Education', color: '#8338EC', icon: '📚' },
  { id: 'personal', name: 'Personal Care', color: '#FB8500', icon: '💇' },
  { id: 'other', name: 'Other', color: '#98A8F8', icon: '📌' }
];

const mockExpenses: Expense[] = [
  {
    id: uuidv4(),
    amount: 42.5,
    description: 'Grocery shopping',
    category: 'food',
    date: new Date(2023, 6, 15),
  },
  {
    id: uuidv4(),
    amount: 10.99,
    description: 'Movie ticket',
    category: 'entertainment',
    date: new Date(2023, 6, 18),
  },
  {
    id: uuidv4(),
    amount: 35.0,
    description: 'Gas',
    category: 'transport',
    date: new Date(2023, 6, 20),
  },
  {
    id: uuidv4(),
    amount: 1200.0,
    description: 'Rent',
    category: 'housing',
    date: new Date(2023, 6, 1),
    recurring: true,
    recurringFrequency: 'monthly',
  },
  {
    id: uuidv4(),
    amount: 75.0,
    description: 'Electricity bill',
    category: 'utilities',
    date: new Date(2023, 6, 10),
  },
  {
    id: uuidv4(),
    amount: 120.0,
    description: 'Doctor visit',
    category: 'healthcare',
    date: new Date(2023, 6, 5),
  },
  {
    id: uuidv4(),
    amount: 89.99,
    description: 'New shoes',
    category: 'shopping',
    date: new Date(2023, 6, 8),
  },
  {
    id: uuidv4(),
    amount: 25.0,
    description: 'Books',
    category: 'education',
    date: new Date(2023, 6, 12),
  },
];

const mockIncomes: Income[] = [
  {
    id: uuidv4(),
    amount: 3000,
    source: 'Salary',
    date: new Date(2023, 6, 1),
    recurring: true,
    recurringFrequency: 'monthly',
  },
  {
    id: uuidv4(),
    amount: 200,
    source: 'Freelance work',
    date: new Date(2023, 6, 15),
  },
];

const mockBudgets: Budget[] = [
  {
    id: uuidv4(),
    category: 'food',
    limit: 400,
    period: 'monthly',
    startDate: new Date(2023, 6, 1),
  },
  {
    id: uuidv4(),
    category: 'entertainment',
    limit: 200,
    period: 'monthly',
    startDate: new Date(2023, 6, 1),
  },
  {
    id: uuidv4(),
    category: 'total',
    limit: 2500,
    period: 'monthly',
    startDate: new Date(2023, 6, 1),
  },
];

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      try {
        return JSON.parse(savedExpenses).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }));
      } catch (e) {
        console.error('Failed to parse expenses from localStorage', e);
        return mockExpenses;
      }
    }
    return mockExpenses;
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const savedIncomes = localStorage.getItem('incomes');
    if (savedIncomes) {
      try {
        return JSON.parse(savedIncomes).map((income: any) => ({
          ...income,
          date: new Date(income.date),
        }));
      } catch (e) {
        console.error('Failed to parse incomes from localStorage', e);
        return mockIncomes;
      }
    }
    return mockIncomes;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      try {
        return JSON.parse(savedBudgets).map((budget: any) => ({
          ...budget,
          startDate: new Date(budget.startDate),
        }));
      } catch (e) {
        console.error('Failed to parse budgets from localStorage', e);
        return mockBudgets;
      }
    }
    return mockBudgets;
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: uuidv4() };
    setExpenses((prev) => [...prev, newExpense]);
    toast.success('Expense added successfully');
  };

  const updateExpense = (expense: Expense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? expense : e))
    );
    toast.success('Expense updated successfully');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast.success('Expense deleted successfully');
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    const newIncome = { ...income, id: uuidv4() };
    setIncomes((prev) => [...prev, newIncome]);
    toast.success('Income added successfully');
  };

  const updateIncome = (income: Income) => {
    setIncomes((prev) =>
      prev.map((i) => (i.id === income.id ? income : i))
    );
    toast.success('Income updated successfully');
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
    toast.success('Income deleted successfully');
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: uuidv4() };
    setBudgets((prev) => [...prev, newBudget]);
    toast.success('Budget added successfully');
  };

  const updateBudget = (budget: Budget) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === budget.id ? budget : b))
    );
    toast.success('Budget updated successfully');
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    toast.success('Budget deleted successfully');
  };

  const exportToCSV = () => {
    const headers = 'ID,Amount,Description,Category,Date,Recurring,RecurringFrequency\n';
    const csvData = expenses.map((expense) => {
      const { id, amount, description, category, date, recurring, recurringFrequency } = expense;
      return `${id},${amount},"${description}",${category},${date.toISOString()},${recurring || false},${recurringFrequency || ''}`;
    }).join('\n');
    
    const blob = new Blob([headers + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Expenses exported to CSV');
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        incomes,
        addIncome,
        updateIncome,
        deleteIncome,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        categories,
        exportToCSV,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { useExpense } from "@/context/ExpenseContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { Moon, Sun, Monitor, AlertTriangle, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { exportToCSV } = useExpense();
  const { showOnlyUserCurrency, setShowOnlyUserCurrency, userCurrency } = useCurrency();
  const { user } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  
  // This prevents hydration errors with the theme
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      localStorage.clear();
      toast.success('All data has been cleared. Refreshing the page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };
  
  const handleBackupData = () => {
    const data = {
      expenses: localStorage.getItem('expenses'),
      incomes: localStorage.getItem('incomes'),
      budgets: localStorage.getItem('budgets'),
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budgetbuddy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    
    toast.success('Backup file downloaded successfully');
  };
  
  const handleRestoreData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.expenses) localStorage.setItem('expenses', data.expenses);
        if (data.incomes) localStorage.setItem('incomes', data.incomes);
        if (data.budgets) localStorage.setItem('budgets', data.budgets);
        
        toast.success('Data restored successfully. Refreshing the page...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        toast.error('Failed to restore data. Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="appearance">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how BudgetBuddy looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Theme</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center gap-1 h-auto py-4"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-6 w-6" />
                    <span>Light</span>
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center gap-1 h-auto py-4"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-6 w-6" />
                    <span>Dark</span>
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center gap-1 h-auto py-4"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-6 w-6" />
                    <span>System</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Manage how currencies are displayed in the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="currency-toggle" 
                  checked={showOnlyUserCurrency}
                  onCheckedChange={setShowOnlyUserCurrency}
                />
                <Label htmlFor="currency-toggle">Show only my currency ({userCurrency})</Label>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <div className="flex items-start space-x-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Your default currency is {userCurrency}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {showOnlyUserCurrency 
                        ? "Other currencies will be converted to your default currency." 
                        : "You'll see expenses in their original currencies."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, backup, or clear your BudgetBuddy data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Download your expense data as a CSV file for use in spreadsheet applications.
                </p>
                <Button onClick={exportToCSV}>
                  Export Expenses to CSV
                </Button>
              </div>
              
              <div className="pt-2">
                <h3 className="text-lg font-medium mb-2">Backup & Restore</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Save a backup of all your BudgetBuddy data or restore from a previous backup.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleBackupData}>
                    Backup All Data
                  </Button>
                  <div className="relative">
                    <Button variant="outline">
                      Restore from Backup
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreData}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="text-lg font-medium mb-2">Clear Data</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Delete all your BudgetBuddy data permanently. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={handleClearData}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Note: Your data is stored locally in your browser. If you clear your browser data, you will lose your BudgetBuddy information.
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

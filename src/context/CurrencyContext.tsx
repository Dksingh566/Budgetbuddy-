
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { Currency } from "@/types";

type CurrencyContextType = {
  userCurrency: string;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  showOnlyUserCurrency: boolean;
  setShowOnlyUserCurrency: (show: boolean) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [userCurrency, setUserCurrency] = useState("USD");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [showOnlyUserCurrency, setShowOnlyUserCurrency] = useState(true);

  // Get currency symbols map for formatting
  const getCurrencySymbol = (currencyCode: string): string => {
    const currencies: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      INR: "₹",
      CNY: "¥"
    };
    
    return currencies[currencyCode] || currencyCode;
  };
  
  // Function to format currency values
  const formatCurrency = (amount: number): string => {
    return `${currencySymbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Update currency when user changes
  useEffect(() => {
    if (user?.currency) {
      setUserCurrency(user.currency);
      setCurrencySymbol(getCurrencySymbol(user.currency));
    }
  }, [user]);

  return (
    <CurrencyContext.Provider
      value={{
        userCurrency,
        currencySymbol,
        formatCurrency,
        showOnlyUserCurrency,
        setShowOnlyUserCurrency
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

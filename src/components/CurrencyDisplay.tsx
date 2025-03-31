import { useCurrency } from "@/context/CurrencyContext";

type CurrencyDisplayProps = {
  amount: number;
  className?: string;
  currency?: string;
};

export const CurrencyDisplay = ({ amount, className, currency }: CurrencyDisplayProps) => {
  const { formatCurrency, showOnlyUserCurrency } = useCurrency();
  
  // If showOnlyUserCurrency is true or currency is not specified, use the user's currency
  // Otherwise, we could implement custom currency formatting here
  
  return (
    <span className={className}>
      {formatCurrency(amount)}
    </span>
  );
};

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  maxDecimals?: number;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, placeholder = "R$ 0,00", maxDecimals = 2, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    // Format number to currency display
    const formatToCurrency = (num: number): string => {
      if (isNaN(num)) return maxDecimals === 2 ? "R$ 0,00" : `R$ ${(0).toFixed(maxDecimals)}`;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: maxDecimals,
        maximumFractionDigits: maxDecimals
      }).format(num);
    };

    // Convert digits-only string to number
    const digitsToNumber = (str: string): number => {
      const onlyDigits = str.replace(/\D/g, "");
      if (!onlyDigits) return 0;
      const divisor = Math.pow(10, maxDecimals);
      const asNumber = parseFloat((parseInt(onlyDigits, 10) / divisor).toFixed(maxDecimals));
      return isNaN(asNumber) ? 0 : asNumber;
    };

    // Update display when value prop changes
    React.useEffect(() => {
      setDisplayValue(formatToCurrency(value ?? 0));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Extract digits and compute numeric value as cents
      const numericValue = digitsToNumber(inputValue);

      // Always show formatted BRL while typing
      setDisplayValue(formatToCurrency(numericValue));

      onChange(numericValue);
    };

    const handleBlur = () => {
      // Ensure display is formatted on blur
      setDisplayValue(formatToCurrency(value ?? 0));
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(className)}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
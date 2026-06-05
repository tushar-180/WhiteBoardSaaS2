import { ReactNode } from "react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthInputProps {
  label: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  register: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  rightElement?: ReactNode;
}

export function AuthInput({
  label,
  type,
  placeholder,
  icon,
  register,
  error,
  disabled = false,
  rightElement,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5 animate-fade-in">
      <Label className="text-xs font-semibold text-muted-foreground px-1">
        {label}
      </Label>
      <div className="relative group">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
          {icon}
        </span>
        <Input
          type={type}
          placeholder={placeholder}
          className={`h-10 rounded-xl border-border/80 pl-10 transition-all duration-200 bg-background/50 hover:bg-background/80 focus:bg-background ${
            rightElement ? "pr-10" : "pr-3"
          }`}
          disabled={disabled}
          {...register}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1 px-1 text-xs text-destructive font-medium animate-fade-in">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}

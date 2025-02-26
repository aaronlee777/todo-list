"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function CustomCheckbox({ 
  checked, 
  onCheckedChange,
  className,
  ...props 
}: CustomCheckboxProps) {
  return (
    <div
      className={cn(
        "group h-6 w-6 rounded-full border-2 border-muted-foreground/20 ring-offset-background",
        "transition-colors hover:bg-muted/50 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "relative flex items-center justify-center cursor-pointer",
        checked && "border-primary bg-primary hover:bg-primary/90",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <Check 
        className={cn(
          "h-4 w-4 opacity-0 transition-opacity",
          checked 
            ? "opacity-100 text-primary-foreground" 
            : "text-muted-foreground group-hover:opacity-100"
        )}
        strokeWidth={3}
      />
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only"
        {...props}
      />
    </div>
  )
} 
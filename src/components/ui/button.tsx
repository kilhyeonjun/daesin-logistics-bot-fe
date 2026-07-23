import * as React from "react"
import { Button as HeroButton, type ButtonProps as HeroButtonProps } from "@heroui/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-[#075f52]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-border bg-background hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        xs: "h-11 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-11 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 px-6 has-[>svg]:px-4",
        icon: "size-11",
        "icon-xs": "size-11 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-11",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = Omit<
  HeroButtonProps,
  "variant" | "size" | "isDisabled" | "isIconOnly" | "onClick" | "onPress"
> & {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  disabled?: boolean;
  onClick?: () => void;
};

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const heroVariant = {
    default: "primary",
    destructive: "danger",
    outline: "outline",
    secondary: "secondary",
    ghost: "tertiary",
    link: "ghost",
  }[variant ?? "default"] as "primary" | "danger" | "outline" | "secondary" | "tertiary" | "ghost";
  const heroSize = size === "lg" || size === "icon-lg"
    ? "lg"
    : size === "xs" || size === "sm" || size === "icon-xs" || size === "icon-sm"
      ? "sm"
      : "md";
  const isIconOnly = size?.startsWith("icon") ?? false;
  const { disabled, onClick, ...buttonProps } = props;

  return (
    <HeroButton
      data-slot="button"
      data-variant={variant}
      data-size={size}
      variant={heroVariant}
      size={heroSize}
      isIconOnly={isIconOnly}
      isDisabled={disabled}
      onPress={onClick}
      className={cn(buttonVariants({ variant, size, className }))}
      {...buttonProps}
    />
  )
}

export { Button, buttonVariants }

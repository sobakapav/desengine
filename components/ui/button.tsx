import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/system/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center self-start justify-self-start border border-black font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "bg-black !text-white hover:bg-neutral-900 [&>a]:!text-white [&>span]:!text-white",
        outline: "bg-white !text-black hover:bg-neutral-100 aria-expanded:bg-black aria-expanded:!text-white [&>a]:!text-black [&>span]:!text-black",
        secondary: "bg-white !text-black hover:bg-neutral-100 aria-expanded:bg-black aria-expanded:!text-white [&>a]:!text-black [&>span]:!text-black",
        ghost: "bg-white !text-black hover:bg-neutral-100 aria-expanded:bg-black aria-expanded:!text-white [&>a]:!text-black [&>span]:!text-black",
        destructive: "bg-black !text-white hover:bg-neutral-900 [&>a]:!text-white [&>span]:!text-white",
        link: "text-black underline underline-offset-4 hover:text-black/80",
      },
      size: {
        default: "min-h-9 gap-1.5 px-4 py-2",
        xs: "min-h-7 gap-1 px-3 py-1.5",
        sm: "min-h-8 gap-1.5 px-3.5 py-2",
        lg: "min-h-10 gap-1.5 px-5 py-2.5",
        icon: "size-8",
        "icon-xs": "size-6",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  const resolvedStyle =
    variant === "link"
      ? style
      : {
          color: "#ffffff",
          ...style,
        }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      style={resolvedStyle}
      {...props}
    />
  )
}

export { Button, buttonVariants }


import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <motion.div
      className="h-full w-full flex-1 bg-primary transition-all relative"
      initial={{ width: "0%" }}
      animate={{ width: `${value || 0}%` }}
      transition={{ 
        duration: 0.5, 
        ease: [0.34, 1.56, 0.64, 1] // Custom bouncy easing
      }}
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`
      }}
    >
      {/* Add shine effect animation */}
      <motion.div 
        className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ 
          left: ["0%", "100%"],
        }}
        transition={{ 
          repeat: value && value > 20 ? Infinity : 0, 
          duration: 2,
          repeatDelay: 2,
        }}
      />
    </motion.div>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

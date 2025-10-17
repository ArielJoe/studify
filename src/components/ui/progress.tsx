import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // 🌤️ warna track jadi lembut dan fokus ring biru
      "relative h-4 w-full overflow-hidden rounded-full bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      // 🌤️ isi progres biru langit
      className="h-full w-full flex-1 bg-sky-400 transition-all duration-300"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };

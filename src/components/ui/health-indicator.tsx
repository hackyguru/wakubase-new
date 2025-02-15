import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HealthIndicatorProps {
  isHealthy: boolean;
  isChecking: boolean;
  className?: string;
}

export const HealthIndicator = ({ isHealthy, isChecking, className }: HealthIndicatorProps) => {
  const getStatusColor = () => {
    if (isChecking) return "bg-yellow-500";
    return isHealthy ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = () => {
    if (isChecking) return "Checking node status...";
    return isHealthy ? "Node is healthy" : "Node is not responding";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={cn("relative h-2 w-2", className)}>
            <motion.div
              className={cn(
                "absolute inset-0 rounded-full",
                getStatusColor()
              )}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{
                scale: [0.8, 1, 0.8],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: isChecking ? 0.8 : 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div
              className={cn(
                "absolute inset-0 rounded-full",
                isChecking ? "bg-yellow-500/30" : isHealthy ? "bg-green-500/30" : "bg-red-500/30"
              )}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}; 
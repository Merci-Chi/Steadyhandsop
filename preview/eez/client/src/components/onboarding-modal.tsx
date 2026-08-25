import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waves, ArrowRight } from "lucide-react";

interface OnboardingModalProps {
  onComplete: (displayName: string) => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      setIsAnimating(true);
      setTimeout(() => {
        onComplete(displayName.trim());
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
          opacity: isAnimating ? 0 : 1, 
          scale: isAnimating ? 1.05 : 1, 
          y: isAnimating ? -20 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6"
          >
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
              <Waves className="h-10 w-10 text-primary-foreground" />
            </div>
          </motion.div>

          <h1 className="text-2xl font-semibold mb-2">Welcome to eez</h1>
          <p className="text-muted-foreground">
            See messages as they're being typed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Your name
            </Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="h-12 text-base"
              autoFocus
              autoComplete="off"
              data-testid="input-display-name"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base gap-2 rounded-full"
            disabled={!displayName.trim()}
            data-testid="button-start"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Experience real-time messaging like never before
        </p>
      </motion.div>
    </div>
  );
}

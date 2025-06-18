// apps/website/components/VideoDialog.tsx
// Reusable video dialog component for demo video display

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoDialogProps {
  videoSrc?: string;
  triggerText?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
}

export function VideoDialog({ 
  videoSrc = "/assets/videos/OmniPanelAI-Video.mp4",
  triggerText = "Watch Demo",
  triggerClassName,
  children 
}: VideoDialogProps): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false);

  const openDialog = React.useCallback(() => setIsOpen(true), []);
  const closeDialog = React.useCallback(() => setIsOpen(false), []);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeDialog]);

  return (
    <>
      {children ? (
        <div onClick={openDialog} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button 
          variant="outline" 
          className={cn("border-slate-600 text-white hover:bg-slate-800", triggerClassName)}
          onClick={openDialog}
        >
          {triggerText}
          <Play className="w-4 h-4 ml-2" />
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={closeDialog}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="relative w-full max-w-4xl mx-4 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                onClick={closeDialog}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <video
                src={videoSrc}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 
"use client";

import { cn } from "@/lib/utils";
import { ShineBorder } from "@/components/magicui/shine-border";

interface HeroVideoProps {
  videoSrc: string;
  className?: string;
}

export default function HeroVideoDialog({
  videoSrc = '/assets/videos/OmniPanelAI-Video.mp4',
  className,
}: HeroVideoProps) {
  return (
    <div className={cn("relative", className)}>
      <ShineBorder
        borderWidth={2}
        duration={8}
        shineColor={["#8b5cf6", "#06b6d4", "#8b5cf6"]}
      />
      <video
        src={videoSrc}
        className="w-full rounded-md border shadow-lg"
        style={{ transform: 'scale(1.3)' }}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
}

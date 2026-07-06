"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { Download, Share2, Plus, Check } from "lucide-react";

interface Villain {
  villain_name: string;
  origin_story: string;
  power: string;
  weakness: string;
  catchphrase: string;
  alignment: string;
}

interface VillainClientProps {
  slug: string;
  villain: Villain;
}

export default function VillainClient({ slug, villain }: VillainClientProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      const filename = villain.villain_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.download = `villain-${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export villain card image:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const getThemeColors = (alignment: string) => {
    const alignLower = (alignment || "").toLowerCase();
    if (alignLower.includes("chaotic")) {
      return {
        bg: "bg-comic-pink",
        badge: "bg-comic-pink border-black text-black",
        outline: "border-comic-pink",
        accent: "#ff007f",
      };
    } else if (alignLower.includes("lawful")) {
      return {
        bg: "bg-comic-yellow",
        badge: "bg-comic-yellow border-black text-black",
        outline: "border-comic-yellow",
        accent: "#ffe600",
      };
    } else {
      return {
        bg: "bg-comic-cyan",
        badge: "bg-comic-cyan border-black text-black",
        outline: "border-comic-cyan",
        accent: "#00f0ff",
      };
    }
  };

  const colors = getThemeColors(villain.alignment);
  const initials = villain.villain_name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-8 max-w-4xl mx-auto w-full relative z-10">
      
      {/* Top Banner Speech Bubble */}
      <div className="w-full max-w-[340px] sm:max-w-md mb-6 relative animate-comic-pop">
        <div className="bg-white text-black p-3 sm:p-4 border-4 border-black rounded-2xl relative shadow-[4px_4px_0_0_#000] text-center">
          <span className="font-marker text-xs uppercase tracking-wide">
            WARNING: A SUPERVILLAIN HAS DEVIATED FROM NORMAL TEXTING PROTOCOLS!
          </span>
          <div className="speech-bubble-tail" style={{ left: "calc(50% - 15px)" }}></div>
          <div className="speech-bubble-tail-inner" style={{ left: "calc(50% - 10px)" }}></div>
        </div>
      </div>

      {/* Comic Trading Card (Aspect 4:5 - highly responsive) */}
      <div className="w-full max-w-[340px] sm:max-w-md overflow-hidden p-1 flex justify-center">
        <div
          ref={cardRef}
          id="villain-card"
          className="w-full bg-comic-dark border-6 border-black rounded-none shadow-[8px_8px_0_0_#000] p-4 sm:p-6 relative flex flex-col justify-between aspect-[4/5] box-border select-none"
        >
          {/* Subtle background halftone layer */}
          <div className="absolute inset-0 bg-halftone-dark opacity-40 pointer-events-none" />

          {/* Card Top Border Accent */}
          <div className={`absolute top-0 left-0 right-0 h-2.5 ${colors.bg}`} />

          {/* Header Section */}
          <div className="relative z-10 flex items-start justify-between gap-2 mt-1.5">
            <div className="flex-1">
              <div className="bg-black border-2 border-black inline-block px-2.5 py-1 rotate-[-1.5deg] shadow-[2px_2px_0_0_rgba(255,255,255,0.2)]">
                <h2 className="font-bangers text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-wider leading-none">
                  {villain.villain_name}
                </h2>
              </div>
            </div>
            
            {/* Alignment Badge */}
            <div className={`border-3 px-1.5 py-0.5 rotate-[3deg] shadow-[2px_2px_0_0_#000] font-bangers text-[10px] sm:text-xs uppercase tracking-wider flex-shrink-0 ${colors.badge}`}>
              {villain.alignment}
            </div>
          </div>

          {/* Middle: Portrait/Crest Section */}
          <div className="relative z-10 flex items-center justify-center my-3 h-28 sm:h-36 bg-black/40 border-4 border-black overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]" />
            
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-black flex items-center justify-center relative shadow-[0_0_15px_rgba(0,0,0,0.5)] ${colors.bg} animate-comic-shake`}>
              <span className="font-bangers text-3xl sm:text-4xl text-black tracking-wide">
                {initials}
              </span>
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(rgba(0,0,0,0.15)_15%,transparent_16%)] bg-[size:6px_6px] pointer-events-none" />
            </div>

            <span className="absolute bottom-1 left-2.5 font-marker text-[9px] text-gray-500 uppercase tracking-widest">
              LVL. 99 PETTY
            </span>
            <span className="absolute top-1 right-2.5 font-marker text-[9px] text-gray-500 uppercase tracking-widest">
              SINISTER CODE
            </span>
          </div>

          {/* Details Section */}
          <div className="relative z-10 space-y-2.5 flex-1 flex flex-col justify-end">
            
            {/* Narrator Origin Caption */}
            <div className="bg-comic-yellow border-3 border-black p-2 shadow-[2px_2px_0_0_#000] rotate-[-1deg] text-black">
              <span className="font-marker text-[9px] uppercase tracking-wider block text-red-600 font-bold mb-0.5">
                ORIGIN STORY:
              </span>
              <p className="font-comic italic text-[11px] sm:text-xs leading-snug font-bold">
                "{villain.origin_story}"
              </p>
            </div>

            {/* Superpower */}
            <div className="border-l-4 border-comic-cyan pl-2 py-0.5">
              <span className="font-marker text-[9px] uppercase text-comic-cyan tracking-wider block">
                SUPERPOWER:
              </span>
              <p className="text-[11px] sm:text-xs text-gray-200 font-bold leading-tight">
                {villain.power}
              </p>
            </div>

            {/* Weakness */}
            <div className="border-l-4 border-comic-pink pl-2 py-0.5">
              <span className="font-marker text-[9px] uppercase text-comic-pink tracking-wider block">
                WEAKNESS:
              </span>
              <p className="text-[11px] sm:text-xs text-gray-200 font-bold leading-tight">
                {villain.weakness}
              </p>
            </div>

            {/* Catchphrase speech bubble */}
            <div className="relative bg-white text-black py-1 px-2.5 border-2 border-black rounded-lg mt-0.5 inline-block self-start max-w-[85%] shadow-[2px_2px_0_0_#000]">
              <span className="font-marker text-[8px] text-gray-500 uppercase tracking-wider block">
                CATCHPHRASE:
              </span>
              <p className="font-marker text-[11px] sm:text-xs text-gray-900 tracking-wider">
                "{villain.catchphrase}"
              </p>
            </div>

          </div>

          {/* Card Footer Info */}
          <div className="relative z-10 flex items-center justify-between border-t border-gray-700/60 pt-2 mt-2.5 text-[8px] font-mono text-gray-500 uppercase tracking-wider">
            <span>CL-VILLAIN CODE #0881</span>
            <span>VILLAINFACTORY.AI</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Panel */}
      <div className="w-full max-w-[340px] sm:max-w-md mt-6 grid grid-cols-2 gap-3">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="comic-panel comic-panel-interactive bg-comic-yellow text-black font-bangers text-lg sm:text-xl tracking-wider py-2.5 px-3 uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[4px_4px_0_0_#000] disabled:opacity-50"
        >
          <Download className="w-4 h-4 sm:w-5 h-5 stroke-[2.5]" />
          <span>{downloading ? "Exporting..." : "Download Card"}</span>
        </button>

        {/* Share/Copy Link Button */}
        <button
          onClick={handleShare}
          className={`comic-panel comic-panel-interactive font-bangers text-lg sm:text-xl tracking-wider py-2.5 px-3 uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[4px_4px_0_0_#000] transition-colors ${
            copied ? "bg-comic-pink text-black" : "bg-comic-cyan text-black"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 sm:w-5 h-5 stroke-[2.5]" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 sm:w-5 h-5 stroke-[2.5]" />
              <span>Share Link</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Copied Message Banner */}
      {copied && (
        <div className="fixed bottom-6 bg-comic-pink border-4 border-black px-4 sm:px-6 py-2 shadow-[4px_4px_0_0_#000] z-50 animate-comic-shake text-center max-w-[90%]">
          <span className="font-marker text-xs sm:text-sm text-black uppercase tracking-wider">
            KAPOW! Link copied to clipboard! Share the doom!
          </span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="mt-6 flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider text-gray-400 hover:text-white transition-colors group"
      >
        <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
        <span>Expose Another Person</span>
      </button>

      {/* Satirical disclaimer */}
      <p className="mt-6 text-center text-[9px] text-gray-600 max-w-xs">
        * Villain factory output is purely satirical and generated by AI. Do not use for real world world-domination schemes.
      </p>
    </div>
  );
}

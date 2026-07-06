"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Zap, Flame, ShieldAlert, Sparkles, MessageSquareCode, ArrowRight, Upload, Image as ImageIcon, Trash2 } from "lucide-react";

const MOODS = [
  { id: "petty", label: "Petty Evil", icon: Zap, color: "text-comic-yellow hover:bg-comic-yellow/10 border-comic-yellow" },
  { id: "passive", label: "Passive-Aggressive", icon: MessageSquareCode, color: "text-comic-cyan hover:bg-comic-cyan/10 border-comic-cyan" },
  { id: "chaos", label: "Pure Chaos", icon: Flame, color: "text-comic-pink hover:bg-comic-pink/10 border-comic-pink" },
];

const LOADING_PHASES = [
  "ANALYZING SCREENSHOTS...",
  "EXTRACTING TEXTING SINS...",
  "BREWING TRAGIC BACKSTORY...",
  "MEASURING SPANDEX CAPE...",
  "CALCULATING PETTINESS INDEX...",
  "CONCOCTING DASTARDLY POWERS...",
  "PRINTING EVIL TRADING CARD...",
];

export default function Home() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [mood, setMood] = useState("petty");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % LOADING_PHASES.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (screenshot).");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) {
      setError("You must paste some text or upload a screenshot to diagnose your villain origin!");
      return;
    }
    setError(null);
    setLoading(true);
    setLoadingPhase(0);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, image, mood }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to manufacture villain.");
      }

      router.push(`/villain/${data.slug}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred at the villain factory.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto w-full relative z-10">
      {/* Title / Hero Comic Banner */}
      <div className="w-full text-center mb-8 relative">
        {/* Decorative Pow Badge */}
        <div className="absolute -top-12 -left-6 md:-left-12 rotate-[-12deg] bg-comic-pink border-4 border-black px-4 py-2 shadow-[4px_4px_0_0_#000] z-20 hidden sm:block animate-comic-shake">
          <span className="font-marker text-xl md:text-2xl text-black uppercase tracking-wider">FREE AI!</span>
        </div>

        <div className="absolute -bottom-6 -right-6 md:-right-12 rotate-[8deg] bg-comic-yellow border-4 border-black px-4 py-1.5 shadow-[4px_4px_0_0_#000] z-20 hidden sm:block animate-comic-shake">
          <span className="font-marker text-lg text-black uppercase">VIRAL!</span>
        </div>

        <h1 className="font-bangers text-5xl md:text-7xl tracking-wide uppercase text-comic-yellow comic-text-shadow leading-none mb-3">
          Villain Origin
        </h1>
        <p className="font-marker text-xl md:text-2xl text-comic-pink uppercase tracking-widest comic-text-shadow-sm rotate-[-1deg]">
          Generator
        </p>
        <p className="mt-4 text-sm md:text-base text-gray-400 max-w-md mx-auto">
          Upload a screenshot of your chat logs, emails, or bios, or type them directly, and let AI analyze your evil patterns.
        </p>
      </div>

      {/* Main Form Panel */}
      <div className="w-full comic-panel p-6 md:p-8 bg-comic-card-dark relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dual Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Image Uploader */}
            <div className="space-y-2 flex flex-col">
              <label className="block text-sm uppercase tracking-wider font-bold text-gray-300">
                Upload Chat Screenshot
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                }}
                accept="image/*"
                className="hidden"
              />

              {!image ? (
                /* Drag Drop Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 min-h-[180px] border-4 border-dashed rounded flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? "border-comic-pink bg-comic-pink/5 scale-[0.99]"
                      : "border-gray-700 hover:border-comic-yellow hover:bg-white/5"
                  }`}
                >
                  <Upload className={`w-10 h-10 mb-3 ${isDragOver ? "text-comic-pink animate-bounce" : "text-gray-500"}`} />
                  <span className="font-marker text-sm text-gray-300 uppercase tracking-wide">
                    Drag Screenshot Here
                  </span>
                  <span className="text-xs text-gray-500 mt-1 font-sans">
                    or click to browse local files
                  </span>
                </div>
              ) : (
                /* Image Preview Mode */
                <div className="flex-1 min-h-[180px] border-4 border-black relative rounded overflow-hidden bg-black/40 flex items-center justify-center p-2 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Chat Screenshot"
                    className="max-h-[180px] object-contain rounded border border-gray-800"
                  />
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-comic-pink text-black border-2 border-black p-1.5 hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_0_#000] cursor-pointer"
                    title="Remove Screenshot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-1 border border-black text-[10px] font-mono text-comic-yellow rounded">
                    SCREENSHOT READY
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Text Input */}
            <div className="space-y-2 flex flex-col">
              <label className="block text-sm uppercase tracking-wider font-bold text-gray-300">
                Or Paste Text Logs (Optional)
              </label>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Type bio, text history, or corporate replies directly here..."
                className="flex-1 w-full min-h-[180px] bg-black/40 border-2 border-gray-700 focus:border-comic-yellow rounded p-4 text-white placeholder-gray-500 outline-none resize-none font-mono text-sm transition-all focus:shadow-[0_0_10px_rgba(255,230,0,0.1)]"
              />
            </div>

          </div>

          {/* Vibe Selection & Submit Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-4 border-t border-gray-800">
            {/* Moods */}
            <div className="space-y-2">
              <span className="block text-xs uppercase tracking-wider font-bold text-gray-400">
                Choose Villainous Vibe:
              </span>
              <div className="flex gap-2">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded border-2 transition-all cursor-pointer ${
                        isSelected
                          ? `bg-black border-black ${m.id === "petty" ? "text-comic-yellow shadow-[2px_2px_0_0_#ffe600]" : m.id === "passive" ? "text-comic-cyan shadow-[2px_2px_0_0_#00f0ff]" : "text-comic-pink shadow-[2px_2px_0_0_#ff007f]"}`
                          : `bg-transparent border-gray-700 text-gray-400`
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative comic-panel comic-panel-interactive bg-comic-yellow text-black font-bangers text-2xl tracking-wider py-3.5 px-8 uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0_0_#000] disabled:opacity-50"
            >
              <span>Manufacture Villain</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </form>

        {/* Error Banner */}
        {error && (
          <div className="mt-6 flex items-center gap-3 bg-red-950/80 border-4 border-black px-4 py-3 rounded text-red-200 shadow-[4px_4px_0_0_rgba(0,0,0,1)] animate-comic-shake">
            <ShieldAlert className="w-6 h-6 text-comic-pink flex-shrink-0" />
            <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}
      </div>

      {/* Comic Book Satire Disclaimer */}
      <p className="mt-8 text-center text-xs text-gray-500 max-w-sm">
        * Uploaded screenshots are processed in memory and never written to storage. Only the final structured text outcome is preserved.
      </p>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 bg-halftone-dark">
          <div className="max-w-md w-full text-center space-y-8 animate-comic-pop">
            {/* Animated Pow bubble */}
            <div className="inline-block relative">
              <div className="bg-comic-pink border-8 border-black text-black px-8 py-6 rounded-none rotate-[-4deg] shadow-[8px_8px_0_0_#000] relative">
                <span className="font-bangers text-5xl md:text-6xl tracking-wide uppercase block animate-pulse">
                  BAM!
                </span>
                <span className="font-marker text-lg text-white block uppercase tracking-widest mt-1">
                  Creating Villain...
                </span>
              </div>
              <Sparkles className="w-12 h-12 text-comic-yellow absolute -top-8 -right-8 animate-spin" />
            </div>

            {/* Loading text in speech bubble */}
            <div className="bg-white text-black p-5 rounded-3xl border-4 border-black relative max-w-xs mx-auto shadow-[6px_6px_0_0_#000]">
              <span className="font-marker text-sm uppercase text-gray-900 tracking-wider">
                {LOADING_PHASES[loadingPhase]}
              </span>
              <div className="speech-bubble-tail"></div>
              <div className="speech-bubble-tail-inner"></div>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-6 border-4 border-black bg-gray-800 mx-auto rounded overflow-hidden shadow-[4px_4px_0_0_#000] relative">
              <div
                className="h-full bg-comic-yellow transition-all duration-500 ease-out"
                style={{ width: `${((loadingPhase + 1) / LOADING_PHASES.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

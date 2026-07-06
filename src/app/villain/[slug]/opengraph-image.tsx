import { ImageResponse } from "next/og";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "edge";
export const alt = "AI Villain Origin Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Helper to decode demo base64 url parameters
function decodeDemoSlug(slug: string) {
  if (!slug.startsWith("demo-")) return null;
  try {
    const base64 = slug.substring(5);
    const jsonStr = Buffer.from(base64, "base64url").toString("utf8");
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

// Fetch villain data
async function getVillainData(slug: string) {
  const demoData = decodeDemoSlug(slug);
  if (demoData) return demoData;

  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from("villains")
      .select("villain_json")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return data.villain_json;
  } catch (e) {
    return null;
  }
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getVillainData(resolvedParams.slug);

  if (!data) {
    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full bg-[#0c0e17] items-center justify-center border-8 border-black">
          <h1 tw="text-5xl text-red-500 font-sans uppercase">Villain Not Found</h1>
        </div>
      ),
      { ...size }
    );
  }

  const name = data.villain_name || "Supervillain";
  const initials = name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Load custom font (Bangers) for awesome comic headers
  let fontData: ArrayBuffer | null = null;
  try {
    const fontResponse = await fetch(
      new URL("https://fonts.gstatic.com/s/bangers/v20/K8afCpz57zo04gYOf15S.ttf"),
      { cache: "force-cache" }
    );
    if (fontResponse.ok) {
      fontData = await fontResponse.arrayBuffer();
    }
  } catch (e) {
    console.error("Failed to load Bangers font on Edge:", e);
  }

  // Get accent color based on alignment
  const getThemeColor = (alignment: string) => {
    const align = (alignment || "").toLowerCase();
    if (align.includes("chaotic")) return "#ff007f"; // Pink
    if (align.includes("lawful")) return "#ffe600"; // Yellow
    return "#00f0ff"; // Cyan
  };

  const accentColor = getThemeColor(data.alignment);

  return new ImageResponse(
    (
      <div tw="flex w-full h-full bg-[#0f111a] border-[12px] border-black p-8 relative items-center justify-between">
        
        {/* Repeating dot pattern for halftone simulation */}
        <div
          tw="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(circle, #ff007f 2px, transparent 3px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Content Container */}
        <div tw="flex w-full h-full items-center z-10">
          
          {/* Left Block: Avatar Crest */}
          <div tw="flex flex-col items-center justify-center w-1/3 h-full pr-4 border-r-4 border-dashed border-gray-800">
            <div
              tw="w-48 h-48 rounded-full border-8 border-black flex items-center justify-center relative"
              style={{ backgroundColor: accentColor, boxShadow: "8px 8px 0px #000" }}
            >
              <span
                tw="text-8xl text-black font-bold uppercase tracking-tighter"
                style={{ fontFamily: fontData ? "Bangers" : "Impact, Arial Black, sans-serif" }}
              >
                {initials}
              </span>
            </div>
            
            <div
              tw="mt-6 border-4 border-black px-4 py-1.5 rotate-[-2deg]"
              style={{ backgroundColor: accentColor, boxShadow: "4px 4px 0px #000" }}
            >
              <span tw="text-black text-xl font-bold uppercase tracking-wider">
                {data.alignment || "EVIL"}
              </span>
            </div>
          </div>

          {/* Right Block: Villain Details */}
          <div tw="flex flex-col w-2/3 h-full pl-8 justify-between">
            {/* Title / Name */}
            <div tw="flex flex-col">
              <div tw="bg-black border-4 border-black px-4 py-2 self-start rotate-[-1deg] flex">
                <span
                  tw="text-white text-5xl uppercase tracking-wider leading-none"
                  style={{
                    fontFamily: fontData ? "Bangers" : "Impact, Arial Black, sans-serif",
                    textShadow: "2px 2px 0px #000",
                  }}
                >
                  {name}
                </span>
              </div>
              <span tw="text-gray-500 font-mono text-sm uppercase mt-2 tracking-widest">
                AI VILLAIN ORIGIN DOSSIER
              </span>
            </div>

            {/* Narrator Caption Block */}
            <div tw="flex bg-[#ffe600] border-4 border-black p-4 rotate-[0.5deg] flex-col">
              <span tw="text-[10px] text-red-600 font-bold tracking-widest block mb-1">
                ORIGIN STORY:
              </span>
              <span tw="text-black text-base font-serif italic font-bold leading-normal">
                "{data.origin_story}"
              </span>
            </div>

            {/* Stats: Power & Weakness */}
            <div tw="flex justify-between gap-4">
              <div tw="flex flex-col w-1/2 border-l-4 border-[#00f0ff] pl-3 py-1">
                <span tw="text-[10px] text-[#00f0ff] font-bold uppercase tracking-wider">
                  SUPERPOWER:
                </span>
                <span tw="text-white text-xs font-sans font-bold leading-tight mt-1">
                  {data.power}
                </span>
              </div>

              <div tw="flex flex-col w-1/2 border-l-4 border-[#ff007f] pl-3 py-1">
                <span tw="text-[10px] text-[#ff007f] font-bold uppercase tracking-wider">
                  WEAKNESS:
                </span>
                <span tw="text-white text-xs font-sans font-bold leading-tight mt-1">
                  {data.weakness}
                </span>
              </div>
            </div>

            {/* Catchphrase & Brand Footer */}
            <div tw="flex items-center justify-between border-t border-gray-800 pt-3">
              <div tw="flex bg-white text-black py-1 px-3 border-2 border-black rounded-lg">
                <span tw="text-black text-xs font-mono font-bold italic">
                  "{data.catchphrase}"
                </span>
              </div>
              <span tw="text-[10px] text-gray-500 font-mono tracking-widest">
                VILLAINFACTORY.AI
              </span>
            </div>

          </div>

        </div>

      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Bangers",
              data: fontData,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}

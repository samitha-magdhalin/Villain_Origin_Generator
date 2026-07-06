import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import VillainClient from "@/components/VillainClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Decode demo base64 url parameters
function decodeDemoSlug(slug: string) {
  if (!slug.startsWith("demo-")) return null;
  try {
    const base64 = slug.substring(5);
    const jsonStr = Buffer.from(base64, "base64url").toString("utf8");
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to decode base64 demo slug:", e);
    return null;
  }
}

// Fetch villain data from Supabase or decode it from the base64 demo url
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

    if (error || !data) {
      return null;
    }
    return data.villain_json;
  } catch (err) {
    console.error("Supabase load error:", err);
    return null;
  }
}

// Generate dynamic metadata for web crawler preview engines (Twitter, WhatsApp, Discord, etc.)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getVillainData(resolvedParams.slug);

  if (!data) {
    return {
      title: "Villain Not Found | AI Villain Origin Generator",
      description: "Could not find this supervillain in our archives.",
    };
  }

  const name = data.villain_name || "Supervillain";
  const desc = `Origin: ${data.origin_story}`;

  return {
    title: `${name} | AI Villain Origin Generator`,
    description: desc,
    openGraph: {
      title: `${name} | AI Villain Origin Generator`,
      description: desc,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | AI Villain Origin Generator`,
      description: desc,
    },
  };
}

export default async function VillainPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getVillainData(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-halftone-dark flex flex-col justify-center py-8">
      <VillainClient slug={resolvedParams.slug} villain={data} />
    </main>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";

const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

// Mock local generator using simple English and very basic vocabulary
function generateLocalVillain(
  text: string,
  hasImage: boolean,
  mood = "petty"
): {
  villain_name: string;
  origin_story: string;
  power: string;
  weakness: string;
  catchphrase: string;
  alignment: string;
} {
  // If they uploaded an image in demo mode
  if (hasImage) {
    const templates = [
      {
        villain_name: "The Screenshot Saver",
        origin_story: "A chat fighter who loves arguing online. They got their powers after saving 500 chat screenshots just to win a tiny argument in a group chat.",
        power: "Folder of Proof: Instantly shows an old screenshot of something you said years ago to prove you are wrong.",
        weakness: "Disappearing Chats: They lose their power if chat messages auto-delete after 24 hours.",
        catchphrase: "Let me check my screenshots! 📂📸",
        alignment: "Lawful Evil"
      },
      {
        villain_name: "The Zoom-In Phantom",
        origin_story: "A weird spy who ignores the actual chat message. Instead, they zoom in on your low battery percentage or open tabs to make up wild stories about you.",
        power: "Detail Spotting: Can find a hidden tab or a tiny detail in the background of your screenshot to make you look bad.",
        weakness: "Clean Crops: They are useless if you crop your screenshot to hide the status bar.",
        catchphrase: "Look at your phone battery level! 🧐🔍",
        alignment: "Chaotic Neutral"
      },
      {
        villain_name: "The Red-Circle Drawer",
        origin_story: "A messy painter who cannot share any screenshot without drawing huge red circles around words that are already very easy to see.",
        power: "Silly Drawing: Draws giant red lines and arrows to point at things that are obvious, causing eye strain.",
        weakness: "Empty Spaces: They get weak if the screenshot has very little text.",
        catchphrase: "Look right here! 🔴👇",
        alignment: "Chaotic Evil"
      }
    ];

    const idx = (text.length || 0) % templates.length;
    return templates[idx];
  }

  // Normal text-based fallback templates in simple English
  const textLower = text.toLowerCase().trim();
  const wordCount = text.split(/\s+/).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const hasCaps = text.split(/\s+/).some(w => w.length > 3 && w === w.toUpperCase());
  const hasEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/g.test(text);

  let type = "rambler";

  if (
    textLower.includes("meeting") ||
    textLower.includes("regards") ||
    textLower.includes("please") ||
    textLower.includes("as per") ||
    textLower.includes("kindly")
  ) {
    type = "corporate";
  } else if (
    textLower.includes("sorry") ||
    textLower.includes("late") ||
    textLower.includes("forgot") ||
    textLower.includes("busy") ||
    textLower.includes("tomorrow")
  ) {
    type = "apologist";
  } else if (exclamationCount > 2 || hasEmoji || textLower.includes("haha") || textLower.includes("lol") || textLower.includes("omg")) {
    type = "hyper";
  } else if (wordCount > 1 && wordCount < 6) {
    type = "ghost";
  } else if (hasCaps || textLower.includes("urgent") || textLower.includes("now") || textLower.includes("asap")) {
    type = "tyrant";
  }

  const templates: Record<string, any> = {
    corporate: {
      villain_name: "The Passive-Aggressive Worker",
      origin_story: "They spent too much time in a boring office cubicle. They mutated after reading too many emails that said 'per my last email.' Now they haunt chat apps.",
      power: "Angry Periods: Ends every chat with a single period (.) to make people feel scared and worried.",
      weakness: "Direct Phone Calls: They get scared and freeze if you call them without sending a text first.",
      catchphrase: "Hope this helps! 😊",
      alignment: "Lawful Evil"
    },
    apologist: {
      villain_name: "The Sorry Spammer",
      origin_story: "They have 10,000 unread alerts. Because they always say 'sorry for the late reply,' they turned into a sad ghost who lives in a state of shame.",
      power: "Infinite Postpone: Can pause a chat for days by typing 'let me check!' and then vanishing.",
      weakness: "Quick Chats: They disappear if you ask them 'are you there?' in real time.",
      catchphrase: "So sorry for the delay! 😅",
      alignment: "Neutral Evil"
    },
    hyper: {
      villain_name: "The Emoji Boss",
      origin_story: "They got hit by too many text vibrations and exclamations. Now, they cannot write a sentence without sending ten different emoji faces.",
      power: "Emoji Blast: Shoots bright emojis and exclamation marks that overwhelm your screen.",
      weakness: "Short Texts: Gets defeated instantly if you reply with a simple lowercase 'ok'.",
      catchphrase: "Oh my gosh haha!!! 🎉✨🔥",
      alignment: "Chaotic Evil"
    },
    ghost: {
      villain_name: "The Silent Ghost",
      origin_story: "Once a normal person who saw a message, thought 'I will reply later,' and forgot. Now they live inside chats as a gray profile picture that never replies.",
      power: "Ghost Mode: Disappears from the chat completely, leaving people waiting and worried.",
      weakness: "Ringing Phone: If you call their phone, they have to answer and explain themselves.",
      catchphrase: "...",
      alignment: "Chaotic Neutral"
    },
    tyrant: {
      villain_name: "The Urgent Boss",
      origin_story: "An angry boss who writes only in ALL CAPS. They think every tiny task is a huge emergency and get mad if you take more than 40 seconds to reply.",
      power: "Caps Lock Beam: Blinds you with big letters that tell you what to do.",
      weakness: "Silent Mode: Rendered completely harmless if you turn on 'Do Not Disturb' on your phone.",
      catchphrase: "NEED THIS NOW!",
      alignment: "Chaotic Evil"
    },
    rambler: {
      villain_name: "The Endless Writer",
      origin_story: "They cannot stop scrolling the internet. They write super long paragraphs with no breaks that lead absolutely nowhere.",
      power: "Wall of Text: Suffocates you under huge blocks of text with no punctuation.",
      weakness: "Too Long, Didn't Read: A simple 'tl;dr' destroys their entire power source.",
      catchphrase: "Let me explain why you are wrong...",
      alignment: "Neutral Evil"
    }
  };

  return templates[type] || templates.rambler;
}

export async function POST(req: NextRequest) {
  try {
    const { text, image, mood } = await req.json();

    if (!text && !image) {
      return NextResponse.json(
        { error: "A text snippet or an uploaded screenshot image is required." },
        { status: 400 }
      );
    }

    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip, 10, 60000);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Too many villain origins generated! Please wait a moment before exposing more sins.",
          reset: rateCheck.reset,
        },
        { status: 429 }
      );
    }

    let villainJson: any = null;

    if (groq) {
      try {
        const prompt = `You are a comic book villain origin story generator. Given an uploaded screenshot of a chat log/bio, and/or a pasted text snippet, invent a SATIRICAL supervillain persona based on patterns you notice (tone, quirks, repeated words, screenshot crop style, emojis, caps lock). Never reference real identifying details, just vibe/personality patterns.

Make it highly satirical, witty, and matching a comic-book narrative tone.
The requested mood setting is: "${mood || "petty"}".

CRITICAL RULE:
You MUST use very simple, plain English that is easy to understand. Do NOT use complex, academic, or heavy vocabulary words (e.g., avoid words like "mutated", "sterile", "spectral", "deference", "deface", "inspect", "compile", "compromise"). Use simple, everyday words instead. Write so that a child can easily read and laugh at it.

Return ONLY valid JSON with exactly the following keys (do not wrap in markdown codeblocks, do not add trailing text, just raw JSON):
{
  "villain_name": "...",
  "origin_story": "2-3 punchy sentences in simple English, comic book narrator voice",
  "power": "simple description of their superpower",
  "weakness": "simple description of their weakness",
  "catchphrase": "...",
  "alignment": "Chaotic / Lawful / Neutral + Evil/Good"
}

${text ? `Pasted Text Input:\n"""\n${text.slice(0, 1000)}\n"""` : ""}
${image ? "An image has been attached. Extract the text/habits from it and incorporate it into the origin story." : ""}`;

        const model = image ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";
        
        let messages: any[] = [
          {
            role: "system",
            content: "You are a professional comic-book author who writes in very simple, plain English and returns pure JSON objects.",
          }
        ];

        if (image) {
          messages.push({
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          });
        } else {
          messages.push({
            role: "user",
            content: prompt
          });
        }

        const response = await groq.chat.completions.create({
          messages,
          model,
          temperature: 0.85,
          max_tokens: 500,
          response_format: { type: "json_object" },
        });

        const textResponse = response.choices[0]?.message?.content;
        if (textResponse) {
          villainJson = JSON.parse(textResponse);
        }
      } catch (err) {
        console.error("Groq API error, switching to local generator:", err);
      }
    }

    if (!villainJson) {
      villainJson = generateLocalVillain(text || "", Boolean(image), mood);
    }

    const namePart = villainJson.villain_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${namePart}-${randomSuffix}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("villains").insert([
          {
            slug,
            villain_json: villainJson,
          },
        ]);

        if (error) throw error;

        return NextResponse.json({ slug, villain: villainJson, isDemo: false });
      } catch (err) {
        console.error("Supabase Save failed, switching to base64 demo redirect:", err);
      }
    }

    const base64Data = Buffer.from(JSON.stringify(villainJson)).toString("base64url");
    const demoSlug = `demo-${base64Data}`;

    return NextResponse.json({ slug: demoSlug, villain: villainJson, isDemo: true });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json({ error: "Something went wrong in the villain factory." }, { status: 500 });
  }
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Villain Origin Generator | Expose Your Sins",
  description: "Paste your bio, texting style, or chats, and get diagnosed as a satirical comic-book supervillain. Share your origin card for maximum viral chaos!",
  openGraph: {
    title: "AI Villain Origin Generator",
    description: "What kind of supervillain is your texting style creating? Find out instantly.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Villain Origin Generator",
    description: "What kind of supervillain is your texting style creating? Find out instantly.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-comic-dark antialiased">
      <body className="min-h-full flex flex-col bg-halftone-dark text-white font-comic">
        {children}
      </body>
    </html>
  );
}

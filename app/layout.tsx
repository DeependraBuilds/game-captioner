import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameCaptioner | Turn gameplay into social-ready copy",
  description: "Write better gaming captions, hooks, voiceovers, hashtags and on-screen text for YouTube Shorts, TikTok, Instagram, Facebook and X.",
  applicationName: "GameCaptioner",
  metadataBase: new URL("https://game-captioner.vercel.app"),
  openGraph: {
    title: "GameCaptioner | Every clip has a story",
    description: "Platform-ready content for gaming creators. Built by Deependra Builds.",
    type: "website",
  },
  icons: { icon: "/gamecaptioner-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}

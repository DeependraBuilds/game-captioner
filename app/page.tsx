"use client";
import { useState } from "react";

type Output = {
  title?: string;
  caption: string;
  voiceover: string;
  cta: string;
  carousel: string[];
};

type AllPlatformsOutput = {
  youtube: Output;
  instagram: Output;
  facebook: Output;
  twitter: Output;
  linkedin: Output;
};

const platformOrder: Array<keyof AllPlatformsOutput> = [
  "youtube",
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
];

export default function Home() {
  const [game, setGame] = useState("Battlefield 6");
  const [clipType, setClipType] = useState("Clutch");
  const [keyMechanic, setKeyMechanic] = useState("Game sense and positioning");
  const [winCondition, setWinCondition] = useState("Turn pressure into a winning play");
  const [platform, setPlatform] = useState("youtube");
  const [tone, setTone] = useState("tactical");
  const [format, setFormat] = useState("reel");
  const [result, setResult] = useState<Output | null>(null);
  const [allResults, setAllResults] = useState<AllPlatformsOutput | null>(null);
  const [copied, setCopied] = useState("");

  const payload = {
    game,
    clipType,
    keyMechanic,
    winCondition,
    platform,
    tone,
    format,
  };

  const copyText = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const copyCarousel = async (label: string, carousel: string[]) => {
    const text = carousel.map((slide, i) => `${i + 1}. ${slide}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const exportForSheets = (data: AllPlatformsOutput) => {
    const rows: string[][] = [];

    for (const platformKey of platformOrder) {
      const item = data[platformKey];

      rows.push([
        platformLabel(platformKey),
        item.title || "",
        item.caption.replace(/\n/g, " "),
        item.voiceover.replace(/\n/g, " "),
        item.cta.replace(/\n/g, " "),
        item.carousel.join(" | "),
      ]);
    }

    const tsvContent = [
      ["Platform", "Title", "Caption", "Voiceover", "CTA", "Carousel"],
      ...rows,
    ]
      .map((row) => row.join("\t"))
      .join("\n");

    const blob = new Blob([tsvContent], {
      type: "text/tab-separated-values;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "content_export.tsv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateSingle = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setResult(data);
    setAllResults(null);
  };

  const generateAll = async () => {
    const res = await fetch("/api/generate-all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        game,
        clipType,
        keyMechanic,
        winCondition,
        tone,
        format,
      }),
    });

    const data = await res.json();
    setAllResults(data);
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">DeependraBuilds Gaming Prototype</h1>
          <p className="text-gray-600 mt-2">
            Generate gaming captions, voiceovers, CTAs, and carousel text by platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <section className="bg-white rounded-2xl shadow-sm border p-6 space-y-4 h-fit">
            <h2 className="text-xl font-semibold">Input</h2>

            <Field label="Game">
              <input
                className="border rounded-xl p-3 w-full"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              />
            </Field>

            <Field label="Clip Type">
              <input
                className="border rounded-xl p-3 w-full"
                value={clipType}
                onChange={(e) => setClipType(e.target.value)}
              />
            </Field>

            <Field label="Key Mechanic">
              <input
                className="border rounded-xl p-3 w-full"
                value={keyMechanic}
                onChange={(e) => setKeyMechanic(e.target.value)}
              />
            </Field>

            <Field label="Win Condition">
              <input
                className="border rounded-xl p-3 w-full"
                value={winCondition}
                onChange={(e) => setWinCondition(e.target.value)}
              />
            </Field>

            <Field label="Platform">
              <select
                className="border rounded-xl p-3 w-full"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </Field>

            <Field label="Tone">
              <select
                className="border rounded-xl p-3 w-full"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="tactical">Tactical</option>
                <option value="hype">Hype</option>
                <option value="educational">Educational</option>
                <option value="competitive">Competitive</option>
              </select>
            </Field>

            <Field label="Format">
              <select
                className="border rounded-xl p-3 w-full"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="reel">Reel</option>
                <option value="short">Short</option>
                <option value="post">Post</option>
                <option value="carousel">Carousel</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={generateSingle}
                className="bg-black text-white py-3 rounded-xl font-medium"
              >
                Generate One
              </button>
              <button
                onClick={generateAll}
                className="border border-black py-3 rounded-xl font-medium"
              >
                Generate All
              </button>
            </div>
          </section>

          <section className="space-y-4">
            {!result && !allResults ? (
              <div className="bg-white rounded-2xl shadow-sm border p-6 text-gray-500">
                Your generated content will appear here.
              </div>
            ) : null}

            {allResults && (
              <div className="flex justify-start">
                <button
                  onClick={() => exportForSheets(allResults)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Export for Sheets
                </button>
              </div>
            )}

            {result && (
              <PlatformBlock
                platformLabel={platformLabel(platform)}
                output={result}
                copied={copied}
                onCopyText={copyText}
                onCopyCarousel={copyCarousel}
              />
            )}

            {allResults &&
              platformOrder.map((platformKey) => (
                <PlatformBlock
                  key={platformKey}
                  platformLabel={platformLabel(platformKey)}
                  output={allResults[platformKey]}
                  copied={copied}
                  onCopyText={copyText}
                  onCopyCarousel={copyCarousel}
                />
              ))}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}

function platformLabel(platform: string) {
  if (platform === "youtube") return "YouTube";
  if (platform === "instagram") return "Instagram";
  if (platform === "facebook") return "Facebook";
  if (platform === "twitter") return "Twitter/X";
  if (platform === "linkedin") return "LinkedIn";
  return platform;
}

function PlatformBlock({
  platformLabel,
  output,
  copied,
  onCopyText,
  onCopyCarousel,
}: {
  platformLabel: string;
  output: Output;
  copied: string;
  onCopyText: (label: string, text: string) => Promise<void>;
  onCopyCarousel: (label: string, carousel: string[]) => Promise<void>;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-4">
      <div className="pb-2 border-b">
        <h2 className="text-2xl font-bold">{platformLabel}</h2>
      </div>

      <Card
        title="Title"
        text={output.title || ""}
        copyLabel={`${platformLabel}-title`}
        copied={copied}
        onCopyText={onCopyText}
      />

      <Card
        title="Caption"
        text={output.caption}
        copyLabel={`${platformLabel}-caption`}
        copied={copied}
        onCopyText={onCopyText}
      />

      <Card
        title="Voiceover"
        text={output.voiceover}
        copyLabel={`${platformLabel}-voiceover`}
        copied={copied}
        onCopyText={onCopyText}
      />

      <Card
        title="CTA"
        text={output.cta}
        copyLabel={`${platformLabel}-cta`}
        copied={copied}
        onCopyText={onCopyText}
      />

      <div className="bg-gray-50 rounded-2xl border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Carousel Slides</h3>
          <button
            onClick={() =>
              onCopyCarousel(`${platformLabel}-carousel`, output.carousel)
            }
            className="border rounded-lg px-3 py-1.5 text-sm"
          >
            {copied === `${platformLabel}-carousel` ? "Copied" : "Copy"}
          </button>
        </div>
        <ol className="list-decimal pl-6 space-y-2">
          {output.carousel.map((slide, index) => (
            <li key={index}>{slide}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Card({
  title,
  text,
  copyLabel,
  copied,
  onCopyText,
}: {
  title: string;
  text: string;
  copyLabel: string;
  copied: string;
  onCopyText: (label: string, text: string) => Promise<void>;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => onCopyText(copyLabel, text)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          {copied === copyLabel ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap leading-7">{text}</p>
    </div>
  );
}
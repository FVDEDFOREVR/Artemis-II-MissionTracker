"use client";

import { useEffect, useState } from "react";

import LiveDot from "@/components/LiveDot";
import { LAUNCH, TLI, getMissionDayNumber } from "@/lib/mission";

type ChipTone = "done" | "active" | "default";
type MissionStatus = "complete" | "active" | "planned" | "future";

type TimelineChip = {
  label: string;
  tone: ChipTone;
};

type TimelineEntry = {
  date: string;
  meta: string;
  status: MissionStatus;
  tag: string;
  title: string;
  titleAccent?: boolean;
  description: string;
  chips: TimelineChip[];
};

function Chip({ label, tone }: TimelineChip) {
  const toneClassName =
    tone === "done"
      ? "border-[rgba(46,125,50,0.16)] bg-[rgba(46,125,50,0.08)] text-done"
      : tone === "active"
        ? "border-[rgba(192,57,43,0.16)] bg-[rgba(192,57,43,0.08)] text-live"
        : "border-[rgba(200,198,188,0.45)] bg-[rgba(235,233,228,1)] text-muted";

  return (
    <span
      className={`inline-flex rounded-[2px] border px-2 py-1 text-[9px] font-normal uppercase tracking-[0.08em] ${toneClassName}`}
      style={{ borderWidth: "0.5px" }}
    >
      {label}
    </span>
  );
}

function TimelineMarker({ status }: { status: MissionStatus }) {
  if (status === "active") {
    return (
      <span className="relative flex size-[13px] items-center justify-center rounded-full border border-live/30 bg-transparent">
        <span className="absolute inset-0 rounded-full bg-live/10" />
        <LiveDot className="relative z-10 size-[6px]" />
      </span>
    );
  }

  if (status === "complete") {
    return <span className="block size-2 rounded-full bg-done" />;
  }

  if (status === "planned") {
    return <span className="block size-2 rounded-full border border-muted/70 bg-transparent" />;
  }

  return (
    <span className="block size-2 rounded-full border border-dashed border-dim/70 bg-transparent" />
  );
}

export default function MissionTimeline() {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const missionDay = Math.max(1, getMissionDayNumber(nowMs));

  const timelineEntries: TimelineEntry[] = [
    {
      date: "Nov 2022",
      meta: "Uncrewed",
      status: "complete",
      tag: "COMPLETE",
      title: "Artemis I",
      description:
        "25-day uncrewed test flight of SLS and Orion. Spacecraft traveled 1.4 million miles, achieving a record 268,563 miles from Earth. Orion returned safely via Pacific splashdown on December 11, 2022.",
      chips: [
        { label: "SLS first flight", tone: "done" },
        { label: "Orion lunar orbit", tone: "done" },
        { label: "Heat shield tested", tone: "done" },
      ],
    },
    {
      date: "Apr 1, 2026",
      meta: "~10 days",
      status: "active",
      tag: `IN FLIGHT — DAY ${missionDay}`,
      title: "Artemis II",
      titleAccent: true,
      description:
        "First crewed Orion flight. Four astronauts on a free-return lunar flyby — the first humans beyond low Earth orbit since Apollo 17 (1972). TLI burn completed April 2; crew now en route to the Moon.",
      chips: [
        { label: "Launched Apr 1", tone: nowMs >= LAUNCH.getTime() ? "active" : "default" },
        { label: "TLI complete", tone: nowMs >= TLI.getTime() ? "active" : "default" },
        { label: "Lunar flyby Apr 6", tone: "default" },
        { label: "Splashdown Apr 10", tone: "default" },
      ],
    },
    {
      date: "2027",
      meta: "NET",
      status: "planned",
      tag: "PLANNED",
      title: "Artemis III",
      description:
        "Restructured in February 2026 from a crewed landing to a systems demonstration mission. Objectives: Orion–Starship HLS docking in low Earth orbit and AxEMU spacesuit testing, comparable to Apollo 9.",
      chips: [
        { label: "Orion + Starship HLS rendezvous", tone: "default" },
        { label: "AxEMU suit test", tone: "default" },
        { label: "ESM-3 delivered Sep 2025", tone: "default" },
      ],
    },
    {
      date: "2028",
      meta: "NET",
      status: "planned",
      tag: "PLANNED",
      title: "Artemis IV",
      description:
        "First crewed lunar landing since Apollo 17. Two astronauts descend to the lunar surface via SpaceX Starship HLS. Lunar Gateway cancelled March 2026; surface infrastructure is now the priority.",
      chips: [
        { label: "First lunar landing", tone: "default" },
        { label: "Starship HLS surface", tone: "default" },
        { label: "Blue Moon candidate", tone: "default" },
      ],
    },
    {
      date: "2030s",
      meta: "Vision",
      status: "future",
      tag: "LONG-TERM",
      title: "Sustained lunar presence",
      description:
        "Artemis V onward targets annual lunar missions, surface base construction, extended crew stays, and in-situ resource utilization — a permanent foothold on the Moon as stepping stone to deep space.",
      chips: [
        { label: "Artemis V — 2028+", tone: "default" },
        { label: "Lunar surface base", tone: "default" },
        { label: "Annual cadence", tone: "default" },
        { label: "Mars precursor", tone: "default" },
      ],
    },
  ];

  return (
    <section className="bg-cream px-5 py-20 text-[#141410] md:px-20">
      <div className="mx-auto max-w-[1000px]">
        <div className="max-w-[560px]">
          <p className="text-[9px] uppercase tracking-[0.18em] text-[#a0a09a]">
            NASA · Artemis Programme · Mission Sequence
          </p>
          <h2 className="mt-5 text-[48px] leading-none tracking-[-0.03em] text-[#141410] md:text-[64px]">
            <span className="font-serif italic font-light">Return</span>
            <span className="font-serif font-light"> to the Moon</span>
          </h2>
          <p className="mt-5 max-w-[560px] text-[11px] font-light leading-[1.65] tracking-[0.03em] text-[#969490]">
            A chronological record of the Artemis programme — from first flight to
            permanent lunar presence.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-[2px] bg-[rgba(192,57,43,0.08)] px-2 py-1.5">
            <LiveDot className="size-[6px]" />
            <span className="text-[8px] uppercase tracking-[0.12em] text-live">
              ARTEMIS II IN FLIGHT NOW
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[9px] font-light tracking-[0.05em] text-muted">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-done" />
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <LiveDot className="size-2" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full border border-muted/70 bg-transparent" />
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full border border-dashed border-dim/70 bg-transparent" />
            <span>Future</span>
          </div>
        </div>

        <div className="relative mt-12">
          <div
            className="absolute bottom-0 left-[136px] top-0 hidden bg-[rgba(20,20,16,0.1)] md:block"
            style={{ width: "0.5px" }}
          />

          <div className="space-y-12 md:space-y-14">
            {timelineEntries.map((entry) => (
              <article
                key={entry.title}
                className="grid gap-4 md:grid-cols-[120px_32px_minmax(0,580px)] md:gap-x-5"
              >
                <div className="md:pt-1 md:text-right">
                  <p className="text-[11px] tracking-[0.04em] text-muted">{entry.date}</p>
                  <p className="mt-1 text-[9px] font-light tracking-[0.03em] text-[#b4b2a8]">
                    {entry.meta}
                  </p>
                </div>

                <div className="hidden md:flex md:justify-center md:pt-1.5">
                  <TimelineMarker status={entry.status} />
                </div>

                <div>
                  <div className="flex items-center gap-3 md:hidden">
                    <TimelineMarker status={entry.status} />
                    <span
                      className={`text-[9px] uppercase tracking-[0.14em] ${
                        entry.status === "complete"
                          ? "text-done"
                          : entry.status === "active"
                            ? "text-live"
                            : entry.status === "planned"
                              ? "text-dim"
                              : "text-[#96948a]"
                      }`}
                      suppressHydrationWarning={entry.status === "active"}
                    >
                      {entry.tag}
                    </span>
                  </div>

                  <p
                    className={`hidden text-[9px] uppercase tracking-[0.14em] md:block ${
                      entry.status === "complete"
                        ? "text-done"
                        : entry.status === "active"
                          ? "text-live"
                          : entry.status === "planned"
                            ? "text-dim"
                            : "text-[#96948a]"
                    }`}
                    suppressHydrationWarning={entry.status === "active"}
                  >
                    {entry.tag}
                  </p>
                  <h3
                    className={`mt-3 font-serif text-[30px] leading-none tracking-[-0.02em] ${
                      entry.titleAccent ? "font-normal text-live" : "font-light text-[#141410]"
                    }`}
                  >
                    {entry.title}
                  </h3>
                  <p className="mt-4 max-w-[580px] text-[11px] font-light leading-[1.75] tracking-[0.02em] text-[#807e76]">
                    {entry.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {entry.chips.map((chip) => (
                      <Chip key={`${entry.title}-${chip.label}`} {...chip} />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer
          className="mt-16 border-t border-[rgba(20,20,16,0.07)] pt-4 text-[9px] font-light leading-[1.8] tracking-[0.04em] text-[#a0a09a]"
          style={{ borderTopWidth: "0.5px" }}
        >
          Sources: NASA Artemis Blog · Wikipedia · as of April 2, 2026 — Lunar
          Gateway cancelled March 2026 · First crewed landing moved to Artemis IV,
          February 2026
        </footer>
      </div>
    </section>
  );
}

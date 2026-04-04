import { readFile } from "node:fs/promises";
import path from "node:path";

import HeroTracker from "@/components/HeroTracker";
import {
  getMissionSnapshot,
  getMissionTelemetry,
  getTrajectoryPathMilestones,
  getTrajectoryPathProgress,
  parseMissionEphemerisPayload,
} from "@/lib/mission";

export const dynamic = "force-dynamic";

const INITIAL_VIEWPORT_WIDTH = 1440;
const INITIAL_VIEWPORT_HEIGHT = 900;

export default async function HomePage() {
  const initialNowMs = Date.now();
  let initialSnapshot = getMissionSnapshot(initialNowMs);
  let initialMissionEphemeris = null;

  try {
    const payloadPath = path.join(
      process.cwd(),
      "public",
      "data",
      "artemis-ii-oem-2026-04-02.json",
    );
    const payload = JSON.parse(await readFile(payloadPath, "utf8"));
    initialMissionEphemeris = parseMissionEphemerisPayload(payload);
    initialSnapshot = getMissionSnapshot(initialNowMs, initialMissionEphemeris);
  } catch {
    initialMissionEphemeris = null;
    initialSnapshot = getMissionSnapshot(initialNowMs);
  }

  const initialTelemetry = getMissionTelemetry(initialNowMs, initialMissionEphemeris);
  const initialTimelineProgress = getTrajectoryPathProgress(
    initialNowMs,
    INITIAL_VIEWPORT_WIDTH,
    INITIAL_VIEWPORT_HEIGHT,
    initialMissionEphemeris,
  );
  const initialTimelineMilestones = getTrajectoryPathMilestones(
    INITIAL_VIEWPORT_WIDTH,
    INITIAL_VIEWPORT_HEIGHT,
    initialMissionEphemeris,
  );

  return (
    <main className="h-[100svh] overflow-hidden bg-space text-ink">
      <HeroTracker
        initialNowMs={initialNowMs}
        initialDataSource={initialMissionEphemeris?.source ?? null}
        initialSnapshot={initialSnapshot}
        initialTelemetry={initialTelemetry}
        initialTimelineProgress={initialTimelineProgress}
        initialTimelineMilestones={initialTimelineMilestones}
      />
    </main>
  );
}

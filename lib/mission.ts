export const LAUNCH = new Date("2026-04-01T22:35:12Z");
export const TLI = new Date("2026-04-02T23:49:00Z");
export const FLYBY = new Date("2026-04-06T18:45:00Z");
export const SPLASHDOWN = new Date("2026-04-10T20:06:00Z");

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const PEAK_DISTANCE_MILES = 252_000;
const MILES_PER_KM = 0.621371;
const MPH_PER_KM_PER_SECOND = 2236.9362920544;
const RETURN_EVENT_FALLBACK_ALTITUDE_MILES = 5_000;
const REENTRY_MARKER_ALTITUDE_MILES = 5_000;
const SPLASHDOWN_MARKER_ALTITUDE_MILES = 100;
const LUNAR_APPROACH_FOCUS_RADIUS_KM = 220_000;
const LUNAR_APPROACH_MAX_COMPRESSION = 0.5;

const LAUNCH_MS = LAUNCH.getTime();
const TLI_MS = TLI.getTime();
const FLYBY_MS = FLYBY.getTime();
const SPLASHDOWN_MS = SPLASHDOWN.getTime();

export type Point = {
  x: number;
  y: number;
};

export type BezierSegment = {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
};

export type MissionGeometry = {
  width: number;
  height: number;
  earth: {
    center: Point;
    radius: number;
    atmosphereRadius: number;
    atmosphereWidth: number;
    glowRadius: number;
    image: {
      center: Point;
      width: number;
      height: number;
      rotation: number;
      opacity: number;
    };
    label: Point;
  };
  moon: {
    center: Point;
    radius: number;
    haloRadius: number;
    image: {
      center: Point;
      width: number;
      height: number;
      rotation: number;
      opacity: number;
    };
    label: Point;
    distanceLabel: Point;
    distanceLabelText: string;
  };
  outbound: BezierBranch;
  inbound: BezierBranch;
};

export type MissionPhase = {
  title: string;
  subtitle: string;
};

type MissionEphemerisPayload = {
  source: string;
  startTime: string;
  stopTime: string;
  samples: number[][];
  moonSamples?: number[][];
  earthRadiusKm?: number;
  moonRadiusKm?: number;
  moonFlybyDistanceKm?: number;
  closestApproachTime?: string;
};

export type DistanceEphemerisPayload = {
  source: string;
  startTime: string;
  stopTime: string;
  samples: number[][];
  earthRadiusKm?: number;
  refreshedAt?: string | null;
  lastModified?: string | null;
  etag?: string | null;
};

export type DistanceEphemerisSample = {
  timestampMs: number;
  xKm: number;
  yKm: number;
  zKm: number;
  vxKmPerSecond: number;
  vyKmPerSecond: number;
  vzKmPerSecond: number;
};

export type DistanceEphemeris = {
  source: string;
  startTimeMs: number;
  stopTimeMs: number;
  samples: DistanceEphemerisSample[];
  earthRadiusKm: number;
  refreshedAtMs: number | null;
  lastModified: string | null;
  etag: string | null;
};

export type MissionEphemerisSample = {
  timestampMs: number;
  xKm: number;
  yKm: number;
  zKm: number;
  vxKmPerSecond: number;
  vyKmPerSecond: number;
  vzKmPerSecond: number;
  sceneX: number;
  sceneY: number;
  sceneVx: number;
  sceneVy: number;
};

export type MissionEphemeris = {
  source: string;
  startTimeMs: number;
  stopTimeMs: number;
  samples: MissionEphemerisSample[];
  moonSamples: MissionEphemerisSample[];
  earthRadiusKm: number;
  moonRadiusKm: number;
  moonFlybyDistanceKm: number;
  flybyTimeMs: number;
};

export type MissionEphemerisState = {
  timestampMs: number;
  referencePoint: Point;
  distanceMiles: number;
  altitudeMiles: number;
};

export type MissionTelemetry = {
  elapsedClockLabel: string;
  elapsedProgress: number;
  velocityMph: number | null;
  velocityLabel: string;
  velocityProgress: number;
  distanceFromEarthMiles: number | null;
  distanceFromEarthLabel: string;
  distanceFromEarthProgress: number;
  distanceToMoonMiles: number | null;
  distanceToMoonLabel: string;
  distanceToMoonProgress: number;
};

export type BezierBranch = {
  segments: BezierSegment[];
  lengths: number[];
  totalLength: number;
};

export type SceneTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type PhysicalSceneLayout = {
  scale: number;
  worldMinX: number;
  worldMaxCompressedY: number;
  offsetX: number;
  offsetY: number;
  verticalCompression: number;
  topInset: number;
  bottomInset: number;
  earthCenter: Point;
  moonCenter: Point;
  moonFocusCenter: Point;
  earthRadius: number;
  moonRadius: number;
  moonDistanceLabelText: string;
};

const REFERENCE_SCENE = {
  width: 1440,
  height: 900,
  earth: {
    center: { x: 426, y: 450 },
    radius: 176,
    atmosphereRadius: 214,
    atmosphereWidth: 40,
    glowRadius: 330,
    image: {
      center: { x: 452, y: 446 },
      width: 634,
      height: 659,
      rotation: Math.PI / 2,
      opacity: 0.8,
    },
    label: { x: 699, y: 454 },
  },
  moon: {
    center: { x: 1013, y: 461 },
    radius: 58,
    haloRadius: 90,
    image: {
      center: { x: 1008, y: 462 },
      width: 142,
      height: 131,
      rotation: 0,
      opacity: 1,
    },
    label: { x: 915, y: 454 },
    distanceLabel: { x: 914, y: 468 },
  },
  trajectoryFrame: {
    x: 416,
    y: 292,
  },
  outbound: [
    {
      p0: { x: 27.554, y: 138.226 },
      p1: { x: 142.49, y: -31.9193 },
      p2: { x: 280.414, y: -11.9022 },
      p3: { x: 395.35, y: 28.1318 },
    },
    {
      p0: { x: 395.35, y: 28.1318 },
      p1: { x: 510.286, y: 68.1659 },
      p2: { x: 593.545, y: 56.1557 },
      p3: { x: 674, y: 138.226 },
    },
  ],
  inbound: [
    {
      p0: { x: 674, y: 138.226 },
      p1: { x: 674, y: 138.226 },
      p2: { x: 714, y: 199.5 },
      p3: { x: 645, y: 254.5 },
    },
    {
      p0: { x: 645, y: 254.5 },
      p1: { x: 549, y: 308.37 },
      p2: { x: 303.401, y: 348.404 },
      p3: { x: 165.477, y: 308.37 },
    },
    {
      p0: { x: 165.477, y: 308.37 },
      p1: { x: 27.554, y: 268.336 },
      p2: { x: -41.4077, y: 228.302 },
      p3: { x: 27.554, y: 158.243 },
    },
  ],
} as const;

export const HERO_MILESTONES = [
  { key: "launch", label: "Launch", progress: 0, timeMs: LAUNCH_MS },
  { key: "tli", label: "TLI", progress: 0.115, timeMs: TLI_MS },
  { key: "flyby", label: "Lunar flyby", progress: 0.5, timeMs: FLYBY_MS },
  {
    key: "reentry",
    label: "Reentry",
    progress: 0.92,
    timeMs: LAUNCH_MS + (SPLASHDOWN_MS - LAUNCH_MS) * 0.92,
  },
  { key: "splashdown", label: "Splashdown", progress: 1, timeMs: SPLASHDOWN_MS },
] as const;

export const MISSION_EPHEMERIS_URL = "/data/artemis-ii-oem-2026-04-02.json";

const missionEphemerisCache = new Map<string, Promise<MissionEphemeris>>();
const physicalSceneLayoutCache = new WeakMap<
  MissionEphemeris,
  Map<string, PhysicalSceneLayout>
>();
type ProjectedTrajectoryPathSample = {
  timestampMs: number;
  point: Point;
};

type ProjectedTrajectoryPath = {
  samples: ProjectedTrajectoryPathSample[];
  cumulativeLengths: number[];
  totalLength: number;
};

const projectedTrajectoryPathCache = new WeakMap<
  MissionEphemeris,
  Map<string, ProjectedTrajectoryPath>
>();

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function parseMissionEphemerisPayload(
  payload: MissionEphemerisPayload,
): MissionEphemeris {
  const parseSample = ([
    timestampMs,
    xKm,
    yKm,
    zKm,
    vxKmPerSecond,
    vyKmPerSecond,
    vzKmPerSecond,
    sceneX,
    sceneY,
    sceneVx,
    sceneVy,
  ]: number[]): MissionEphemerisSample => ({
    timestampMs,
    xKm,
    yKm,
    zKm,
    vxKmPerSecond,
    vyKmPerSecond,
    vzKmPerSecond,
    sceneX,
    sceneY,
    sceneVx,
    sceneVy,
  });

  return {
    source: payload.source,
    startTimeMs: new Date(payload.startTime).getTime(),
    stopTimeMs: new Date(payload.stopTime).getTime(),
    samples: payload.samples.map(parseSample),
    moonSamples: (payload.moonSamples ?? []).map(parseSample),
    earthRadiusKm: payload.earthRadiusKm ?? 6378.137,
    moonRadiusKm: payload.moonRadiusKm ?? 1737.4,
    moonFlybyDistanceKm: payload.moonFlybyDistanceKm ?? 384400,
    flybyTimeMs: new Date(payload.closestApproachTime ?? payload.stopTime).getTime(),
  };
}

export function parseDistanceEphemerisPayload(
  payload: DistanceEphemerisPayload,
): DistanceEphemeris {
  const parseSample = ([
    timestampMs,
    xKm,
    yKm,
    zKm,
    vxKmPerSecond,
    vyKmPerSecond,
    vzKmPerSecond,
  ]: number[]): DistanceEphemerisSample => ({
    timestampMs,
    xKm,
    yKm,
    zKm,
    vxKmPerSecond,
    vyKmPerSecond,
    vzKmPerSecond,
  });

  return {
    source: payload.source,
    startTimeMs: new Date(payload.startTime).getTime(),
    stopTimeMs: new Date(payload.stopTime).getTime(),
    samples: payload.samples.map(parseSample),
    earthRadiusKm: payload.earthRadiusKm ?? 6378.137,
    refreshedAtMs: payload.refreshedAt ? new Date(payload.refreshedAt).getTime() : null,
    lastModified: payload.lastModified ?? null,
    etag: payload.etag ?? null,
  };
}

export async function loadMissionEphemeris(
  url = MISSION_EPHEMERIS_URL,
): Promise<MissionEphemeris> {
  if (!missionEphemerisCache.has(url)) {
    missionEphemerisCache.set(
      url,
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load mission ephemeris from ${url}`);
          }

          return response.json() as Promise<MissionEphemerisPayload>;
        })
        .then(parseMissionEphemerisPayload),
    );
  }

  return missionEphemerisCache.get(url)!;
}

export function getMissionProgress(nowMs: number) {
  return clamp((nowMs - LAUNCH_MS) / (SPLASHDOWN_MS - LAUNCH_MS), 0, 1);
}

function getDisplayTrajectoryEndTimeMs(ephemeris?: MissionEphemeris | null) {
  if (!ephemeris) {
    return SPLASHDOWN_MS;
  }

  return Math.min(ephemeris.stopTimeMs, SPLASHDOWN_MS);
}

export function getTrajectoryProgress(
  nowMs: number,
  ephemeris?: MissionEphemeris | null,
) {
  const startTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);
  const endTimeMs = getDisplayTrajectoryEndTimeMs(ephemeris);

  if (endTimeMs <= startTimeMs) {
    return 0;
  }

  return clamp((nowMs - startTimeMs) / (endTimeMs - startTimeMs), 0, 1);
}

export function getTrajectoryTimelineMilestones(
  ephemeris?: MissionEphemeris | null,
) {
  const startTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);
  const endTimeMs = getDisplayTrajectoryEndTimeMs(ephemeris);

  return HERO_MILESTONES.filter((milestone) => milestone.key !== "launch").map((milestone) => {
    const resolvedTimeMs =
      getOrbitMilestoneTimeMs(milestone.key, ephemeris) ?? milestone.timeMs;
    const timeMs =
      resolvedTimeMs < startTimeMs || resolvedTimeMs > endTimeMs
        ? milestone.timeMs
        : resolvedTimeMs;

    return {
      ...milestone,
      timeMs,
      progress: getTrajectoryProgress(timeMs, ephemeris),
    };
  });
}

function buildProjectedTrajectoryPath(
  width: number,
  height: number,
  ephemeris: MissionEphemeris,
): ProjectedTrajectoryPath {
  const startTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);
  const endTimeMs = getDisplayTrajectoryEndTimeMs(ephemeris);
  const startState = getMissionEphemerisState(startTimeMs, ephemeris);
  const endState = getMissionEphemerisState(endTimeMs, ephemeris);

  if (!startState || !endState) {
    return {
      samples: [],
      cumulativeLengths: [],
      totalLength: 0,
    };
  }

  const samples: ProjectedTrajectoryPathSample[] = [
    {
      timestampMs: startTimeMs,
      point: transformProjectedPoint(startState.referencePoint, width, height, ephemeris),
    },
  ];

  for (const sample of ephemeris.samples) {
    if (sample.timestampMs <= startTimeMs || sample.timestampMs >= endTimeMs) {
      continue;
    }

    samples.push({
      timestampMs: sample.timestampMs,
      point: transformProjectedPoint(
        { x: sample.sceneX, y: sample.sceneY },
        width,
        height,
        ephemeris,
      ),
    });
  }

  samples.push({
    timestampMs: endTimeMs,
    point: transformProjectedPoint(endState.referencePoint, width, height, ephemeris),
  });

  const cumulativeLengths = [0];

  for (let index = 1; index < samples.length; index += 1) {
    const previousPoint = samples[index - 1].point;
    const currentPoint = samples[index].point;
    cumulativeLengths.push(
      cumulativeLengths[index - 1] +
        Math.hypot(
          currentPoint.x - previousPoint.x,
          currentPoint.y - previousPoint.y,
        ),
    );
  }

  return {
    samples,
    cumulativeLengths,
    totalLength: cumulativeLengths[cumulativeLengths.length - 1] ?? 0,
  };
}

function getProjectedTrajectoryPath(
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  if (!ephemeris || ephemeris.samples.length === 0) {
    return null;
  }

  const cacheKey = `${width}x${height}`;
  const cachedPath = projectedTrajectoryPathCache.get(ephemeris)?.get(cacheKey);
  if (cachedPath) {
    return cachedPath;
  }

  const path = buildProjectedTrajectoryPath(width, height, ephemeris);

  if (!projectedTrajectoryPathCache.has(ephemeris)) {
    projectedTrajectoryPathCache.set(ephemeris, new Map());
  }

  projectedTrajectoryPathCache.get(ephemeris)!.set(cacheKey, path);
  return path;
}

function getProjectedTrajectoryLengthAtTime(
  nowMs: number,
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  const path = getProjectedTrajectoryPath(width, height, ephemeris);
  if (!path || path.samples.length === 0 || !ephemeris) {
    return null;
  }

  const startTimeMs = path.samples[0].timestampMs;
  const endTimeMs = path.samples[path.samples.length - 1].timestampMs;
  const clampedNowMs = clamp(nowMs, startTimeMs, endTimeMs);
  const segmentIndex = getSampleIndexAtTime(path.samples, clampedNowMs);
  const baseLength = path.cumulativeLengths[segmentIndex] ?? 0;
  const currentPoint = getMissionPointAtTime(clampedNowMs, width, height, ephemeris);
  const previousSample = path.samples[segmentIndex];

  if (!currentPoint || !previousSample || previousSample.timestampMs === clampedNowMs) {
    return baseLength;
  }

  return clamp(
    baseLength +
      Math.hypot(
        currentPoint.x - previousSample.point.x,
        currentPoint.y - previousSample.point.y,
      ),
    0,
    path.totalLength,
  );
}

export function getTrajectoryPathProgress(
  nowMs: number,
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  const path = getProjectedTrajectoryPath(width, height, ephemeris);
  const pathLength = getProjectedTrajectoryLengthAtTime(nowMs, width, height, ephemeris);

  if (!path || path.totalLength <= 0 || pathLength === null) {
    return getTrajectoryProgress(nowMs, ephemeris);
  }

  return clamp(pathLength / path.totalLength, 0, 1);
}

export function getTrajectoryPathMilestones(
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  const startTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);
  const endTimeMs = getDisplayTrajectoryEndTimeMs(ephemeris);

  return HERO_MILESTONES.filter((milestone) => milestone.key !== "launch").map((milestone) => {
    const resolvedTimeMs =
      getOrbitMilestoneTimeMs(milestone.key, ephemeris) ?? milestone.timeMs;
    const timeMs =
      resolvedTimeMs < startTimeMs || resolvedTimeMs > endTimeMs
        ? milestone.timeMs
        : resolvedTimeMs;
    const state = getMissionEphemerisState(timeMs, ephemeris);

    return {
      ...milestone,
      timeMs,
      progress:
        milestone.key === "reentry" &&
        state?.altitudeMiles !== null &&
        (state?.altitudeMiles ?? 0) > RETURN_EVENT_FALLBACK_ALTITUDE_MILES
          ? milestone.progress
          : getTrajectoryPathProgress(timeMs, width, height, ephemeris),
    };
  });
}

export function getTrajectoryPathPointAtProgress(
  progress: number,
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  const path = getProjectedTrajectoryPath(width, height, ephemeris);
  if (!path || path.samples.length === 0 || path.totalLength <= 0) {
    return null;
  }

  const clampedProgress = clamp(progress, 0, 1);
  const targetLength = path.totalLength * clampedProgress;

  for (let index = 1; index < path.samples.length; index += 1) {
    const previousLength = path.cumulativeLengths[index - 1];
    const currentLength = path.cumulativeLengths[index];

    if (targetLength <= currentLength || index === path.samples.length - 1) {
      const startPoint = path.samples[index - 1].point;
      const endPoint = path.samples[index].point;
      const segmentLength = currentLength - previousLength;
      const localT =
        segmentLength <= 0 ? 0 : clamp((targetLength - previousLength) / segmentLength, 0, 1);

      return {
        x: startPoint.x + (endPoint.x - startPoint.x) * localT,
        y: startPoint.y + (endPoint.y - startPoint.y) * localT,
      };
    }
  }

  return path.samples[path.samples.length - 1].point;
}

export function getDistanceFromEarth(progress: number) {
  const triangularProgress =
    progress <= 0.5 ? progress / 0.5 : (1 - progress) / 0.5;

  return clamp(triangularProgress, 0, 1) * PEAK_DISTANCE_MILES;
}

function getDistanceFromEarthAtTime(
  nowMs: number,
  ephemeris?: MissionEphemeris | null,
) {
  const officialState = getMissionEphemerisState(nowMs, ephemeris);

  if (officialState) {
    return officialState.altitudeMiles;
  }

  return getDistanceFromEarth(getMissionProgress(nowMs));
}

type MilesFormatOptions = {
  nearest?: number;
  approximate?: boolean;
};

export function formatMilesFromEarth(
  distance: number,
  options: MilesFormatOptions = {},
) {
  const { nearest = 100, approximate = true } = options;
  const roundedDistance =
    nearest <= 1 ? Math.round(distance) : Math.round(distance / nearest) * nearest;
  const prefix = approximate ? "~" : "";

  return `${prefix}${roundedDistance.toLocaleString("en-US")}`;
}

export function getMissionDayNumber(nowMs: number) {
  if (nowMs < LAUNCH_MS) {
    return 0;
  }

  return Math.floor((nowMs - LAUNCH_MS) / DAY_MS) + 1;
}

export function formatMissionElapsed(nowMs: number) {
  const elapsed = Math.max(0, nowMs - LAUNCH_MS);
  const days = Math.floor(elapsed / DAY_MS) + 1;
  const hours = Math.floor((elapsed % DAY_MS) / HOUR_MS);

  return `Day ${days}  ${String(hours).padStart(2, "0")}h`;
}

export function formatMissionElapsedClock(nowMs: number) {
  const elapsed = Math.max(0, nowMs - LAUNCH_MS);
  const days = Math.floor(elapsed / DAY_MS);
  const hours = Math.floor((elapsed % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((elapsed % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((elapsed % MINUTE_MS) / 1000);

  return [days, hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatTimeUntilSplashdown(nowMs: number) {
  const remaining = Math.max(0, SPLASHDOWN_MS - nowMs);
  const hours = Math.floor(remaining / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);

  return `${String(hours).padStart(3, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

export function getMissionPhase(progress: number, nowMs: number): MissionPhase {
  if (progress < 0.02) {
    return {
      title: "Ascent & separation",
      subtitle: "Launch vehicle ascent · crewed Orion insertion",
    };
  }

  if (progress < 0.115 && nowMs < TLI_MS) {
    return {
      title: "High Earth orbit",
      subtitle: "Parking orbit · translunar injection alignment",
    };
  }

  if (progress < 0.45) {
    return {
      title: "Trans-lunar coast",
      subtitle: "Outbound · free-return trajectory",
    };
  }

  if (progress < 0.56) {
    return {
      title: "Lunar flyby",
      subtitle: "Closest approach · gravity-assisted swingby",
    };
  }

  if (progress < 0.88) {
    return {
      title: "Earth return",
      subtitle: "Inbound · free-return trajectory",
    };
  }

  if (progress < 0.96) {
    return {
      title: "Reentry preparation",
      subtitle: "Crew module checkout · entry corridor targeting",
    };
  }

  return {
    title: "Splashdown",
    subtitle: "Entry interface · Pacific recovery operations",
  };
}

export function getMissionSnapshot(
  nowMs: number,
  ephemeris?: MissionEphemeris | null,
) {
  const progress = getMissionProgress(nowMs);
  const trajectoryProgress = getTrajectoryProgress(nowMs, ephemeris);
  const phase = getMissionPhase(progress, nowMs);
  const distance = getDistanceFromEarthAtTime(nowMs, ephemeris);

  return {
    progress,
    trajectoryProgress,
    phase,
    distance,
    distanceLabel: formatMilesFromEarth(distance, {
      nearest: 1,
      approximate: false,
    }),
    elapsedLabel: formatMissionElapsed(nowMs),
    splashdownLabel: formatTimeUntilSplashdown(nowMs),
  };
}

function formatTelemetryNumber(value: number | null) {
  if (value === null) {
    return "—";
  }

  return Math.round(value).toLocaleString("en-US");
}

export function getMissionTelemetry(
  nowMs: number,
  missionEphemeris?: MissionEphemeris | null,
): MissionTelemetry {
  const elapsedProgress = getMissionProgress(nowMs);
  const velocityMph = getMissionVelocityMphAtTime(nowMs, missionEphemeris);
  const distanceFromEarthMiles = getDistanceFromEarthAtTime(nowMs, missionEphemeris);
  const distanceToMoonMiles = getDistanceToMoonMilesAtTime(nowMs, missionEphemeris);

  return {
    elapsedClockLabel: formatMissionElapsedClock(nowMs),
    elapsedProgress,
    velocityMph,
    velocityLabel: formatTelemetryNumber(velocityMph),
    velocityProgress: clamp((velocityMph ?? 0) / 24_500, 0, 1),
    distanceFromEarthMiles,
    distanceFromEarthLabel: formatTelemetryNumber(distanceFromEarthMiles),
    distanceFromEarthProgress: clamp((distanceFromEarthMiles ?? 0) / PEAK_DISTANCE_MILES, 0, 1),
    distanceToMoonMiles,
    distanceToMoonLabel: formatTelemetryNumber(distanceToMoonMiles),
    distanceToMoonProgress:
      distanceToMoonMiles === null
        ? 0
        : clamp(1 - distanceToMoonMiles / PEAK_DISTANCE_MILES, 0, 1),
  };
}

export function getReferenceSceneTransform(width: number, height: number): SceneTransform {
  const scale = Math.min(
    width / REFERENCE_SCENE.width,
    height / REFERENCE_SCENE.height,
  );

  return {
    scale,
    offsetX: (width - REFERENCE_SCENE.width * scale) / 2,
    offsetY: (height - REFERENCE_SCENE.height * scale) / 2,
  };
}

export function transformReferencePoint(point: Point, width: number, height: number): Point {
  const { scale, offsetX, offsetY } = getReferenceSceneTransform(width, height);
  return transformPoint(point, scale, offsetX, offsetY);
}

function getSampleIndexAtTime<T extends { timestampMs: number }>(samples: T[], nowMs: number) {
  let low = 0;
  let high = samples.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midTimestamp = samples[mid].timestampMs;

    if (midTimestamp <= nowMs) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return clamp(high, 0, samples.length - 1);
}

function hermiteInterpolate(
  startValue: number,
  startVelocity: number,
  endValue: number,
  endVelocity: number,
  deltaSeconds: number,
  t: number,
) {
  const tSquared = t * t;
  const tCubed = tSquared * t;
  const tangentStart = startVelocity * deltaSeconds;
  const tangentEnd = endVelocity * deltaSeconds;

  return (
    (2 * tCubed - 3 * tSquared + 1) * startValue +
    (tCubed - 2 * tSquared + t) * tangentStart +
    (-2 * tCubed + 3 * tSquared) * endValue +
    (tCubed - tSquared) * tangentEnd
  );
}

function interpolateEphemerisSample(
  samples: MissionEphemerisSample[],
  nowMs: number,
): MissionEphemerisSample | null {
  if (samples.length === 0) {
    return null;
  }

  const startTimeMs = samples[0].timestampMs;
  const stopTimeMs = samples[samples.length - 1].timestampMs;
  if (nowMs < startTimeMs || nowMs > stopTimeMs) {
    return null;
  }

  const segmentIndex = getSampleIndexAtTime(samples, nowMs);
  const startSample = samples[segmentIndex];
  const endSample = samples[Math.min(segmentIndex + 1, samples.length - 1)];

  if (startSample.timestampMs === endSample.timestampMs || nowMs === startSample.timestampMs) {
    return {
      timestampMs: nowMs,
      xKm: startSample.xKm,
      yKm: startSample.yKm,
      zKm: startSample.zKm,
      vxKmPerSecond: startSample.vxKmPerSecond,
      vyKmPerSecond: startSample.vyKmPerSecond,
      vzKmPerSecond: startSample.vzKmPerSecond,
      sceneX: startSample.sceneX,
      sceneY: startSample.sceneY,
      sceneVx: startSample.sceneVx,
      sceneVy: startSample.sceneVy,
    };
  }

  const elapsedMs = endSample.timestampMs - startSample.timestampMs;
  const elapsedSeconds = elapsedMs / 1000;
  const localT = clamp((nowMs - startSample.timestampMs) / elapsedMs, 0, 1);

  const xKm = hermiteInterpolate(
    startSample.xKm,
    startSample.vxKmPerSecond,
    endSample.xKm,
    endSample.vxKmPerSecond,
    elapsedSeconds,
    localT,
  );
  const yKm = hermiteInterpolate(
    startSample.yKm,
    startSample.vyKmPerSecond,
    endSample.yKm,
    endSample.vyKmPerSecond,
    elapsedSeconds,
    localT,
  );
  const zKm = hermiteInterpolate(
    startSample.zKm,
    startSample.vzKmPerSecond,
    endSample.zKm,
    endSample.vzKmPerSecond,
    elapsedSeconds,
    localT,
  );
  const sceneX = hermiteInterpolate(
    startSample.sceneX,
    startSample.sceneVx,
    endSample.sceneX,
    endSample.sceneVx,
    elapsedSeconds,
    localT,
  );
  const sceneY = hermiteInterpolate(
    startSample.sceneY,
    startSample.sceneVy,
    endSample.sceneY,
    endSample.sceneVy,
    elapsedSeconds,
    localT,
  );

  return {
    timestampMs: nowMs,
    xKm,
    yKm,
    zKm,
    vxKmPerSecond: hermiteInterpolate(
      startSample.vxKmPerSecond,
      0,
      endSample.vxKmPerSecond,
      0,
      elapsedSeconds,
      localT,
    ),
    vyKmPerSecond: hermiteInterpolate(
      startSample.vyKmPerSecond,
      0,
      endSample.vyKmPerSecond,
      0,
      elapsedSeconds,
      localT,
    ),
    vzKmPerSecond: hermiteInterpolate(
      startSample.vzKmPerSecond,
      0,
      endSample.vzKmPerSecond,
      0,
      elapsedSeconds,
      localT,
    ),
    sceneX,
    sceneY,
    sceneVx: hermiteInterpolate(
      startSample.sceneVx,
      0,
      endSample.sceneVx,
      0,
      elapsedSeconds,
      localT,
    ),
    sceneVy: hermiteInterpolate(
      startSample.sceneVy,
      0,
      endSample.sceneVy,
      0,
      elapsedSeconds,
      localT,
    ),
  };
}

function interpolateDistanceEphemerisSample(
  samples: DistanceEphemerisSample[],
  nowMs: number,
): DistanceEphemerisSample | null {
  if (samples.length === 0) {
    return null;
  }

  const startTimeMs = samples[0].timestampMs;
  const stopTimeMs = samples[samples.length - 1].timestampMs;
  if (nowMs < startTimeMs || nowMs > stopTimeMs) {
    return null;
  }

  const segmentIndex = getSampleIndexAtTime(samples, nowMs);
  const startSample = samples[segmentIndex];
  const endSample = samples[Math.min(segmentIndex + 1, samples.length - 1)];

  if (startSample.timestampMs === endSample.timestampMs || nowMs === startSample.timestampMs) {
    return {
      timestampMs: nowMs,
      xKm: startSample.xKm,
      yKm: startSample.yKm,
      zKm: startSample.zKm,
      vxKmPerSecond: startSample.vxKmPerSecond,
      vyKmPerSecond: startSample.vyKmPerSecond,
      vzKmPerSecond: startSample.vzKmPerSecond,
    };
  }

  const elapsedMs = endSample.timestampMs - startSample.timestampMs;
  const elapsedSeconds = elapsedMs / 1000;
  const localT = clamp((nowMs - startSample.timestampMs) / elapsedMs, 0, 1);

  return {
    timestampMs: nowMs,
    xKm: hermiteInterpolate(
      startSample.xKm,
      startSample.vxKmPerSecond,
      endSample.xKm,
      endSample.vxKmPerSecond,
      elapsedSeconds,
      localT,
    ),
    yKm: hermiteInterpolate(
      startSample.yKm,
      startSample.vyKmPerSecond,
      endSample.yKm,
      endSample.vyKmPerSecond,
      elapsedSeconds,
      localT,
    ),
    zKm: hermiteInterpolate(
      startSample.zKm,
      startSample.vzKmPerSecond,
      endSample.zKm,
      endSample.vzKmPerSecond,
      elapsedSeconds,
      localT,
    ),
    vxKmPerSecond: hermiteInterpolate(
      startSample.vxKmPerSecond,
      0,
      endSample.vxKmPerSecond,
      0,
      elapsedSeconds,
      localT,
    ),
    vyKmPerSecond: hermiteInterpolate(
      startSample.vyKmPerSecond,
      0,
      endSample.vyKmPerSecond,
      0,
      elapsedSeconds,
      localT,
    ),
    vzKmPerSecond: hermiteInterpolate(
      startSample.vzKmPerSecond,
      0,
      endSample.vzKmPerSecond,
      0,
      elapsedSeconds,
      localT,
    ),
  };
}

export function getMissionEphemerisState(
  nowMs: number,
  ephemeris?: MissionEphemeris | null,
) : MissionEphemerisState | null {
  if (!ephemeris) {
    return null;
  }

  const sample = interpolateEphemerisSample(ephemeris.samples, nowMs);
  if (!sample) {
    return null;
  }

  return {
    timestampMs: sample.timestampMs,
    referencePoint: {
      x: sample.sceneX,
      y: sample.sceneY,
    },
    distanceMiles: Math.hypot(sample.xKm, sample.yKm, sample.zKm) * MILES_PER_KM,
    altitudeMiles: Math.max(
      Math.hypot(sample.xKm, sample.yKm, sample.zKm) * MILES_PER_KM -
        ephemeris.earthRadiusKm * MILES_PER_KM,
      0,
    ),
  };
}

export function getMissionVelocityMphAtTime(
  nowMs: number,
  ephemeris?: MissionEphemeris | null,
) {
  if (!ephemeris) {
    return null;
  }

  const sample = interpolateEphemerisSample(ephemeris.samples, nowMs);
  if (!sample) {
    return null;
  }

  return (
    Math.hypot(
      sample.vxKmPerSecond,
      sample.vyKmPerSecond,
      sample.vzKmPerSecond,
    ) * MPH_PER_KM_PER_SECOND
  );
}

export function getOfficialAltitudeMilesAtTime(
  nowMs: number,
  ephemeris?: DistanceEphemeris | null,
) {
  if (!ephemeris) {
    return null;
  }

  const sample = interpolateDistanceEphemerisSample(ephemeris.samples, nowMs);
  if (!sample) {
    return null;
  }

  return Math.max(
    Math.hypot(sample.xKm, sample.yKm, sample.zKm) * MILES_PER_KM -
      ephemeris.earthRadiusKm * MILES_PER_KM,
    0,
  );
}

export function getOfficialVelocityMphAtTime(
  nowMs: number,
  ephemeris?: DistanceEphemeris | null,
) {
  if (!ephemeris) {
    return null;
  }

  const sample = interpolateDistanceEphemerisSample(ephemeris.samples, nowMs);
  if (!sample) {
    return null;
  }

  return (
    Math.hypot(
      sample.vxKmPerSecond,
      sample.vyKmPerSecond,
      sample.vzKmPerSecond,
    ) * MPH_PER_KM_PER_SECOND
  );
}

function getMoonEphemerisState(
  nowMs: number,
  ephemeris?: MissionEphemeris | null,
) {
  if (!ephemeris) {
    return null;
  }

  return interpolateEphemerisSample(ephemeris.moonSamples, nowMs);
}

export function getDistanceToMoonMilesAtTime(
  nowMs: number,
  ephemeris?: MissionEphemeris | null,
) {
  if (!ephemeris) {
    return null;
  }

  const sample = interpolateEphemerisSample(ephemeris.samples, nowMs);
  const moonSample = getMoonEphemerisState(nowMs, ephemeris);
  if (!sample || !moonSample) {
    return null;
  }

  return Math.max(
    Math.hypot(
      sample.xKm - moonSample.xKm,
      sample.yKm - moonSample.yKm,
      sample.zKm - moonSample.zKm,
    ) * MILES_PER_KM -
      ephemeris.moonRadiusKm * MILES_PER_KM,
    0,
  );
}

function getDisplayTrajectoryStartTimeMs(ephemeris?: MissionEphemeris | null) {
  if (!ephemeris) {
    return TLI_MS;
  }

  return Math.max(ephemeris.startTimeMs, TLI_MS);
}

function getPhysicalSceneLayout(
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
): PhysicalSceneLayout | null {
  if (!ephemeris || ephemeris.samples.length === 0 || ephemeris.moonSamples.length === 0) {
    return null;
  }

  const cacheKey = `${width}x${height}`;
  const cachedLayout = physicalSceneLayoutCache.get(ephemeris)?.get(cacheKey);
  if (cachedLayout) {
    return cachedLayout;
  }

  const flybyMoonState = getMoonEphemerisState(ephemeris.flybyTimeMs, ephemeris);
  if (!flybyMoonState) {
    return null;
  }

  const mobile = width < 768;
  const horizontalPadding = mobile ? 18 : 72;
  const verticalPadding = mobile ? 84 : 92;
  const topInset = mobile ? clamp(height * 0.34, 236, 292) : verticalPadding;
  const bottomInset = mobile ? clamp(height * 0.25, 190, 244) : verticalPadding;
  const verticalCompression = mobile ? 0.46 : 0.34;
  const bodyScaleBoost = mobile ? 1.08 : 1.15;
  const displayStartTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);
  const startIndex = getSampleIndexAtTime(ephemeris.samples, displayStartTimeMs);
  const displaySamples = ephemeris.samples.slice(startIndex);
  const verticalPaddingKm = ephemeris.earthRadiusKm * 1.6;

  let worldMinX = -ephemeris.earthRadiusKm * 1.75;
  let worldMaxX = flybyMoonState.sceneX + ephemeris.moonRadiusKm * 2;
  let worldMinY = -verticalPaddingKm;
  let worldMaxY = verticalPaddingKm;

  for (const sample of displaySamples) {
    worldMinX = Math.min(worldMinX, sample.sceneX);
    worldMaxX = Math.max(worldMaxX, sample.sceneX);
    worldMinY = Math.min(worldMinY, sample.sceneY);
    worldMaxY = Math.max(worldMaxY, sample.sceneY);
  }

  worldMinX -= ephemeris.earthRadiusKm * 2.1;
  worldMaxX += ephemeris.moonRadiusKm * 4.4;
  worldMinY -= ephemeris.earthRadiusKm * 0.9;
  worldMaxY += ephemeris.earthRadiusKm * 0.9;

  const compressedMinY = worldMinY * verticalCompression;
  const compressedMaxY = worldMaxY * verticalCompression;

  const availableWidth = Math.max(1, width - horizontalPadding * 2);
  const availableHeight = Math.max(1, height - topInset - bottomInset);
  const scale = Math.min(
    availableWidth / Math.max(1, worldMaxX - worldMinX),
    availableHeight / Math.max(1, compressedMaxY - compressedMinY),
  );

  const offsetX = (width - (worldMaxX - worldMinX) * scale) / 2 - worldMinX * scale;
  const offsetY =
    topInset +
    (availableHeight - (compressedMaxY - compressedMinY) * scale) / 2 +
    compressedMaxY * scale;

  const worldToScreen = (point: Point): Point => ({
    x: offsetX + point.x * scale,
    y: offsetY - point.y * verticalCompression * scale,
  });

  const earthCenter = worldToScreen({ x: 0, y: 0 });
  const moonCenter = worldToScreen({
    x: flybyMoonState.sceneX,
    y: flybyMoonState.sceneY,
  });
  const earthRadius = ephemeris.earthRadiusKm * scale * bodyScaleBoost;
  const moonRadius = ephemeris.moonRadiusKm * scale * bodyScaleBoost;

  const layout = {
    scale,
    worldMinX,
    worldMaxCompressedY: compressedMaxY,
    offsetX,
    offsetY,
    verticalCompression,
    topInset,
    bottomInset,
    earthCenter,
    moonCenter,
    moonFocusCenter: {
      x: flybyMoonState.sceneX,
      y: flybyMoonState.sceneY,
    },
    earthRadius,
    moonRadius,
    moonDistanceLabelText: formatMilesFromEarth(ephemeris.moonFlybyDistanceKm * MILES_PER_KM),
  };

  if (!physicalSceneLayoutCache.has(ephemeris)) {
    physicalSceneLayoutCache.set(ephemeris, new Map());
  }
  physicalSceneLayoutCache.get(ephemeris)!.set(cacheKey, layout);

  return layout;
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

function applyLunarApproachFocus(
  point: Point,
  physicalLayout: PhysicalSceneLayout,
) {
  const deltaX = point.x - physicalLayout.moonFocusCenter.x;
  const deltaY = point.y - physicalLayout.moonFocusCenter.y;
  const distanceToMoonCenterKm = Math.hypot(deltaX, deltaY);
  const focusProgress = clamp(
    1 - distanceToMoonCenterKm / LUNAR_APPROACH_FOCUS_RADIUS_KM,
    0,
    1,
  );

  if (focusProgress === 0) {
    return point;
  }

  // Tighten the last stretch into the lunar flyby so near-moon states read
  // closer onscreen without disturbing the broader Earth-to-Moon framing.
  const compression =
    LUNAR_APPROACH_MAX_COMPRESSION * easeInOut(focusProgress);

  return {
    x: physicalLayout.moonFocusCenter.x + deltaX * (1 - compression),
    y: physicalLayout.moonFocusCenter.y + deltaY * (1 - compression),
  };
}

function transformProjectedPoint(
  point: Point,
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  const physicalLayout = getPhysicalSceneLayout(width, height, ephemeris);
  if (!physicalLayout) {
    return transformReferencePoint(point, width, height);
  }

  const adjustedPoint = applyLunarApproachFocus(point, physicalLayout);

  return {
    x: physicalLayout.offsetX + adjustedPoint.x * physicalLayout.scale,
    y:
      physicalLayout.offsetY -
      adjustedPoint.y *
        physicalLayout.verticalCompression *
        physicalLayout.scale,
  };
}

export function getMissionPointAtTime(
  nowMs: number,
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  const officialState = getMissionEphemerisState(nowMs, ephemeris);
  if (!officialState) {
    return null;
  }

  return transformProjectedPoint(officialState.referencePoint, width, height, ephemeris);
}

function projectEphemerisSamples(
  samples: MissionEphemerisSample[],
  width: number,
  height: number,
  step: number,
  ephemeris?: MissionEphemeris | null,
) {
  const points: Point[] = [];

  for (let index = 0; index < samples.length; index += step) {
    points.push(
      transformProjectedPoint(
        { x: samples[index].sceneX, y: samples[index].sceneY },
        width,
        height,
        ephemeris,
      ),
    );
  }

  const lastSample = samples[samples.length - 1];
  const lastPoint = transformProjectedPoint(
    { x: lastSample.sceneX, y: lastSample.sceneY },
    width,
    height,
    ephemeris,
  );
  const finalPoint = points[points.length - 1];

  if (!finalPoint || finalPoint.x !== lastPoint.x || finalPoint.y !== lastPoint.y) {
    points.push(lastPoint);
  }

  return points;
}

export function getMissionPathPoints(
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  if (!ephemeris || ephemeris.samples.length === 0) {
    return [];
  }

  const startTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);
  const startIndex = getSampleIndexAtTime(ephemeris.samples, startTimeMs);
  return projectEphemerisSamples(
    ephemeris.samples.slice(startIndex),
    width,
    height,
    2,
    ephemeris,
  );
}

export function getMissionTraveledPathPoints(
  nowMs: number,
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
) {
  if (!ephemeris || ephemeris.samples.length === 0) {
    return [];
  }

  const startTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);
  if (nowMs < startTimeMs) {
    return [];
  }

  if (nowMs >= ephemeris.stopTimeMs) {
    return getMissionPathPoints(width, height, ephemeris);
  }

  const startIndex = getSampleIndexAtTime(ephemeris.samples, startTimeMs);
  const index = getSampleIndexAtTime(ephemeris.samples, nowMs);
  const samples = ephemeris.samples.slice(startIndex, index + 1);
  const points = projectEphemerisSamples(samples, width, height, 2, ephemeris);
  const currentPoint = getMissionPointAtTime(nowMs, width, height, ephemeris);

  if (currentPoint) {
    const lastPoint = points[points.length - 1];
    if (!lastPoint || lastPoint.x !== currentPoint.x || lastPoint.y !== currentPoint.y) {
      points.push(currentPoint);
    }
  }

  return points;
}

export function getMissionMilestonePoint(
  width: number,
  height: number,
  milestoneTimeMs: number,
  ephemeris?: MissionEphemeris | null,
) {
  const displayStartTimeMs = getDisplayTrajectoryStartTimeMs(ephemeris);

  if (milestoneTimeMs < displayStartTimeMs) {
    if (milestoneTimeMs === LAUNCH_MS) {
      return getTrajectoryGeometry(width, height, ephemeris).earth.center;
    }

    if (milestoneTimeMs === TLI_MS) {
      const tliPoint = getMissionPointAtTime(displayStartTimeMs, width, height, ephemeris);
      if (tliPoint) {
        return tliPoint;
      }
    }
  }

  const officialPoint = getMissionPointAtTime(milestoneTimeMs, width, height, ephemeris);
  if (officialPoint) {
    return officialPoint;
  }

  return null;
}

function findFirstReturnSampleAtOrBelowAltitude(
  altitudeMiles: number,
  ephemeris?: MissionEphemeris | null,
) {
  if (!ephemeris) {
    return null;
  }

  for (const sample of ephemeris.samples) {
    if (sample.timestampMs < ephemeris.flybyTimeMs) {
      continue;
    }

    const state = getMissionEphemerisState(sample.timestampMs, ephemeris);
    if (state && state.altitudeMiles <= altitudeMiles) {
      return sample.timestampMs;
    }
  }

  return null;
}

function findClosestReturnSampleTimeMs(ephemeris?: MissionEphemeris | null) {
  if (!ephemeris) {
    return null;
  }

  let closestSample: MissionEphemerisSample | null = null;
  let closestAltitudeMiles = Number.POSITIVE_INFINITY;

  for (const sample of ephemeris.samples) {
    if (sample.timestampMs < ephemeris.flybyTimeMs) {
      continue;
    }

    const state = getMissionEphemerisState(sample.timestampMs, ephemeris);
    if (state && state.altitudeMiles < closestAltitudeMiles) {
      closestAltitudeMiles = state.altitudeMiles;
      closestSample = sample;
    }
  }

  return closestSample?.timestampMs ?? null;
}

export function getOrbitMilestoneTimeMs(
  key: (typeof HERO_MILESTONES)[number]["key"],
  ephemeris?: MissionEphemeris | null,
) {
  const milestone = HERO_MILESTONES.find((entry) => entry.key === key);
  if (!milestone) {
    return null;
  }

  if (key === "flyby" && ephemeris) {
    return ephemeris.flybyTimeMs;
  }

  if (key === "reentry" || key === "splashdown") {
    const officialState = getMissionEphemerisState(milestone.timeMs, ephemeris);
    if (
      officialState &&
      officialState.altitudeMiles > RETURN_EVENT_FALLBACK_ALTITUDE_MILES
    ) {
      if (key === "reentry") {
        return (
          findFirstReturnSampleAtOrBelowAltitude(
            REENTRY_MARKER_ALTITUDE_MILES,
            ephemeris,
          ) ?? milestone.timeMs
        );
      }

      return (
        findFirstReturnSampleAtOrBelowAltitude(
          SPLASHDOWN_MARKER_ALTITUDE_MILES,
          ephemeris,
        ) ??
        findClosestReturnSampleTimeMs(ephemeris) ??
        milestone.timeMs
      );
    }
  }

  return milestone.timeMs;
}

export function getOrbitMilestonePoint(
  width: number,
  height: number,
  key: (typeof HERO_MILESTONES)[number]["key"],
  ephemeris?: MissionEphemeris | null,
) {
  const milestoneTimeMs = getOrbitMilestoneTimeMs(key, ephemeris);
  if (milestoneTimeMs === null) {
    return null;
  }

  return getMissionMilestonePoint(width, height, milestoneTimeMs, ephemeris);
}

function transformPoint(
  point: Point,
  scale: number,
  offsetX: number,
  offsetY: number,
): Point {
  return {
    x: point.x * scale + offsetX,
    y: point.y * scale + offsetY,
  };
}

function approximateBezierLength(segment: BezierSegment, steps = 36) {
  let length = 0;
  let previousPoint = segment.p0;

  for (let step = 1; step <= steps; step += 1) {
    const point = getPointOnBezier(segment, step / steps);
    length += Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
    previousPoint = point;
  }

  return length;
}

function buildBranch(
  segments: readonly BezierSegment[],
  scale: number,
  offsetX: number,
  offsetY: number,
): BezierBranch {
  const transformedSegments = segments.map((segment) => ({
    p0: transformPoint(segment.p0, scale, offsetX, offsetY),
    p1: transformPoint(segment.p1, scale, offsetX, offsetY),
    p2: transformPoint(segment.p2, scale, offsetX, offsetY),
    p3: transformPoint(segment.p3, scale, offsetX, offsetY),
  }));

  const lengths = transformedSegments.map((segment) => approximateBezierLength(segment));
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);

  return {
    segments: transformedSegments,
    lengths,
    totalLength,
  };
}

function getReferenceTrajectoryGeometry(width: number, height: number): MissionGeometry {
  const scale = Math.min(
    width / REFERENCE_SCENE.width,
    height / REFERENCE_SCENE.height,
  );
  const offsetX = (width - REFERENCE_SCENE.width * scale) / 2;
  const offsetY = (height - REFERENCE_SCENE.height * scale) / 2;
  const transform = (point: Point) => transformPoint(point, scale, offsetX, offsetY);
  const translateTrajectoryPoint = (point: Point) =>
    transform({
      x: REFERENCE_SCENE.trajectoryFrame.x + point.x,
      y: REFERENCE_SCENE.trajectoryFrame.y + point.y,
    });

  return {
    width,
    height,
    earth: {
      center: transform(REFERENCE_SCENE.earth.center),
      radius: REFERENCE_SCENE.earth.radius * scale,
      atmosphereRadius: REFERENCE_SCENE.earth.atmosphereRadius * scale,
      atmosphereWidth: REFERENCE_SCENE.earth.atmosphereWidth * scale,
      glowRadius: REFERENCE_SCENE.earth.glowRadius * scale,
      image: {
        center: transform(REFERENCE_SCENE.earth.image.center),
        width: REFERENCE_SCENE.earth.image.width * scale,
        height: REFERENCE_SCENE.earth.image.height * scale,
        rotation: REFERENCE_SCENE.earth.image.rotation,
        opacity: REFERENCE_SCENE.earth.image.opacity,
      },
      label: transform(REFERENCE_SCENE.earth.label),
    },
    moon: {
      center: transform(REFERENCE_SCENE.moon.center),
      radius: REFERENCE_SCENE.moon.radius * scale,
      haloRadius: REFERENCE_SCENE.moon.haloRadius * scale,
      image: {
        center: transform(REFERENCE_SCENE.moon.image.center),
        width: REFERENCE_SCENE.moon.image.width * scale,
        height: REFERENCE_SCENE.moon.image.height * scale,
        rotation: REFERENCE_SCENE.moon.image.rotation,
        opacity: REFERENCE_SCENE.moon.image.opacity,
      },
      label: transform(REFERENCE_SCENE.moon.label),
      distanceLabel: transform(REFERENCE_SCENE.moon.distanceLabel),
      distanceLabelText: "238,855 mi",
    },
    outbound: buildBranch(
      REFERENCE_SCENE.outbound.map((segment) => ({
        p0: translateTrajectoryPoint(segment.p0),
        p1: translateTrajectoryPoint(segment.p1),
        p2: translateTrajectoryPoint(segment.p2),
        p3: translateTrajectoryPoint(segment.p3),
      })),
      1,
      0,
      0,
    ),
    inbound: buildBranch(
      REFERENCE_SCENE.inbound.map((segment) => ({
        p0: translateTrajectoryPoint(segment.p0),
        p1: translateTrajectoryPoint(segment.p1),
        p2: translateTrajectoryPoint(segment.p2),
        p3: translateTrajectoryPoint(segment.p3),
      })),
      1,
      0,
      0,
    ),
  };
}

export function getTrajectoryGeometry(
  width: number,
  height: number,
  ephemeris?: MissionEphemeris | null,
): MissionGeometry {
  const fallback = getReferenceTrajectoryGeometry(width, height);
  const physicalLayout = getPhysicalSceneLayout(width, height, ephemeris);

  if (!physicalLayout) {
    return fallback;
  }

  const bodyGap = physicalLayout.moonCenter.x - physicalLayout.earthCenter.x;
  const earthLabelX = Math.min(
    physicalLayout.earthCenter.x + Math.max(48, physicalLayout.earthRadius * 2.55),
    physicalLayout.earthCenter.x + bodyGap * 0.42,
  );
  const moonLabelX = Math.max(
    physicalLayout.moonCenter.x - Math.max(48, physicalLayout.moonRadius * 6.4),
    earthLabelX + 96,
  );
  const earthLabelY = physicalLayout.earthCenter.y - Math.max(10, physicalLayout.earthRadius * 0.22);
  const moonLabelY = physicalLayout.moonCenter.y - Math.max(10, physicalLayout.moonRadius * 0.8);

  return {
    ...fallback,
    earth: {
      ...fallback.earth,
      center: physicalLayout.earthCenter,
      radius: physicalLayout.earthRadius,
      atmosphereRadius: physicalLayout.earthRadius * 1.35,
      atmosphereWidth: Math.max(1, physicalLayout.earthRadius * 0.1),
      glowRadius: physicalLayout.earthRadius * 2.4,
      image: {
        center: physicalLayout.earthCenter,
        width: physicalLayout.earthRadius * 2.35,
        height: physicalLayout.earthRadius * 2.35,
        rotation: 0,
        opacity: 1,
      },
      label: {
        x: earthLabelX,
        y: earthLabelY,
      },
    },
    moon: {
      ...fallback.moon,
      center: physicalLayout.moonCenter,
      radius: physicalLayout.moonRadius,
      haloRadius: physicalLayout.moonRadius * 1.35,
      image: {
        center: physicalLayout.moonCenter,
        width: physicalLayout.moonRadius * 2.35,
        height: physicalLayout.moonRadius * 2.35,
        rotation: 0,
        opacity: 1,
      },
      label: {
        x: moonLabelX,
        y: moonLabelY,
      },
      distanceLabel: {
        x: moonLabelX,
        y: moonLabelY + 14,
      },
      distanceLabelText: physicalLayout.moonDistanceLabelText,
    },
  };
}

export function getPointOnBezier(segment: BezierSegment, t: number): Point {
  const inverse = 1 - t;
  const inverseSquared = inverse * inverse;
  const inverseCubed = inverseSquared * inverse;
  const tSquared = t * t;
  const tCubed = tSquared * t;

  return {
    x:
      inverseCubed * segment.p0.x +
      3 * inverseSquared * t * segment.p1.x +
      3 * inverse * tSquared * segment.p2.x +
      tCubed * segment.p3.x,
    y:
      inverseCubed * segment.p0.y +
      3 * inverseSquared * t * segment.p1.y +
      3 * inverse * tSquared * segment.p2.y +
      tCubed * segment.p3.y,
  };
}

export function getPointOnMissionCurve(progress: number, geometry: MissionGeometry) {
  const clamped = clamp(progress, 0, 1);

  if (clamped <= 0.5) {
    return getPointOnBranch(geometry.outbound, clamped / 0.5);
  }

  return getPointOnBranch(geometry.inbound, (clamped - 0.5) / 0.5);
}

function getPointOnBranch(branch: BezierBranch, t: number) {
  const clamped = clamp(t, 0, 1);
  const targetLength = branch.totalLength * clamped;
  let traversedLength = 0;

  for (let index = 0; index < branch.segments.length; index += 1) {
    const length = branch.lengths[index];
    const segment = branch.segments[index];

    if (targetLength <= traversedLength + length || index === branch.segments.length - 1) {
      const localLength = targetLength - traversedLength;
      const localT = length === 0 ? 0 : clamp(localLength / length, 0, 1);
      return getPointOnBezier(segment, localT);
    }

    traversedLength += length;
  }

  return branch.segments[branch.segments.length - 1].p3;
}

export function sampleMissionCurve(
  progress: number,
  geometry: MissionGeometry,
  totalSteps = 220,
) {
  const clamped = clamp(progress, 0, 1);
  const steps = Math.max(1, Math.ceil(totalSteps * clamped));
  const points: Point[] = [];

  for (let index = 0; index <= steps; index += 1) {
    points.push(getPointOnMissionCurve((clamped * index) / steps, geometry));
  }

  return points;
}

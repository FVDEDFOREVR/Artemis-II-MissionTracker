"use client";

import { useEffect, useRef, useState } from "react";

import LiveDot from "@/components/LiveDot";
import {
  HERO_MILESTONES,
  BezierBranch,
  MissionEphemeris,
  MissionGeometry,
  MissionTelemetry,
  Point,
  getMissionMilestonePoint,
  getMissionPathPoints,
  getMissionPointAtTime,
  getMissionSnapshot,
  getMissionTelemetry,
  getMissionTraveledPathPoints,
  getPointOnMissionCurve,
  loadMissionEphemeris,
  getTrajectoryGeometry,
  sampleMissionCurve,
} from "@/lib/mission";

type Star = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

const CREW = "Wiseman · Glover / Koch · Hansen";
const PITCH_BLACK = "#000000";
const EARTH_IMAGE_URL = "/earth-figma.png";
const MOON_IMAGE_URL = "/moon-figma.png";
const REFERENCE_WIDTH = 1440;
const REFERENCE_HEIGHT = 900;

const STAR_FIELD: Star[] = Array.from({ length: 60 }, (_, index) => {
  const seed = (offset: number) => {
    const value = Math.sin((index + 1) * 9283.123 + offset) * 43758.5453;
    return value - Math.floor(value);
  };

  return {
    x: seed(1.73),
    y: seed(4.11),
    radius: 0.3 + seed(8.27) * 0.9,
    opacity: 0.05 + seed(14.91) * 0.2,
  };
});

const PROGRESS_LABELS: Record<
  string,
  {
    full: string;
    short: string;
  }
> = {
  launch: { full: "Launch", short: "Launch" },
  tli: { full: "TLI", short: "TLI" },
  flyby: { full: "Lunar flyby", short: "Flyby" },
  reentry: { full: "Reentry", short: "Entry" },
  splashdown: { full: "Splashdown", short: "Splash" },
};

const DESKTOP_PROGRESS = {
  wrapper: { x: 424, y: 748, width: 614, height: 50 },
  percentRight: 555,
  rail: { x: 36, y: 30, width: 520 },
  dotOffsetY: 26.5,
  ticks: {
    launch: { x: 36, y: 26, height: 4 },
    tli: { x: 95.8, y: 26, height: 4 },
    flyby: { x: 296, y: 26, height: 4 },
    reentry: { x: 493.6, y: 26, height: 4 },
    splashdown: { x: 556, y: 26, height: 5 },
  },
  labels: {
    launch: { x: 0, y: 23 },
    tli: { x: 87.8, y: 40 },
    flyby: { x: 267.5, y: 40 },
    reentry: { x: 475.6, y: 40 },
    splashdown: { x: 562, y: 23 },
  },
} as const;

function loadCanvasImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${source}`));
    image.src = source;
  });
}

function drawEllipse(
  context: CanvasRenderingContext2D,
  point: Point,
  radiusX: number,
  radiusY: number,
  rotation: number,
  fillStyle: string,
  alpha = 1,
) {
  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = fillStyle;
  context.beginPath();
  context.ellipse(point.x, point.y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawStars(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  for (const star of STAR_FIELD) {
    context.beginPath();
    context.fillStyle = `rgba(232,228,216,${star.opacity})`;
    context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawCroppedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  destination: {
    center: Point;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
  },
  clipCenter: Point,
  clipRadius: number,
) {
  context.save();
  context.beginPath();
  context.arc(clipCenter.x, clipCenter.y, clipRadius, 0, Math.PI * 2);
  context.clip();
  context.globalAlpha = destination.opacity;
  context.translate(destination.center.x, destination.center.y);
  context.rotate(destination.rotation);
  const coverScale = Math.max(
    destination.width / Math.max(1, image.naturalWidth || image.width),
    destination.height / Math.max(1, image.naturalHeight || image.height),
  );
  const renderWidth = (image.naturalWidth || image.width) * coverScale;
  const renderHeight = (image.naturalHeight || image.height) * coverScale;
  context.drawImage(
    image,
    -renderWidth / 2,
    -renderHeight / 2,
    renderWidth,
    renderHeight,
  );
  context.restore();
}

function drawEarth(
  context: CanvasRenderingContext2D,
  geometry: MissionGeometry,
  earthImage: HTMLImageElement | null,
) {
  if (!earthImage) {
    return;
  }

  const { earth } = geometry;

  const glow = context.createRadialGradient(
    earth.center.x,
    earth.center.y,
    earth.radius * 0.3,
    earth.center.x,
    earth.center.y,
    earth.glowRadius,
  );
  glow.addColorStop(0, "rgba(48,80,160,0.035)");
  glow.addColorStop(1, "rgba(48,80,160,0)");

  context.fillStyle = glow;
  context.beginPath();
  context.arc(earth.center.x, earth.center.y, earth.glowRadius, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#0A1224";
  context.beginPath();
  context.arc(earth.center.x, earth.center.y, earth.radius, 0, Math.PI * 2);
  context.fill();

  drawCroppedImage(context, earthImage, earth.image, earth.center, earth.radius);
}

function drawMoon(
  context: CanvasRenderingContext2D,
  geometry: MissionGeometry,
  moonImage: HTMLImageElement | null,
) {
  if (!moonImage) {
    return;
  }

  const { moon } = geometry;

  drawCroppedImage(context, moonImage, moon.image, moon.center, moon.radius);

}

function traceBranch(context: CanvasRenderingContext2D, branch: BezierBranch) {
  branch.segments.forEach((segment, index) => {
    if (index === 0) {
      context.moveTo(segment.p0.x, segment.p0.y);
    }

    context.bezierCurveTo(
      segment.p1.x,
      segment.p1.y,
      segment.p2.x,
      segment.p2.y,
      segment.p3.x,
      segment.p3.y,
    );
  });
}

function drawTrajectory(
  context: CanvasRenderingContext2D,
  geometry: MissionGeometry,
  progress: number,
  fullPath?: Point[],
  traveledPath?: Point[],
) {
  context.save();
  context.strokeStyle = "rgba(216,213,203,0.28)";
  context.setLineDash([4, 6]);
  context.lineWidth = 0.9;
  context.beginPath();
  if (fullPath && fullPath.length > 1) {
    fullPath.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
  } else {
    traceBranch(context, geometry.outbound);
    traceBranch(context, geometry.inbound);
  }
  context.stroke();
  context.restore();

  const traveledPoints =
    traveledPath && traveledPath.length > 1
      ? traveledPath
      : sampleMissionCurve(progress, geometry);

  if (traveledPoints.length > 1) {
    context.save();
    context.strokeStyle = "rgba(238,234,224,0.88)";
    context.lineWidth = 1.15;
    context.beginPath();
    traveledPoints.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.stroke();
    context.restore();
  }
}

function drawMilestones(
  context: CanvasRenderingContext2D,
  geometry: MissionGeometry,
  progress: number,
  milestonePoints?: Partial<Record<(typeof HERO_MILESTONES)[number]["key"], Point | null>>,
) {
  HERO_MILESTONES.forEach((milestone) => {
    const point =
      milestonePoints?.[milestone.key] ??
      getPointOnMissionCurve(milestone.progress, geometry);
    const isPast = progress >= milestone.progress;

    context.beginPath();
    context.fillStyle = isPast
      ? "rgba(200,198,188,0.75)"
      : "rgba(100,98,88,0.3)";
    context.arc(point.x, point.y, 3, 0, Math.PI * 2);
    context.fill();
  });
}

function drawOrion(
  context: CanvasRenderingContext2D,
  geometry: MissionGeometry,
  progress: number,
  officialPoint?: Point | null,
  animationMs = 0,
) {
  const point = officialPoint ?? getPointOnMissionCurve(progress, geometry);
  const direction = point.x > geometry.width * 0.74 ? -1 : 1;
  const leaderEnd = point.x + direction * 46;
  const pulseCycle = (animationMs % 1800) / 1800;
  const secondaryPulseCycle = ((animationMs + 900) % 1800) / 1800;
  const pulseRadius = 10 + pulseCycle * 7;
  const secondaryPulseRadius = 10 + secondaryPulseCycle * 7;
  const coreScale = 1 + Math.sin(animationMs / 240) * 0.08;

  context.beginPath();
  context.strokeStyle = `rgba(248,244,235,${0.28 * (1 - pulseCycle)})`;
  context.lineWidth = 1;
  context.arc(point.x, point.y, pulseRadius, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.strokeStyle = `rgba(232,228,216,${0.12 * (1 - secondaryPulseCycle)})`;
  context.lineWidth = 0.75;
  context.arc(point.x, point.y, secondaryPulseRadius, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.fillStyle = "rgba(232,228,216,0.18)";
  context.arc(point.x, point.y, 9.5, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.fillStyle = "#E8E4D8";
  context.arc(point.x, point.y, 7.5, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.fillStyle = "#C0392B";
  context.arc(point.x, point.y, 2.75 * coreScale, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(250,248,242,1)";
  context.lineWidth = 0.75;
  context.beginPath();
  context.arc(point.x, point.y, 7.5, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = "rgba(240,236,227,0.98)";
  context.lineWidth = 0.75;
  context.beginPath();
  context.moveTo(point.x + direction * 10.5, point.y);
  context.lineTo(leaderEnd, point.y);
  context.stroke();
}

function drawScene(
  context: CanvasRenderingContext2D,
  geometry: MissionGeometry,
  progress: number,
  earthImage: HTMLImageElement | null,
  moonImage: HTMLImageElement | null,
  fullPath?: Point[],
  traveledPath?: Point[],
  officialPoint?: Point | null,
  milestonePoints?: Partial<Record<(typeof HERO_MILESTONES)[number]["key"], Point | null>>,
  animationMs = 0,
) {
  context.clearRect(0, 0, geometry.width, geometry.height);
  context.fillStyle = PITCH_BLACK;
  context.fillRect(0, 0, geometry.width, geometry.height);
  const bodiesReady = Boolean(earthImage && moonImage);

  drawStars(context, geometry.width, geometry.height);
  drawTrajectory(context, geometry, progress, fullPath, traveledPath);
  drawMilestones(context, geometry, progress, milestonePoints);
  if (bodiesReady) {
    drawEarth(context, geometry, earthImage);
    drawMoon(context, geometry, moonImage);
  }
  drawOrion(context, geometry, progress, officialPoint, animationMs);
}

export default function HeroTracker({
  initialNowMs,
  initialDataSource,
  initialSnapshot,
  initialTelemetry,
}: {
  initialNowMs: number;
  initialDataSource: string | null;
  initialSnapshot: ReturnType<typeof getMissionSnapshot>;
  initialTelemetry: MissionTelemetry;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const earthImageRef = useRef<HTMLImageElement | null>(null);
  const moonImageRef = useRef<HTMLImageElement | null>(null);
  const overlayOrionRef = useRef<HTMLDivElement | null>(null);
  const mobileProgressRef = useRef<HTMLDivElement | null>(null);
  const desktopProgressRef = useRef<HTMLDivElement | null>(null);
  const mobileProgressPercentRef = useRef<HTMLSpanElement | null>(null);
  const desktopProgressPercentRef = useRef<HTMLSpanElement | null>(null);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [nowMs, setNowMs] = useState(initialNowMs);
  const [ephemeris, setEphemeris] = useState<MissionEphemeris | null | undefined>(undefined);
  const [, setImageLoadState] = useState(0);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    let intervalId: number | undefined;
    const tick = () => {
      setNowMs(Date.now());
    };

    tick();

    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 1000);
    }, 1000 - (Date.now() % 1000));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      loadCanvasImage(EARTH_IMAGE_URL),
      loadCanvasImage(MOON_IMAGE_URL),
    ]).then(([earthResult, moonResult]) => {
      if (cancelled) {
        return;
      }

      if (earthResult.status === "fulfilled") {
        earthImageRef.current = earthResult.value;
      }

      if (moonResult.status === "fulfilled") {
        moonImageRef.current = moonResult.value;
      }

      setImageLoadState((value) => value + 1);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadMissionEphemeris()
      .then((payload) => {
        if (!cancelled) {
          setEphemeris(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEphemeris(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
    canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    let animationFrameId = 0;
    const fullPath = getMissionPathPoints(viewport.width, viewport.height, ephemeris);
    const milestonePoints = Object.fromEntries(
      HERO_MILESTONES.map((milestone) => [
        milestone.key,
        getMissionMilestonePoint(
          viewport.width,
          viewport.height,
          milestone.key === "flyby" && ephemeris ? ephemeris.flybyTimeMs : milestone.timeMs,
          ephemeris,
        ),
      ]),
    ) as Partial<Record<(typeof HERO_MILESTONES)[number]["key"], Point | null>>;

    const render = () => {
      const geometry = getTrajectoryGeometry(viewport.width, viewport.height, ephemeris);
      const now = Date.now();
      const progress = getMissionSnapshot(now, ephemeris).progress;
      const traveledPath = getMissionTraveledPathPoints(
        now,
        viewport.width,
        viewport.height,
        ephemeris,
      );
      const officialPoint = getMissionPointAtTime(
        now,
        viewport.width,
        viewport.height,
        ephemeris,
      );
      const orionPoint = officialPoint ?? getPointOnMissionCurve(progress, geometry);

      if (overlayOrionRef.current) {
        const direction = orionPoint.x > geometry.width * 0.74 ? -1 : 1;
        const textX = orionPoint.x + (direction > 0 ? 56 : -56);

        overlayOrionRef.current.style.left = `${textX}px`;
        overlayOrionRef.current.style.top = `${orionPoint.y - 12}px`;
        overlayOrionRef.current.style.textAlign = direction > 0 ? "left" : "right";
        overlayOrionRef.current.style.transform =
          direction > 0 ? "translateX(0)" : "translateX(-100%)";
      }

      const progressText = `${Math.round(progress * 100)}%`;

      if (mobileProgressRef.current) {
        mobileProgressRef.current.style.setProperty("--mission-progress", String(progress));
      }

      if (desktopProgressRef.current) {
        desktopProgressRef.current.style.setProperty("--mission-progress", String(progress));
      }

      if (mobileProgressPercentRef.current) {
        mobileProgressPercentRef.current.textContent = progressText;
      }

      if (desktopProgressPercentRef.current) {
        desktopProgressPercentRef.current.textContent = progressText;
      }

      drawScene(
        context,
        geometry,
        progress,
        earthImageRef.current,
        moonImageRef.current,
        fullPath,
        traveledPath,
        officialPoint,
        milestonePoints,
        now,
      );
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [ephemeris, viewport.height, viewport.width]);

  const resolvedEphemeris = ephemeris ?? null;
  const snapshot =
    ephemeris === undefined
      ? initialSnapshot
      : getMissionSnapshot(nowMs, resolvedEphemeris);
  const telemetry =
    ephemeris === undefined
      ? initialTelemetry
      : getMissionTelemetry(nowMs, resolvedEphemeris);
  const progressPercent = snapshot.progress * 100;
  const mobile = viewport.width < 768;
  const dataSourceLabel =
    resolvedEphemeris?.source ?? initialDataSource ?? "NASA Artemis II published state vectors";
  const overlayGeometry = getTrajectoryGeometry(
    viewport.width,
    viewport.height,
    resolvedEphemeris,
  );
  const initialOverlayOrionPoint =
    getMissionPointAtTime(nowMs, viewport.width, viewport.height, resolvedEphemeris) ??
    getPointOnMissionCurve(snapshot.progress, overlayGeometry);
  const initialOverlayOrionDirection =
    initialOverlayOrionPoint.x > overlayGeometry.width * 0.74 ? -1 : 1;
  const initialOverlayOrionTextX =
    initialOverlayOrionPoint.x + (initialOverlayOrionDirection > 0 ? 56 : -56);
  const sceneScale = Math.min(
    viewport.width / REFERENCE_WIDTH,
    viewport.height / REFERENCE_HEIGHT,
  );
  const sceneOffsetX = (viewport.width - REFERENCE_WIDTH * sceneScale) / 2;
  const sceneOffsetY = (viewport.height - REFERENCE_HEIGHT * sceneScale) / 2;
  const mobileTimelineRailInset = 38;
  const getMobileTimelinePosition = (
    progress: number,
    anchor: "start" | "middle" | "end" = "middle",
  ) => {
    if (anchor === "start") {
      return { left: `${mobileTimelineRailInset}px` };
    }

    if (anchor === "end") {
      return { left: `calc(100% - ${mobileTimelineRailInset}px)`, transform: "translateX(-100%)" };
    }

    return {
      left: `calc(${mobileTimelineRailInset}px + (100% - ${mobileTimelineRailInset * 2}px) * ${progress})`,
      transform: "translateX(-50%)",
    };
  };
  const stats = [
    {
      label: "Mission elapsed · D:H:M:S",
      value: telemetry.elapsedClockLabel,
      monoSpacing: true,
    },
    {
      label: "Velocity · mph",
      value: telemetry.velocityLabel,
    },
    {
      label: "Miles above Earth",
      value: telemetry.distanceFromEarthLabel,
    },
    {
      label: "Miles to Moon",
      value: telemetry.distanceToMoonLabel,
    },
  ];

  return (
    <section className="relative h-[100svh] overflow-hidden bg-space">
      <canvas
        ref={canvasRef}
        aria-label="Live Artemis II mission trajectory"
        className="absolute inset-0 size-full"
      />
      <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute text-[11px] font-light leading-none tracking-[0.03em] text-[#b4b2a8] md:text-[12px]"
            style={{
              left: overlayGeometry.earth.label.x,
              top: overlayGeometry.earth.label.y - (mobile ? 9 : 10),
            }}
          >
            EARTH
          </div>
          <div
            className="absolute text-right text-[11px] font-light leading-none tracking-[0.03em] text-[#b4b2a8] md:text-[12px]"
            style={{
              left: overlayGeometry.moon.label.x,
              top: overlayGeometry.moon.label.y - (mobile ? 9 : 10),
              transform: "translateX(-100%)",
            }}
          >
            MOON
          </div>
          <div
            className="absolute text-right text-[10px] font-light leading-none tracking-[0.03em] text-[#8c8a82] md:text-[12px]"
            style={{
              left: overlayGeometry.moon.distanceLabel.x,
              top: overlayGeometry.moon.distanceLabel.y - (mobile ? 7 : 8),
              transform: "translateX(-100%)",
            }}
          >
            {overlayGeometry.moon.distanceLabelText}
          </div>
          <div
            ref={overlayOrionRef}
            className="absolute"
            style={{
              left: initialOverlayOrionTextX,
              top: initialOverlayOrionPoint.y - 12,
              transform:
                initialOverlayOrionDirection > 0 ? undefined : "translateX(-100%)",
              textAlign: initialOverlayOrionDirection > 0 ? "left" : "right",
            }}
          >
            <div className="text-[11px] font-light leading-none tracking-[0.03em] text-ink md:text-[12px]">
              ORION
            </div>
            <div className="mt-1 text-[10px] font-light leading-none tracking-[0.03em] text-[#8c8a82] md:text-[12px]">
              Integrity
            </div>
          </div>
        </div>

      <div className="absolute inset-0 px-5 py-6 md:px-[60px] md:py-[60px]">
        <div className="flex h-full flex-col">
          <div className={mobile ? "space-y-5" : "space-y-3"}>
            <div className={mobile ? "flex items-start justify-between gap-4" : "md:absolute md:left-[60px] md:top-[60px]"}>
              <img
                src="/nasa-logo.svg"
                alt="NASA logo"
                className={mobile ? "mt-1 h-[58px] w-auto shrink-0" : "mb-4 h-[52px] w-auto md:h-[64px]"}
              />
              <div className={mobile ? "min-w-0 flex-1 text-right" : undefined}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted md:text-[9px]">
                  NASA · Artemis Programme
                </p>
                <img
                  src="/artemis-ii-wordmark.png"
                  alt="Artemis II"
                  className={`mt-3 h-[44px] w-auto object-contain brightness-0 invert md:mt-4 md:h-[68px] ${
                    mobile ? "ml-auto max-w-[380px]" : "-ml-[14px] max-w-[680px]"
                  }`}
                />
                <div className={`mt-3 flex items-center gap-2 ${mobile ? "justify-end" : ""}`}>
                  <LiveDot className="size-[6px]" />
                  <span className="text-[10px] uppercase tracking-[0.14em] text-live md:text-[9px]">
                    MISSION ACTIVE
                  </span>
                </div>
              </div>
            </div>

            <div
              className={
                mobile
                  ? "mt-6 grid grid-cols-2 gap-x-4 gap-y-3"
                  : "mt-8 flex flex-col gap-4 md:absolute md:right-[60px] md:top-[52px] md:mt-0 md:flex-row md:items-start md:gap-0"
              }
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col ${
                    mobile
                      ? "min-w-0 border-t border-[rgba(200,198,188,0.1)] pt-3"
                      : index > 0
                        ? "border-t border-[rgba(200,198,188,0.1)] pt-4 md:ml-6 md:border-l md:border-t-0 md:pl-6 md:pt-0"
                        : ""
                  } md:min-w-[108px] md:items-end`}
                  style={
                    !mobile && index > 0
                      ? mobile
                        ? { borderTopWidth: "0.5px" }
                        : { borderLeftWidth: "0.5px" }
                      : undefined
                  }
                >
                  <span
                    className={`text-[17px] font-medium tracking-[-0.03em] text-ink md:text-[22px] ${
                      stat.monoSpacing ? "whitespace-pre" : ""
                    }`}
                    suppressHydrationWarning
                  >
                    {stat.value}
                  </span>
                  <span className="mt-2 text-left text-[9px] tracking-[0.12em] text-muted md:text-right md:text-[9px]">
                    {stat.label}
                  </span>
                </div>
              ))}
              <p className="col-span-2 text-left text-[9px] font-light tracking-[0.08em] text-[#8c8a82] md:absolute md:left-0 md:top-full md:mt-3 md:w-full md:text-right">
                SOURCE · {dataSourceLabel}
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-5 md:block">
            <div className="md:absolute md:bottom-[60px] md:left-[60px]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted md:text-[9px]">
                CURRENT PHASE
              </p>
              <p className="mt-3 text-[20px] font-medium tracking-[-0.02em] text-ink md:text-[20px]">
                {snapshot.phase.title}
              </p>
              <p className="mt-2 text-[12px] font-light tracking-[0.03em] text-[#a0a09a] md:text-[11px]">
                {snapshot.phase.subtitle}
              </p>
            </div>

            {mobile ? (
              <div className="w-full">
                <div
                  ref={mobileProgressRef}
                  className="relative h-[72px]"
                  style={
                    {
                      "--mission-progress": String(snapshot.progress),
                    } as React.CSSProperties
                  }
                >
                  <span className="absolute left-0 top-0 text-[10px] font-normal tracking-[1.6px] text-muted">
                    MISSION PROGRESS
                  </span>
                  <span
                    ref={mobileProgressPercentRef}
                    className="absolute right-0 top-0 text-right text-[10px] font-normal tracking-[1px] text-muted"
                    suppressHydrationWarning
                  >
                    {Math.round(progressPercent)}%
                  </span>

                  <div
                    className="absolute h-px bg-[rgba(200,198,188,0.14)]"
                    style={{
                      left: mobileTimelineRailInset,
                      right: mobileTimelineRailInset,
                      top: 28,
                    }}
                  />
                  <div
                    className="absolute h-px bg-[rgba(232,228,216,0.7)]"
                    style={{
                      left: mobileTimelineRailInset,
                      top: 28,
                      width: `calc((100% - ${mobileTimelineRailInset * 2}px) * var(--mission-progress))`,
                    }}
                  />
                  <span
                    className="absolute size-2 rounded-full bg-[rgba(232,228,216,0.9)]"
                    style={{
                      left: `calc(${mobileTimelineRailInset}px + (100% - ${mobileTimelineRailInset * 2}px) * var(--mission-progress) - 4px)`,
                      top: 24,
                    }}
                  />

                  {HERO_MILESTONES.map((milestone) => {
                    const tone =
                      snapshot.progress >= milestone.progress ? "#b4b2a8" : "#646258";
                    const tickOpacity = snapshot.progress >= milestone.progress ? 0.5 : 0.18;
                    const anchor =
                      milestone.key === "launch"
                        ? "start"
                        : milestone.key === "splashdown"
                          ? "end"
                          : "middle";

                    return (
                      <div key={milestone.key}>
                        <span
                          className="absolute block w-[0.5px] bg-[rgba(200,198,188,1)]"
                          style={{
                            ...getMobileTimelinePosition(milestone.progress, anchor),
                            top: 24,
                            height: milestone.key === "splashdown" ? 5 : 4,
                            opacity: tickOpacity,
                          }}
                        />
                        <span
                          className="absolute whitespace-nowrap text-[8px] font-light leading-none tracking-[0.4px]"
                          style={{
                            ...getMobileTimelinePosition(milestone.progress, anchor),
                            top:
                              milestone.key === "launch" || milestone.key === "splashdown"
                                ? 19
                                : 46,
                            color: tone,
                          }}
                        >
                          {PROGRESS_LABELS[milestone.key].full}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className="absolute"
                style={{
                  left: sceneOffsetX + DESKTOP_PROGRESS.wrapper.x * sceneScale,
                  top: sceneOffsetY + DESKTOP_PROGRESS.wrapper.y * sceneScale,
                  width: DESKTOP_PROGRESS.wrapper.width * sceneScale,
                  height: DESKTOP_PROGRESS.wrapper.height * sceneScale,
                }}
              >
                <div
                  ref={desktopProgressRef}
                  className="relative"
                  style={{
                    width: DESKTOP_PROGRESS.wrapper.width,
                    height: DESKTOP_PROGRESS.wrapper.height,
                    transform: `scale(${sceneScale})`,
                    transformOrigin: "top left",
                    ["--mission-progress" as string]: String(snapshot.progress),
                  }}
                >
                  <span className="absolute left-0 top-0 text-[9px] font-normal tracking-[1.6px] text-muted">
                    MISSION PROGRESS
                  </span>
                  <span
                    ref={desktopProgressPercentRef}
                    className="absolute top-3 -translate-x-full text-right text-[9px] font-normal tracking-[1px] text-muted"
                    style={{ left: DESKTOP_PROGRESS.percentRight }}
                    suppressHydrationWarning
                  >
                    {Math.round(progressPercent)}%
                  </span>

                  <div
                    className="absolute h-px bg-[rgba(200,198,188,0.14)]"
                    style={{
                      left: DESKTOP_PROGRESS.rail.x,
                      top: DESKTOP_PROGRESS.rail.y,
                      width: DESKTOP_PROGRESS.rail.width,
                    }}
                  />
                  <div
                    className="absolute h-px bg-[rgba(232,228,216,0.7)]"
                    style={{
                      left: DESKTOP_PROGRESS.rail.x,
                      top: DESKTOP_PROGRESS.rail.y,
                      width: `calc(${DESKTOP_PROGRESS.rail.width}px * var(--mission-progress))`,
                    }}
                  />
                  <span
                    className="absolute size-2 rounded-full bg-[rgba(232,228,216,0.9)]"
                    style={{
                      left: `calc(${DESKTOP_PROGRESS.rail.x}px + ${DESKTOP_PROGRESS.rail.width}px * var(--mission-progress) - 4px)`,
                      top: DESKTOP_PROGRESS.dotOffsetY,
                    }}
                  />

                  {HERO_MILESTONES.map((milestone) => {
                    const tick = DESKTOP_PROGRESS.ticks[milestone.key];
                    const label = DESKTOP_PROGRESS.labels[milestone.key];
                    const tone =
                      snapshot.progress >= milestone.progress ? "#b4b2a8" : "#646258";
                    const tickOpacity = snapshot.progress >= milestone.progress ? 0.5 : 0.18;

                    return (
                      <div key={milestone.key}>
                        <span
                          className="absolute block w-[0.5px] bg-[rgba(200,198,188,1)]"
                          style={{
                            left: tick.x,
                            top: tick.y,
                            height: tick.height,
                            opacity: tickOpacity,
                          }}
                        />
                        <span
                          className="absolute whitespace-nowrap text-[8px] font-light leading-none tracking-[0.4px]"
                          style={{
                            left: label.x,
                            top: label.y,
                            color: tone,
                          }}
                        >
                          {PROGRESS_LABELS[milestone.key].full}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="md:absolute md:bottom-[60px] md:right-[60px] md:text-left">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted md:text-[9px]">CREW</p>
              <p className="mt-3 text-[13px] font-light leading-[1.8] tracking-[0.03em] text-[#b4b2a8] md:text-[12px]">
                {CREW.split(" / ").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

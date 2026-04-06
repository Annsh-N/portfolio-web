import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SkillCategory, SkillState } from "@shared/types";

const FIELD_PADDING = 20;
const BASE_DIAMETER = 84;
const MAX_SPEED = 1.5;
const BROWNIAN_FORCE = 0.1;
const DAMPING = 0.992;
const PACKING_EFFICIENCY = 0.5;
const MAX_RADIUS_SHARE = 0.24;

type SkillFieldProps = {
  state: SkillState;
  onGrow: (id: string) => void;
};

type BubblePalette = {
  edge: string;
  text: string;
};

type SimBubble = {
  id: string;
  label: string;
  category: SkillCategory;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  pinFrames: number;
  palette: BubblePalette;
};

type RenderBubble = {
  id: string;
  label: string;
  x: number;
  y: number;
  diameter: number;
  fontSize: number;
  labelWidthRatio: number;
  palette: BubblePalette;
};

function hashValue(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let current = seed || 1;

  return () => {
    current = (current * 1664525 + 1013904223) >>> 0;
    return current / 4294967296;
  };
}

function getPalette(category: SkillCategory): BubblePalette {
  const palette: Record<SkillCategory, BubblePalette> = {
    backend: {
      edge: "rgba(253, 186, 116, 0.72)",
      text: "#fed7aa",
    },
    frontend: {
      edge: "rgba(125, 211, 252, 0.74)",
      text: "#bae6fd",
    },
    data: {
      edge: "rgba(253, 224, 71, 0.72)",
      text: "#fef08a",
    },
    infra: {
      edge: "rgba(110, 231, 183, 0.7)",
      text: "#bbf7d0",
    },
    systems: {
      edge: "rgba(249, 168, 212, 0.7)",
      text: "#fbcfe8",
    },
  };

  return palette[category];
}

function clampBubbleToField(bubble: SimBubble, width: number, height: number) {
  bubble.x = Math.max(FIELD_PADDING + bubble.radius, Math.min(width - FIELD_PADDING - bubble.radius, bubble.x));
  bubble.y = Math.max(FIELD_PADDING + bubble.radius, Math.min(height - FIELD_PADDING - bubble.radius, bubble.y));
}

function resolveWallCollision(bubble: SimBubble, width: number, height: number) {
  const minX = FIELD_PADDING + bubble.radius;
  const maxX = width - FIELD_PADDING - bubble.radius;
  const minY = FIELD_PADDING + bubble.radius;
  const maxY = height - FIELD_PADDING - bubble.radius;

  if (bubble.x < minX) {
    bubble.x = minX;
    bubble.vx = Math.abs(bubble.vx) * 0.92;
  } else if (bubble.x > maxX) {
    bubble.x = maxX;
    bubble.vx = -Math.abs(bubble.vx) * 0.92;
  }

  if (bubble.y < minY) {
    bubble.y = minY;
    bubble.vy = Math.abs(bubble.vy) * 0.92;
  } else if (bubble.y > maxY) {
    bubble.y = maxY;
    bubble.vy = -Math.abs(bubble.vy) * 0.92;
  }
}

function resolveBubbleCollisions(bubbles: SimBubble[], width: number, height: number) {
  for (let iteration = 0; iteration < 4; iteration += 1) {
    for (let index = 0; index < bubbles.length; index += 1) {
      for (let innerIndex = index + 1; innerIndex < bubbles.length; innerIndex += 1) {
        const left = bubbles[index];
        const right = bubbles[innerIndex];
        const dx = right.x - left.x;
        const dy = right.y - left.y;
        const distance = Math.hypot(dx, dy) || 0.001;
        const minimumDistance = left.radius + right.radius;

        if (distance >= minimumDistance) {
          continue;
        }

        const normalX = dx / distance;
        const normalY = dy / distance;
        const overlap = minimumDistance - distance + 0.01;
        const leftWeight = left.pinFrames > 0 ? 0.12 : right.radius / (left.radius + right.radius);
        const rightWeight = right.pinFrames > 0 ? 0.12 : left.radius / (left.radius + right.radius);

        left.x -= normalX * overlap * leftWeight;
        left.y -= normalY * overlap * leftWeight;
        right.x += normalX * overlap * rightWeight;
        right.y += normalY * overlap * rightWeight;

        const relativeVelocityX = right.vx - left.vx;
        const relativeVelocityY = right.vy - left.vy;
        const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

        if (velocityAlongNormal < 0) {
          const restitution = 0.96;
          const leftMass = Math.max(1, left.radius * left.radius);
          const rightMass = Math.max(1, right.radius * right.radius);
          const impulse = (-(1 + restitution) * velocityAlongNormal) / (1 / leftMass + 1 / rightMass);
          const impulseX = impulse * normalX;
          const impulseY = impulse * normalY;

          left.vx -= impulseX / leftMass;
          left.vy -= impulseY / leftMass;
          right.vx += impulseX / rightMass;
          right.vy += impulseY / rightMass;
        }

        clampBubbleToField(left, width, height);
        clampBubbleToField(right, width, height);
      }
    }
  }
}

function placeBubbleRandomly(candidate: SimBubble, placed: SimBubble[], width: number, height: number) {
  const seededRandom = createSeededRandom(hashValue(candidate.id));

  for (let attempt = 0; attempt < 800; attempt += 1) {
    const x = FIELD_PADDING + candidate.radius + seededRandom() * Math.max(1, width - FIELD_PADDING * 2 - candidate.radius * 2);
    const y = FIELD_PADDING + candidate.radius + seededRandom() * Math.max(1, height - FIELD_PADDING * 2 - candidate.radius * 2);
    const collision = placed.some((bubble) => Math.hypot(x - bubble.x, y - bubble.y) < candidate.radius + bubble.radius + 2);

    if (!collision) {
      candidate.x = x;
      candidate.y = y;
      return;
    }
  }

  candidate.x = FIELD_PADDING + candidate.radius + (width - FIELD_PADDING * 2 - candidate.radius * 2) / 2;
  candidate.y = FIELD_PADDING + candidate.radius + (height - FIELD_PADDING * 2 - candidate.radius * 2) / 2;
}

function createRenderBubble(bubble: SimBubble): RenderBubble {
  const diameter = bubble.radius * 2;
  const words = bubble.label.split(/\s+/);
  const longestWord = Math.max(...words.map((word) => word.length));
  const lineCount = Math.min(words.length, 2);
  const labelWidth = diameter * 0.72;
  const maxByWidth = labelWidth / Math.max(longestWord * 0.78, 1);
  const maxByHeight = (diameter * 0.42) / (lineCount * 1.04);
  const fontSize = Number(Math.max(8, Math.min(diameter * 0.16, maxByWidth, maxByHeight)).toFixed(1));

  return {
    id: bubble.id,
    label: bubble.label,
    x: bubble.x,
    y: bubble.y,
    diameter,
    fontSize,
    labelWidthRatio: labelWidth / diameter,
    palette: bubble.palette,
  };
}

function getFitScale(rawRadii: number[], width: number, height: number): number {
  if (!rawRadii.length || !width || !height) {
    return 1;
  }

  const usableWidth = Math.max(1, width - FIELD_PADDING * 2);
  const usableHeight = Math.max(1, height - FIELD_PADDING * 2);
  const usableArea = usableWidth * usableHeight;
  const totalBubbleArea = rawRadii.reduce((sum, radius) => sum + Math.PI * radius * radius, 0);
  const maxRawRadius = Math.max(...rawRadii);
  const areaScale = Math.sqrt((usableArea * PACKING_EFFICIENCY) / Math.max(totalBubbleArea, 1));
  const edgeScale = (Math.min(usableWidth, usableHeight) * MAX_RADIUS_SHARE) / Math.max(maxRawRadius, 1);

  return Math.min(1, areaScale, edgeScale);
}

export function SkillField({ state, onGrow }: SkillFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<SimBubble[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const previousDimensionsRef = useRef<{ width: number; height: number } | null>(null);
  const clickedBubbleIdRef = useRef<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [renderedBubbles, setRenderedBubbles] = useState<RenderBubble[]>([]);

  const sizedSkills = useMemo(() => {
    if (!state.bubbles.length || !dimensions.width || !dimensions.height) {
      return [];
    }

    const smallestSize = Math.max(0.001, Math.min(...state.bubbles.map((bubble) => bubble.size)));
    const rawRadii = state.bubbles.map((bubble) => (BASE_DIAMETER * Math.sqrt(bubble.size / smallestSize)) / 2);
    const fitScale = getFitScale(rawRadii, dimensions.width, dimensions.height);

    return state.bubbles.map((bubble, index) => ({
      ...bubble,
      radius: Number((rawRadii[index] * fitScale).toFixed(2)),
      palette: getPalette(bubble.category),
    }));
  }, [dimensions.height, dimensions.width, state.bubbles]);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateDimensions = () => {
      const width = element.getBoundingClientRect().width;
      const height = Math.max(328, Math.min(528, width * 0.496));

      setDimensions((current) => {
        if (Math.abs(current.width - width) < 0.5 && Math.abs(current.height - height) < 0.5) {
          return current;
        }

        return {
          width,
          height,
        };
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height || !sizedSkills.length) {
      return;
    }

    const previousDimensions = previousDimensionsRef.current;
    const byId = new Map(bubblesRef.current.map((bubble) => [bubble.id, bubble]));

    if (previousDimensions && previousDimensions.width && previousDimensions.height) {
      const widthRatio = dimensions.width / previousDimensions.width;
      const heightRatio = dimensions.height / previousDimensions.height;

      bubblesRef.current.forEach((bubble) => {
        bubble.x *= widthRatio;
        bubble.y *= heightRatio;
      });
    }

    const nextBubbles: SimBubble[] = [];

    for (const skill of sizedSkills) {
      const existing = byId.get(skill.id);
      const nextBubble: SimBubble = existing
        ? {
            ...existing,
            label: skill.label,
            category: skill.category,
            targetRadius: skill.radius,
            palette: skill.palette,
          }
        : {
            id: skill.id,
            label: skill.label,
            category: skill.category,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: skill.radius,
            targetRadius: skill.radius,
            pinFrames: 0,
            palette: skill.palette,
          };

      if (!existing) {
        placeBubbleRandomly(nextBubble, nextBubbles, dimensions.width, dimensions.height);
        const seededRandom = createSeededRandom(hashValue(`${skill.id}-velocity`));
        nextBubble.vx = (seededRandom() - 0.5) * 0.8;
        nextBubble.vy = (seededRandom() - 0.5) * 0.8;
      } else {
        if (nextBubble.targetRadius > nextBubble.radius && clickedBubbleIdRef.current === nextBubble.id) {
          nextBubble.pinFrames = 18;
        }
        clampBubbleToField(nextBubble, dimensions.width, dimensions.height);
      }

      nextBubbles.push(nextBubble);
    }

    resolveBubbleCollisions(nextBubbles, dimensions.width, dimensions.height);
    bubblesRef.current = nextBubbles;
    previousDimensionsRef.current = dimensions;
    setRenderedBubbles(nextBubbles.map(createRenderBubble));
  }, [dimensions, sizedSkills]);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) {
      return;
    }

    const step = (timestamp: number) => {
      const bubbles = bubblesRef.current;

      if (!bubbles.length) {
        frameRef.current = window.requestAnimationFrame(step);
        return;
      }

      const rawDelta = lastFrameTimeRef.current ? (timestamp - lastFrameTimeRef.current) / 16.6667 : 1;
      const delta = Math.max(0.75, Math.min(1.8, rawDelta));
      lastFrameTimeRef.current = timestamp;

      for (const bubble of bubbles) {
        bubble.radius += (bubble.targetRadius - bubble.radius) * 0.12 * delta;
        bubble.radius = Number(bubble.radius.toFixed(3));

        if (bubble.pinFrames > 0) {
          bubble.pinFrames -= 1;
        }

        bubble.vx += (Math.random() - 0.5) * BROWNIAN_FORCE * delta;
        bubble.vy += (Math.random() - 0.5) * BROWNIAN_FORCE * delta;
        bubble.vx *= DAMPING;
        bubble.vy *= DAMPING;

        const speed = Math.hypot(bubble.vx, bubble.vy);

        if (speed > MAX_SPEED) {
          const ratio = MAX_SPEED / speed;
          bubble.vx *= ratio;
          bubble.vy *= ratio;
        }

        bubble.x += bubble.vx * delta;
        bubble.y += bubble.vy * delta;
        resolveWallCollision(bubble, dimensions.width, dimensions.height);
      }

      resolveBubbleCollisions(bubbles, dimensions.width, dimensions.height);
      setRenderedBubbles(bubbles.map(createRenderBubble));
      frameRef.current = window.requestAnimationFrame(step);
    };

    frameRef.current = window.requestAnimationFrame(step);
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      lastFrameTimeRef.current = 0;
    };
  }, [dimensions]);

  return (
    <div
      className="skill-field"
      ref={containerRef}
      style={{
        height: `${dimensions.height || 328}px`,
      }}
    >
      {renderedBubbles.map((bubble) => (
        <button
          className="skill-bubble"
          key={bubble.id}
          onClick={() => {
            clickedBubbleIdRef.current = bubble.id;
            onGrow(bubble.id);
          }}
          style={
            {
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.diameter}px`,
              height: `${bubble.diameter}px`,
              "--bubble-edge": bubble.palette.edge,
              "--bubble-text": bubble.palette.text,
              "--bubble-font-size": `${bubble.fontSize}px`,
              "--bubble-label-width": `${bubble.labelWidthRatio}`,
            } as CSSProperties
          }
          type="button"
        >
          <span>{bubble.label}</span>
        </button>
      ))}
    </div>
  );
}

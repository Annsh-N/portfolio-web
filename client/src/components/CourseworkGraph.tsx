import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SemesterCourseNode } from "@shared/types";
import { clamp } from "@/lib/format";

type CourseworkGraphProps = {
  nodes: SemesterCourseNode[];
};

type PositionedNode = SemesterCourseNode & {
  x: number;
  y: number;
  revealed: boolean;
};

type GraphPoint = {
  x: number;
  y: number;
};

export function CourseworkGraph({ nodes }: CourseworkGraphProps) {
  const [growthProgress, setGrowthProgress] = useState(0.62);
  const [displayProgress, setDisplayProgress] = useState(0.62);
  const [motionPhase, setMotionPhase] = useState(0);
  const growthProgressRef = useRef(0.62);
  const displayProgressRef = useRef(0.62);
  const motionPhaseRef = useRef(0);
  const ordered = useMemo(() => [...nodes].sort((a, b) => a.level - b.level || a.track - b.track), [nodes]);
  const rootIds = useMemo(() => ordered.filter((node) => node.dependsOn.length === 0).map((node) => node.id), [ordered]);

  useEffect(() => {
    let frame = 0;
    let lastTime = 0;
    let pauseUntil = 0;

    const animate = (time: number) => {
      if (!lastTime) {
        lastTime = time;
      }
      const delta = time - lastTime;
      lastTime = time;

      const nextMotionPhase = motionPhaseRef.current + delta * 0.0032;
      motionPhaseRef.current = nextMotionPhase;
      setMotionPhase(nextMotionPhase);

      let nextGrowth = growthProgressRef.current;
      let nextDisplay = displayProgressRef.current;

      if (pauseUntil && time >= pauseUntil) {
        pauseUntil = 0;
        nextGrowth = 0.26;
        nextDisplay = 0.26;
      } else if (!pauseUntil) {
        nextGrowth = Math.min(1, growthProgressRef.current + delta * 0.000108);
        nextDisplay = Math.min(0.86, nextGrowth);

        if (nextGrowth >= 1) {
          nextGrowth = 1;
          nextDisplay = 0.86;
          pauseUntil = time + 650;
        }
      }

      if (nextGrowth !== growthProgressRef.current) {
        growthProgressRef.current = nextGrowth;
        setGrowthProgress(nextGrowth);
      }
      if (nextDisplay !== displayProgressRef.current) {
        displayProgressRef.current = nextDisplay;
        setDisplayProgress(nextDisplay);
      }

      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const visibleCount = Math.max(3, Math.round(growthProgress * ordered.length));
  const frame = {
    minX: 14,
    maxX: 86,
    minY: 8,
    maxY: 84,
  };
  const positioned = useMemo(() => {
    const visibleIds = new Set(ordered.slice(0, visibleCount).map((node) => node.id));
    const byId = new Map(ordered.map((node) => [node.id, node]));
    const primaryParent = new Map<string, string>();
    const children = new Map<string, string[]>();

    ordered.forEach((node) => {
      children.set(node.id, []);
    });

    ordered.forEach((node) => {
      const parentId = node.dependsOn[0];
      if (!parentId || !byId.has(parentId)) {
        return;
      }
      primaryParent.set(node.id, parentId);
      children.get(parentId)?.push(node.id);
    });

    const roots = ordered.filter((node) => !primaryParent.has(node.id));
    const depthMemo = new Map<string, number>();
    const leafMemo = new Map<string, number>();

    function getDepth(id: string): number {
      const cached = depthMemo.get(id);
      if (cached !== undefined) return cached;
      const parentId = primaryParent.get(id);
      const depth = parentId ? getDepth(parentId) + 1 : 0;
      depthMemo.set(id, depth);
      return depth;
    }

    function getLeafCount(id: string): number {
      const cached = leafMemo.get(id);
      if (cached !== undefined) return cached;
      const nextChildren = children.get(id) ?? [];
      const count =
        nextChildren.length === 0 ? 1 : nextChildren.reduce((total, childId) => total + getLeafCount(childId), 0);
      leafMemo.set(id, count);
      return count;
    }

    const maxDepth = Math.max(...ordered.map((node) => getDepth(node.id)), 1);
    const rootLeafTotal = roots.reduce((total, root) => total + getLeafCount(root.id), 0);
    const xUnit = (frame.maxX - frame.minX) / rootLeafTotal;
    const baseCoords = new Map<string, { x: number; y: number }>();
    let cursor = frame.minX;

    function assignTree(id: string, startX: number, endX: number): void {
      const depth = getDepth(id);
      const nextChildren = children.get(id) ?? [];
      const width = endX - startX;
      const x = startX + width / 2;
      const yProgress = maxDepth === 0 ? 0 : depth / maxDepth;
      const y = frame.maxY - yProgress * (frame.maxY - frame.minY);
      baseCoords.set(id, { x, y });

      let childCursor = startX;
      nextChildren.forEach((childId) => {
        const childWidth = getLeafCount(childId) * xUnit;
        assignTree(childId, childCursor, childCursor + childWidth);
        childCursor += childWidth;
      });
    }

    roots.forEach((root) => {
      const rootWidth = getLeafCount(root.id) * xUnit;
      assignTree(root.id, cursor, cursor + rootWidth);
      cursor += rootWidth;
    });

    return ordered.map((node) => {
      const phase = (node.level + node.track) * 0.8;
      const base = baseCoords.get(node.id) ?? { x: 50, y: 50 };
      const driftX = Math.sin(motionPhase + phase) * 2.8;
      const driftY = Math.cos(motionPhase * 0.85 + phase) * 1.5;
      return {
        ...node,
        x: clamp(base.x + driftX, frame.minX, frame.maxX),
        y: clamp(base.y + driftY, frame.minY, frame.maxY),
        revealed: visibleIds.has(node.id),
      } satisfies PositionedNode;
    });
  }, [frame.maxX, frame.maxY, frame.minX, frame.minY, motionPhase, ordered, visibleCount]);

  function getEdgePath(from: GraphPoint, to: GraphPoint): string {
    return `M ${from.x} ${from.y} C ${from.x + 3.8} ${from.y - 5.5}, ${to.x - 5.2} ${to.y + 6.5}, ${to.x} ${to.y}`;
  }

  const rootNodes = positioned.filter((node) => rootIds.includes(node.id));
  const sourceNode =
    rootNodes.length > 0
      ? {
          x: rootNodes.reduce((sum, node) => sum + node.x, 0) / rootNodes.length,
          y: Math.min(94, Math.max(...rootNodes.map((node) => node.y)) + 8),
        }
      : null;

  return (
    <div className="coursework-shell">
      <div className="coursework-meta">
        <div>
          <span className="eyebrow">Growth Controller</span>
          <strong>Curriculum progression</strong>
          <small>Replay the build-up of systems, architecture, and core theory over time.</small>
        </div>
        <div className="coursework-progress">
          <span>{Math.round(displayProgress * 100)}%</span>
          <input
            aria-label="Coursework timeline progress"
            className="timeline-slider"
            max={1}
            min={0.2}
            onChange={(event) => {
              const next = Number(event.target.value);
              growthProgressRef.current = next;
              displayProgressRef.current = next;
              setGrowthProgress(next);
              setDisplayProgress(next);
            }}
            step={0.01}
            type="range"
            value={displayProgress}
          />
        </div>
      </div>

      <svg className="coursework-graph" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="edgeGlow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(125,211,252,0.1)" />
            <stop offset="100%" stopColor="rgba(244,114,182,0.9)" />
          </linearGradient>
        </defs>

        <rect className="coursework-frame" height="78" rx="8" width="78" x="11" y="11" />

        {sourceNode
          ? rootNodes.map((node) => (
              <path
                className="coursework-edge-base"
                d={getEdgePath(sourceNode, node)}
                key={`base-source-${node.id}`}
              />
            ))
          : null}

        {positioned.map((node) =>
          node.dependsOn.map((dependency) => {
            const from = positioned.find((candidate) => candidate.id === dependency);
            if (!from) {
              return null;
            }
            return (
              <path
                className="coursework-edge-base"
                d={getEdgePath(from, node)}
                key={`base-${dependency}-${node.id}`}
              />
            );
          }),
        )}

        {positioned.map((node) =>
          node.dependsOn.map((dependency) => {
            const from = positioned.find((candidate) => candidate.id === dependency);
            if (!from || !node.revealed || !from.revealed) {
              return null;
            }
            return (
              <motion.path
                animate={{ pathLength: 1, opacity: 0.85 }}
                className="coursework-edge"
                d={getEdgePath(from, node)}
                initial={{ pathLength: 0, opacity: 0 }}
                key={`active-${dependency}-${node.id}`}
                transition={{ duration: 0.85, ease: "easeOut" }}
              />
            );
          }),
        )}

        {sourceNode
          ? rootNodes.map((node) => (
              <motion.path
                animate={{ pathLength: 1, opacity: 0.85 }}
                className="coursework-edge"
                d={getEdgePath(sourceNode, node)}
                initial={{ pathLength: 0, opacity: 0 }}
                key={`active-source-${node.id}`}
                transition={{ duration: 0.85, ease: "easeOut" }}
              />
            ))
          : null}

        {positioned.map((node) => (
          <motion.g
            animate={{ opacity: node.revealed ? 1 : 0.18, scale: node.revealed ? 1 : 0.9 }}
            className="coursework-node"
            initial={false}
            key={node.id}
            style={{ transformOrigin: `${node.x}% ${node.y}%` }}
            transition={{ duration: 0.45 }}
          >
            <circle cx={node.x} cy={node.y} r={4.8} />
            <text dy="0.35em" textAnchor="middle" x={node.x} y={node.y}>
              {node.label.replace(" ", "\n")}
            </text>
          </motion.g>
        ))}

        {sourceNode ? (
          <motion.g
            animate={{ opacity: 1, scale: [1, 1.08, 1] }}
            className="coursework-source"
            initial={{ opacity: 0.88, scale: 1 }}
            transition={{ duration: 2.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
          >
            <circle className="coursework-source-glow" cx={sourceNode.x} cy={sourceNode.y} r={2.8} />
            <circle className="coursework-source-core" cx={sourceNode.x} cy={sourceNode.y} r={1.35} />
          </motion.g>
        ) : null}
      </svg>

    </div>
  );
}

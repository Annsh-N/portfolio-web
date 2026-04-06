import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { SkillState } from "@shared/types";

type SkillFieldProps = {
  state: SkillState;
  onGrow: (id: string) => void;
};

export function SkillField({ state, onGrow }: SkillFieldProps) {
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const laidOut = useMemo(
    () =>
      state.bubbles.map((bubble, index) => {
        const col = index % 5;
        const row = Math.floor(index / 5);
        return {
          ...bubble,
          x: 13 + col * 19 + (row % 2) * 4,
          y: 18 + row * 22 + (col % 2) * 3,
        };
      }),
    [state.bubbles],
  );

  return (
    <div
      className="skill-field"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      {laidOut.map((bubble, index) => {
        const dx = pointer.x - bubble.x;
        const dy = pointer.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / 34);
        const scale = bubble.size + influence * 0.12;
        const translateX = -dx * influence * 0.08 + Math.sin(index * 9.4 + distance) * 2;
        const translateY = -dy * influence * 0.08 + Math.cos(index * 7.8 + distance) * 2;

        return (
          <motion.button
            animate={{
              x: `${bubble.x}%`,
              y: `${bubble.y}%`,
              scale,
              translateX,
              translateY,
            }}
            className="skill-bubble"
            key={bubble.id}
            onClick={() => onGrow(bubble.id)}
            style={
              {
                "--bubble-hue": bubble.hue,
              } as CSSProperties
            }
            transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.9 }}
            type="button"
          >
            <span>{bubble.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

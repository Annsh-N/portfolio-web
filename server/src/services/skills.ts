import { EventEmitter } from "node:events";
import { writeStore } from "../store.js";
import type { SkillState } from "../../../shared/types.js";

const MAX_RATIO = 1.85;
export const skillsEvents = new EventEmitter();

export async function growSkill(id: string): Promise<SkillState> {
  const nextStore = await writeStore((current) => {
    const smallest = Math.min(...current.skills.bubbles.map((bubble) => bubble.size));
    const threshold = smallest * MAX_RATIO;
    const bubbles = current.skills.bubbles.map((bubble) => {
      if (bubble.id !== id) {
        return bubble;
      }
      const growthStep = Math.max(0.02, bubble.baseSize * 0.035);
      return {
        ...bubble,
        size: Math.min(threshold, Number((bubble.size + growthStep).toFixed(3))),
      };
    });

    return {
      ...current,
      skills: {
        bubbles,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  skillsEvents.emit("update", nextStore.skills);
  return nextStore.skills;
}

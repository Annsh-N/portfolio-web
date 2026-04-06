import { Code2, Dumbbell, GraduationCap, MoonStar } from "lucide-react";
import type { PresenceSnapshot, PresenceStatus } from "@shared/types";

type HeroPresenceCardProps = {
  presence: PresenceSnapshot;
};

const statusMeta: Record<
  PresenceStatus,
  {
    icon: typeof MoonStar;
    kicker: string;
  }
> = {
  sleeping: {
    icon: MoonStar,
    kicker: "Desk status",
  },
  in_class: {
    icon: GraduationCap,
    kicker: "Current mode",
  },
  coding_away: {
    icon: Code2,
    kicker: "Current mode",
  },
  gym: {
    icon: Dumbbell,
    kicker: "Current mode",
  },
};

function PresenceAvatar() {
  return (
    <div className="presence-avatar">
      <span className="presence-head" />
      <span className="presence-torso" />
      <span className="presence-arm is-left" />
      <span className="presence-arm is-right" />
      <span className="presence-leg is-left" />
      <span className="presence-leg is-right" />
    </div>
  );
}

function PresenceScene({ status }: { status: PresenceStatus }) {
  if (status === "sleeping") {
    return (
      <div className="presence-scene is-sleeping" aria-hidden="true">
        <div className="presence-bed-frame" />
        <div className="presence-pillow" />
        <div className="presence-blanket" />
        <PresenceAvatar />
        <div className="presence-zzz">
          <span>Z</span>
          <span>Z</span>
          <span>Z</span>
        </div>
      </div>
    );
  }

  if (status === "in_class") {
    return (
      <div className="presence-scene is-in-class" aria-hidden="true">
        <div className="presence-desk">
          <span className="presence-desk-surface" />
          <span className="presence-desk-leg" />
        </div>
        <div className="presence-notebook" />
        <div className="presence-board-line is-one" />
        <div className="presence-board-line is-two" />
        <PresenceAvatar />
      </div>
    );
  }

  if (status === "gym") {
    return (
      <div className="presence-scene is-gym" aria-hidden="true">
        <div className="presence-barbell">
          <span className="presence-plate is-left" />
          <span className="presence-bar" />
          <span className="presence-plate is-right" />
        </div>
        <PresenceAvatar />
      </div>
    );
  }

  return (
    <div className="presence-scene is-coding" aria-hidden="true">
      <div className="presence-desk">
        <span className="presence-desk-surface" />
        <span className="presence-desk-leg" />
      </div>
      <div className="presence-laptop">
        <span className="presence-screen-line is-one" />
        <span className="presence-screen-line is-two" />
        <span className="presence-screen-line is-three" />
      </div>
      <PresenceAvatar />
    </div>
  );
}

export function HeroPresenceCard({ presence }: HeroPresenceCardProps) {
  const meta = statusMeta[presence.status];
  const Icon = meta.icon;

  return (
    <article className={`hero-presence-card is-${presence.status}`}>
      <PresenceScene status={presence.status} />
      <div className="hero-presence-copy">
        <div className="hero-presence-topline">
          <span className="eyebrow">
            <Icon size={14} />
            {meta.kicker}
          </span>
          <small>{presence.currentTimeLabel}</small>
        </div>
        <h3>{presence.label}</h3>
        <p>{presence.note}</p>
        <div className="hero-presence-meta">
          <span>{presence.nextChangeLabel}</span>
        </div>
      </div>
    </article>
  );
}

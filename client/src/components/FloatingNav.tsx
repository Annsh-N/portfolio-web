import type { CSSProperties } from "react";
import { NavLink } from "react-router-dom";
import type { MusicSnapshot } from "@shared/types";
import { MusicMiniPlayer } from "./MusicMiniPlayer";

type FloatingNavProps = {
  music: MusicSnapshot;
  onRecommendTrack: (trackId: string, note: string) => Promise<void>;
  shrinkProgress: number;
};

const links = [
  { to: "/", label: "Overview" },
  { to: "/create", label: "Create" },
  { to: "/resume", label: "Resume" },
  { to: "/projects", label: "Projects" },
];

export function FloatingNav({ shrinkProgress, ...props }: FloatingNavProps) {
  const maxWidth = 1320 - 660 * shrinkProgress;
  const horizontalInset = 2 + 2.8 * shrinkProgress;
  const condensed = shrinkProgress >= 0.72;
  const style = {
    width: `min(${maxWidth}px, calc(100% - ${horizontalInset}rem))`,
    "--nav-player-min-width": `${285 - 125 * shrinkProgress}px`,
    "--nav-player-gap": `${0.85 - 0.25 * shrinkProgress}rem`,
    "--nav-player-padding-x": `${0.75 - 0.18 * shrinkProgress}rem`,
    "--nav-gap": `${0.8 - 0.2 * shrinkProgress}rem`,
    "--nav-padding-y": `${0.65 - 0.1 * shrinkProgress}rem`,
    "--nav-padding-x": `${0.8 - 0.12 * shrinkProgress}rem`,
    "--nav-link-padding-y": `${0.55 - 0.1 * shrinkProgress}rem`,
    "--nav-link-padding-x": `${0.8 - 0.18 * shrinkProgress}rem`,
    "--nav-link-font-size": `${0.92 - 0.06 * shrinkProgress}rem`,
    "--nav-mark-label-padding-left": `${1.35 - 1.35 * shrinkProgress}rem`,
    "--nav-mark-label-padding-bottom": `${0.34 * shrinkProgress}rem`,
    "--nav-mark-width": `${0.75 + 4.4 * shrinkProgress}rem`,
    "--nav-mark-height": `${0.75 - 0.59 * shrinkProgress}rem`,
    "--nav-mark-top": `${50 + 50 * shrinkProgress}%`,
    "--nav-mark-translate-y": `${-50 + 50 * shrinkProgress}%`,
  } as CSSProperties;

  return (
    <header className={`floating-nav ${condensed ? "is-condensed" : ""}`} style={style}>
      <div className="nav-mark">
        <div className="nav-mark-label">
          <span className="nav-mark-orb" />
          <strong>Annsh Navle</strong>
        </div>
      </div>

      <nav className="nav-links" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
            key={link.to}
            to={link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <MusicMiniPlayer condensed={condensed} {...props} />
    </header>
  );
}

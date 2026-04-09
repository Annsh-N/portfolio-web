import { Link } from "react-router-dom";

export function GameSiteLink() {
  return (
    <Link aria-label="Back to Annsh Navle portfolio" className="game-site-link" to="/">
      <span className="game-site-link-orb" aria-hidden="true" />
      <span>Annsh Navle</span>
    </Link>
  );
}

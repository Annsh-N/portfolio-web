import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="notebook-page empty-page">
      <p className="kicker">404 / page not found</p>
      <h1>There is nothing at this address.</h1>
      <Link className="text-link" to="/">
        return home →
      </Link>
    </div>
  );
}

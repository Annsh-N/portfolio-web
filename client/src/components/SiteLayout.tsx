import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { profile } from "@/content/siteContent";

const navigation = [
  { to: "/", label: "home", end: true },
  { to: "/projects", label: "projects" },
  { to: "/writing", label: "articles" },
  { to: "/fun", label: "fun" },
];

type Theme = "light" | "dark";

const themeStorageKey = "portfolio-theme-v1";

function getInitialTheme(): Theme {
  const saved = window.localStorage.getItem(themeStorageKey);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function SiteLayout() {
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#161814" : "#f3f0e8");
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink className="wordmark" to="/">
          <span className="wordmark-prompt" aria-hidden="true">
            ~/ 
          </span>
          {profile.name.toLowerCase().replace(" ", "_")}
        </NavLink>

        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) => `site-nav-link ${isActive ? "is-active" : ""}`}
              end={item.end}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-pressed={theme === "dark"}
          className={`theme-toggle ${theme === "dark" ? "is-dark" : ""}`}
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          type="button"
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-knob" />
          </span>
          <span className="theme-toggle-label">{theme}</span>
        </button>
      </header>

      <main className="site-main" key={location.pathname}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Built by hand. Served from my own VPS.</p>
        <div>
          <a href={profile.github} rel="noreferrer" target="_blank">
            GitHub
          </a>
          <a href={profile.linkedin} rel="noreferrer" target="_blank">
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </div>
      </footer>
    </div>
  );
}

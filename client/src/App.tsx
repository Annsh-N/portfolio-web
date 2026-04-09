import { AnimatePresence } from "framer-motion";
import { startTransition, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { FloatingNav } from "@/components/FloatingNav";
import { fetchBootstrap, fetchMusic, fetchPresence, fetchSkillState, growSkill, recommendMusic } from "@/lib/api";
import { CreatePage } from "@/pages/CreatePage";
import { CreateConnectionsPage } from "@/pages/CreateConnectionsPage";
import { CreateWordlePage } from "@/pages/CreateWordlePage";
import { HomePage } from "@/pages/HomePage";
import { MessageMePage } from "@/pages/MessageMePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ResumePage } from "@/pages/ResumePage";
import { WordlePage } from "@/pages/WordlePage";
import { ConnectionsPage } from "@/pages/ConnectionsPage";
import { courseworkTimeline, initialSkills, musicCatalog } from "@shared/content";
import type {
  BootstrapPayload,
  EducationSnapshot,
  GitHubSnapshot,
  MusicSnapshot,
  PresenceSnapshot,
  SkillState,
} from "@shared/types";

const fallbackEducation: EducationSnapshot = {
  school: "Purdue University",
  timezone: "America/Indiana/Indianapolis",
  cityLabel: "West Lafayette, IN",
  weather: {
    temperatureF: 61,
    condition: "Calm cloud cover",
    fetchedAt: new Date().toISOString(),
  },
  aqi: {
    value: 46,
    category: "Good",
    fetchedAt: new Date().toISOString(),
  },
  localTimeIso: new Date().toISOString(),
};

const fallbackGithub: GitHubSnapshot = {
  username: "Annsh-N",
  days: Array.from({ length: 28 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (27 - index));
    return {
      date: day.toISOString().slice(0, 10),
      count: 0,
    };
  }),
  recentContributions: 0,
  yearContributions: 126,
  lastRepo: {
    fullName: "Annsh-N/Anchor",
    htmlUrl: "https://github.com/Annsh-N/Anchor",
    description: null,
    language: "TypeScript",
    stars: 0,
    pushedAt: new Date().toISOString(),
  },
  featuredRepo: {
    fullName: "google/gemma.cpp",
    htmlUrl: "https://github.com/google/gemma.cpp",
    description: "Lightweight standalone C++ inference engine for Gemma models.",
    language: "C++",
    stars: 6800,
    pushedAt: new Date().toISOString(),
  },
  fetchedAt: new Date().toISOString(),
};

const fallbackPresence: PresenceSnapshot = {
  status: "coding_away",
  label: "Coding away",
  note: "At the desk building, debugging, or polishing some backend-heavy system.",
  currentTimeLabel: "Now",
  nextChangeLabel: "Backend schedule warming up",
  timezone: "America/Indiana/Indianapolis",
  updatedAt: new Date().toISOString(),
};

const fallbackMusic: MusicSnapshot = {
  lastPlayed: {
    ...musicCatalog[0],
    playedAt: new Date().toISOString(),
  },
  recentTracks: musicCatalog.slice(0, 5).map((track, index) => ({
    ...track,
    playedAt: new Date(Date.now() - index * 1000 * 60 * 4).toISOString(),
  })),
  recommendations: [],
  updatedAt: new Date().toISOString(),
};

function App() {
  const location = useLocation();
  const isImmersivePuzzleRoute =
    location.pathname.startsWith("/play/") ||
    location.pathname === "/create/wordle" ||
    location.pathname === "/create/connections";
  const [education, setEducation] = useState<EducationSnapshot>(fallbackEducation);
  const [github, setGithub] = useState<GitHubSnapshot>(fallbackGithub);
  const [presence, setPresence] = useState<PresenceSnapshot>(fallbackPresence);
  const [music, setMusic] = useState<MusicSnapshot>(fallbackMusic);
  const [skills, setSkills] = useState<SkillState>({
    bubbles: initialSkills,
    updatedAt: new Date().toISOString(),
  });
  const [navShrinkProgress, setNavShrinkProgress] = useState(0);
  const coursework = useMemo(() => courseworkTimeline, []);

  useEffect(() => {
    fetchBootstrap()
      .then((payload: BootstrapPayload) => {
        startTransition(() => {
          setEducation(payload.education);
          setGithub(payload.github);
          setPresence(payload.presence);
          setMusic(payload.music);
          setSkills(payload.skills);
        });
      })
      .catch(() => {
        Promise.allSettled([fetchSkillState(), fetchMusic()]).then((results) => {
          const [skillsResult, musicResult] = results;
          if (skillsResult.status === "fulfilled") {
            setSkills(skillsResult.value);
          }
          if (musicResult.status === "fulfilled") {
            setMusic(musicResult.value);
          }
        });
      });
  }, []);

  useEffect(() => {
    const refreshPresence = () => {
      fetchPresence()
        .then((payload) => {
          startTransition(() => setPresence(payload.current));
        })
        .catch(() => undefined);
    };

    refreshPresence();
    const interval = window.setInterval(refreshPresence, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const refreshMusic = () => {
      fetchMusic()
        .then((payload) => {
          startTransition(() => setMusic(payload));
        })
        .catch(() => undefined);
    };

    refreshMusic();
    const interval = window.setInterval(refreshMusic, 20_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const source = new EventSource("/stream/skills");
    const handler = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as SkillState;
      startTransition(() => setSkills(payload));
    };

    source.addEventListener("skills", handler as EventListener);
    return () => {
      source.removeEventListener("skills", handler as EventListener);
      source.close();
    };
  }, []);

  useEffect(() => {
    function updateSpotlight(event: PointerEvent) {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    }
    window.addEventListener("pointermove", updateSpotlight);
    return () => window.removeEventListener("pointermove", updateSpotlight);
  }, []);

  useEffect(() => {
    let frame = 0;

    function updateNavWidth() {
      const threshold = Math.max(window.innerHeight * 0.1, 1);
      const next = Math.min(window.scrollY / threshold, 1);
      setNavShrinkProgress(next);
      frame = 0;
    }

    function onScrollOrResize() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateNavWidth);
    }

    updateNavWidth();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  function handleGrowSkill(id: string) {
    growSkill(id).catch(() => undefined);
  }

  async function handleRecommendTrack(trackId: string, note: string) {
    const next = await recommendMusic({ trackId, note });
    startTransition(() => setMusic(next));
  }

  return (
    <div className={`app-shell ${isImmersivePuzzleRoute ? "is-game-route" : ""}`}>
      <div className="app-backdrop" />
      {!isImmersivePuzzleRoute ? (
        <FloatingNav
          music={music}
          onRecommendTrack={handleRecommendTrack}
          shrinkProgress={navShrinkProgress}
        />
      ) : null}

      <main className="app-main">
        <AnimatePresence mode="wait">
          <Routes key={location.pathname} location={location}>
            <Route
              element={
                <HomePage
                  coursework={coursework}
                  education={education}
                  github={github}
                  onGrowSkill={handleGrowSkill}
                  presence={presence}
                  skills={skills}
                />
              }
              path="/"
            />
            <Route element={<CreatePage />} path="/create" />
            <Route element={<CreateWordlePage />} path="/create/wordle" />
            <Route element={<CreateConnectionsPage />} path="/create/connections" />
            <Route element={<MessageMePage />} path="/message-me" />
            <Route element={<ResumePage />} path="/resume" />
            <Route element={<ProjectsPage />} path="/projects" />
            <Route element={<WordlePage />} path="/play/wordle/:id" />
            <Route element={<ConnectionsPage />} path="/play/connections/:id" />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;

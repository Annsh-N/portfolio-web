import { AnimatePresence } from "framer-motion";
import { startTransition, useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { FloatingNav } from "@/components/FloatingNav";
import { fetchBootstrap, fetchSkillState, growSkill } from "@/lib/api";
import { CreatePage } from "@/pages/CreatePage";
import { HomePage } from "@/pages/HomePage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ResumePage } from "@/pages/ResumePage";
import { WordlePage } from "@/pages/WordlePage";
import { ConnectionsPage } from "@/pages/ConnectionsPage";
import { courseworkTimeline, initialSkills, mockTracks } from "@shared/content";
import type { BootstrapPayload, EducationSnapshot, GitHubSnapshot, MusicTrack, SkillState } from "@shared/types";

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

function App() {
  const location = useLocation();
  const [education, setEducation] = useState<EducationSnapshot>(fallbackEducation);
  const [github, setGithub] = useState<GitHubSnapshot>(fallbackGithub);
  const [skills, setSkills] = useState<SkillState>({
    bubbles: initialSkills,
    updatedAt: new Date().toISOString(),
  });
  const [queue] = useState<MusicTrack[]>(mockTracks);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(mockTracks[0]);
  const [navShrinkProgress, setNavShrinkProgress] = useState(0);
  const coursework = useMemo(() => courseworkTimeline, []);

  useEffect(() => {
    fetchBootstrap()
      .then((payload: BootstrapPayload) => {
        startTransition(() => {
          setEducation(payload.education);
          setGithub(payload.github);
          setSkills(payload.skills);
          const matched = mockTracks.find((track) => track.id === payload.currentTrack.id) ?? payload.currentTrack;
          setCurrentTrack(matched);
        });
      })
      .catch(() => {
        fetchSkillState()
          .then((payload) => setSkills(payload))
          .catch(() => undefined);
      });
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
    const interval = window.setInterval(() => {
      setCurrentTrack((track) => {
        if (!track.isPlaying) return track;
        const nextProgress = track.progressMs + 1000;
        if (nextProgress < track.durationMs) {
          return { ...track, progressMs: nextProgress };
        }
        const currentIndex = queue.findIndex((item) => item.id === track.id);
        const nextTrack = queue[(currentIndex + 1) % queue.length];
        return { ...nextTrack, progressMs: 0, isPlaying: true };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [queue]);

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

  function handleQueueTrack(id: string) {
    const track = queue.find((entry) => entry.id === id);
    if (!track) return;
    setCurrentTrack({
      ...track,
      progressMs: 0,
      isPlaying: true,
    });
  }

  function handleTogglePlayback() {
    setCurrentTrack((track) => ({
      ...track,
      isPlaying: !track.isPlaying,
    }));
  }

  function handleGrowSkill(id: string) {
    growSkill(id).catch(() => undefined);
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <FloatingNav
        currentTrack={currentTrack}
        onQueueTrack={handleQueueTrack}
        onTogglePlayback={handleTogglePlayback}
        queue={queue}
        shrinkProgress={navShrinkProgress}
      />

      <main className="app-main">
        <AnimatePresence mode="wait">
          <Routes key={location.pathname} location={location}>
            <Route
              element={<HomePage coursework={coursework} education={education} github={github} onGrowSkill={handleGrowSkill} skills={skills} />}
              path="/"
            />
            <Route element={<CreatePage />} path="/create" />
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

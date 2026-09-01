import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/SiteLayout";
import { ConnectionsPage } from "@/pages/ConnectionsPage";
import { CreateConnectionsPage } from "@/pages/CreateConnectionsPage";
import { CreatePage } from "@/pages/CreatePage";
import { CreateWordlePage } from "@/pages/CreateWordlePage";
import { ExperiencePage } from "@/pages/ExperiencePage";
import { HomePage } from "@/pages/HomePage";
import { KalshiDashboardPage } from "@/pages/KalshiDashboardPage";
import { NotePage } from "@/pages/NotePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { WordlePage } from "@/pages/WordlePage";
import { WritingPage } from "@/pages/WritingPage";

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<HomePage />} index />
        <Route element={<ProjectsPage />} path="projects" />
        <Route element={<ProjectPage />} path="projects/:slug" />
        <Route element={<WritingPage />} path="writing" />
        <Route element={<NotePage />} path="writing/:slug" />
        <Route element={<CreatePage />} path="play" />
        <Route element={<ExperiencePage />} path="experience" />
        <Route element={<KalshiDashboardPage />} path="lab/kalshi" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>

      <Route element={<Navigate replace to="/play" />} path="create" />
      <Route element={<Navigate replace to="/" />} path="resume" />
      <Route element={<Navigate replace to="/" />} path="message-me" />
      <Route element={<CreateWordlePage />} path="create/wordle" />
      <Route element={<CreateConnectionsPage />} path="create/connections" />
      <Route element={<WordlePage />} path="play/wordle/:id" />
      <Route element={<ConnectionsPage />} path="play/connections/:id" />
    </Routes>
  );
}

export default App;

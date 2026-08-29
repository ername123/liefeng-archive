import { Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import IntroPage from "@/pages/IntroPage";
import Home from "@/pages/Home";
import SubjectPage from "@/pages/SubjectPage";
import SearchPage from "@/pages/SearchPage";
import ResourcesPage from "@/pages/ResourcesPage";
import QuizPage from "@/pages/QuizPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ProfilePage from "@/pages/ProfilePage";
import ExperiencesPage from "@/pages/ExperiencesPage";
import ExperienceDetailPage from "@/pages/ExperienceDetailPage";
import ExperienceNewPage from "@/pages/ExperienceNewPage";
import AdminPage from "@/pages/AdminPage";
import { Toaster } from "@/components/ui/sonner";

function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-5xl font-bold text-muted-foreground/30">404</p>
      <p className="mt-3 text-muted-foreground">页面不存在</p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/experiences" element={<ExperiencesPage />} />
          <Route path="/experiences/new" element={<ExperienceNewPage />} />
          <Route path="/experiences/:id" element={<ExperienceDetailPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/subject/:slug" element={<SubjectPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

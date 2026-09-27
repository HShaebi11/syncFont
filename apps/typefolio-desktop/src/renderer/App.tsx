import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/shell/app-shell";
import { SignInGate } from "@/sign-in-gate";
import { SessionProvider } from "@/session-provider";
import { ThemeProvider } from "@/theme-provider";

import ActivityPage from "@/pages/activity/page";
import CollectionDetailPage from "@/pages/collections/[slug]/page";
import CollectionsPage from "@/pages/collections/page";
import ComparePage from "@/pages/compare/page";
import DevicesPage from "@/pages/devices/page";
import FavoritesPage from "@/pages/favorites/page";
import FamilyDetailPage from "@/pages/fonts/[familySlug]/page";
import FontsPage from "@/pages/fonts/page";
import HomePage from "@/pages/page";
import InspirationDetailPage from "@/pages/inspiration/[slug]/page";
import InspirationPage from "@/pages/inspiration/page";
import RecentPage from "@/pages/recent/page";
import SearchPage from "@/pages/search/page";
import SettingsPage from "@/pages/settings/page";
import SharedPage from "@/pages/shared/page";

function WorkspaceRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/fonts" element={<FontsPage />} />
        <Route path="/fonts/:familySlug" element={<FamilyDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:slug" element={<CollectionDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/inspiration" element={<InspirationPage />} />
        <Route path="/inspiration/:slug" element={<InspirationDetailPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/shared" element={<SharedPage />} />
        <Route path="/recent" element={<RecentPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <BrowserRouter>
          <SignInGate>
            <WorkspaceRoutes />
          </SignInGate>
        </BrowserRouter>
      </SessionProvider>
    </ThemeProvider>
  );
}

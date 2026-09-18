import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LocationProvider } from "./lib/location";
import { ThemeProvider } from "./lib/theme";
import { AppShell } from "./components/layout/AppShell";
import { MapHomePage } from "./pages/MapHomePage";
import { ReportsPage } from "./pages/ReportsPage";
import { MyReportsPage } from "./pages/MyReportsPage";
import { HazardDetailPage } from "./pages/HazardDetailPage";
import { ReportFlowPage } from "./pages/ReportFlowPage";

export default function App() {
  return (
    <ThemeProvider>
    <LocationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/report" element={<ReportFlowPage />} />
          <Route
            path="/"
            element={
              <AppShell>
                <MapHomePage />
              </AppShell>
            }
          />
          <Route
            path="/reports"
            element={
              <AppShell>
                <ReportsPage />
              </AppShell>
            }
          />
          <Route
            path="/me"
            element={
              <AppShell>
                <MyReportsPage />
              </AppShell>
            }
          />
          <Route
            path="/hazards/:id"
            element={
              <AppShell>
                <HazardDetailPage />
              </AppShell>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LocationProvider>
    </ThemeProvider>
  );
}

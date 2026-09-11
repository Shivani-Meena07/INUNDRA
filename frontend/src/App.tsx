import { AppProvider, useApp } from "./state/AppContext";
import GlobalHeader from "./components/layout/GlobalHeader";
import LiveMapScreen from "./screens/LiveMapScreen";
import ForecastScreen from "./screens/ForecastScreen";
import RiskAnalysisScreen from "./screens/RiskAnalysisScreen";
import DrainageScreen from "./screens/DrainageScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SafeRouteScreen from "./screens/SafeRouteScreen";

function AppContent() {
  const { state } = useApp();
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <GlobalHeader />
      <main className="flex-1">
        {state.activeTab === "map" && <LiveMapScreen />}
        {state.activeTab === "forecast" && <ForecastScreen />}
        {state.activeTab === "risk" && <RiskAnalysisScreen />}
        {state.activeTab === "drainage" && <DrainageScreen />}
        {state.activeTab === "reports" && <ReportsScreen />}
        {state.activeTab === "route" && <SafeRouteScreen />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

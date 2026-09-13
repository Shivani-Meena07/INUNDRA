import {
  AppProvider,
  useApp,
} from "./state/AppContext";

import AuthScreen from "./screens/AuthScreen";
import LoginScreen from "./screens/LoginScreen";
import AuthorityDashboard from "./screens/authorities/AuthorityDashboard";

import GlobalHeader from "./components/layout/GlobalHeader";

import LiveMapScreen from "./screens/citizens/LiveMapScreen";
import ForecastScreen from "./screens/citizens/ForecastScreen";
import RiskAnalysisScreen from "./screens/citizens/RiskAnalysisScreen";
import DrainageScreen from "./screens/citizens/DrainageScreen";
import ReportsScreen from "./screens/citizens/ReportsScreen";
import SafeRouteScreen from "./screens/citizens/SafeRouteScreen";

/* =====================================================
   CITIZEN APPLICATION
   ===================================================== */

function CitizenApp() {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">

      <GlobalHeader />

      <main className="flex-1">

        {state.activeTab === "map" && (
          <LiveMapScreen />
        )}

        {state.activeTab === "forecast" && (
          <ForecastScreen />
        )}

        {state.activeTab === "risk" && (
          <RiskAnalysisScreen />
        )}

        {state.activeTab === "drainage" && (
          <DrainageScreen />
        )}

        {state.activeTab === "reports" && (
          <ReportsScreen />
        )}

        {state.activeTab === "route" && (
          <SafeRouteScreen />
        )}

      </main>

    </div>
  );
}

/* =====================================================
   AUTHORITY APPLICATION
   ===================================================== */

function AuthorityApp() {
  return <AuthorityDashboard />;
}

/* =====================================================
   APPLICATION ROUTER
   ===================================================== */

function AppContent() {
  const {
    state,
    dispatch,
  } = useApp();

  /* ===================================================
     NOT AUTHENTICATED
     =================================================== */

  if (!state.isAuthenticated) {

    /* -----------------------------------------------
       ROLE SELECTION
       ----------------------------------------------- */

    if (
      state.authView === "role-selection"
    ) {
      return (
        <AuthScreen
          onSelectRole={(role) =>
            dispatch({
              type: "SELECT_ROLE",
              role,
            })
          }
        />
      );
    }

    /* -----------------------------------------------
       LOGIN
       ----------------------------------------------- */

    if (
      state.authView === "login" &&
      state.userRole
    ) {
      return (
        <LoginScreen
          role={state.userRole}
          onBack={() =>
            dispatch({
              type: "AUTH_BACK",
            })
          }
          onLogin={() =>
            dispatch({
              type: "AUTH_LOGIN",
            })
          }
        />
      );
    }
  }

  /* ===================================================
     AUTHENTICATED APPLICATIONS
     =================================================== */

  if (
    state.userRole === "authority"
  ) {
    return <AuthorityApp />;
  }

  return <CitizenApp />;
}

/* =====================================================
   ROOT APPLICATION
   ===================================================== */

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
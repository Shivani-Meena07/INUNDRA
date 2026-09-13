import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { cityData, initialNotifications, Incident } from "../data/mockData";

export type CityKey = "delhi" | "mumbai" | "chennai";

export type TabKey =
  | "map"
  | "forecast"
  | "risk"
  | "drainage"
  | "reports"
  | "route";

export type UserRole = "citizen" | "authority";

export type AuthView = "role-selection" | "login";

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  city: string;
}

interface AppState {
  /* ---------------- AUTHENTICATION ---------------- */

  isAuthenticated: boolean;
  userRole: UserRole | null;
  authView: AuthView;

  /* ---------------- CITIZEN APP STATE ---------------- */

  city: CityKey;
  activeTab: TabKey;
  timeStep: number;

  activeLayers: Set<string>;

  selectedHotspot: string | null;
  selectedDrainageNode: string | null;
  selectedRoute: string | null;

  incidents: Incident[];
  notifications: Notification[];

  reportModalOpen: boolean;
  notifOpen: boolean;
  profileOpen: boolean;
  mobileMenuOpen: boolean;

  incidentFilter: string;
}

type Action =
  /* ---------------- AUTH ACTIONS ---------------- */

  | {
      type: "SELECT_ROLE";
      role: UserRole;
    }
  | {
      type: "AUTH_LOGIN";
    }
  | {
      type: "AUTH_LOGOUT";
    }
  | {
      type: "AUTH_BACK";
    }

  /* ---------------- CITIZEN ACTIONS ---------------- */

  | {
      type: "SET_CITY";
      city: CityKey;
    }
  | {
      type: "SET_TAB";
      tab: TabKey;
    }
  | {
      type: "SET_TIME_STEP";
      step: number;
    }
  | {
      type: "TOGGLE_LAYER";
      layer: string;
    }
  | {
      type: "SELECT_HOTSPOT";
      id: string | null;
    }
  | {
      type: "SELECT_DRAINAGE_NODE";
      id: string | null;
    }
  | {
      type: "SELECT_ROUTE";
      id: string | null;
    }
  | {
      type: "ADD_INCIDENT";
      incident: Incident;
    }
  | {
      type: "MARK_NOTIF_READ";
      id: string;
    }
  | {
      type: "MARK_ALL_READ";
    }
  | {
      type: "TOGGLE_NOTIF";
    }
  | {
      type: "TOGGLE_PROFILE";
    }
  | {
      type: "TOGGLE_MOBILE_MENU";
    }
  | {
      type: "OPEN_REPORT_MODAL";
    }
  | {
      type: "CLOSE_REPORT_MODAL";
    }
  | {
      type: "SET_INCIDENT_FILTER";
      filter: string;
    };

const defaultLayers = new Set([
  "floodRisk",
  "rainfall",
  "drainage",
]);

function reducer(
  state: AppState,
  action: Action
): AppState {
  switch (action.type) {

    /* ==================================================
       AUTHENTICATION
       ================================================== */

    case "SELECT_ROLE":
      return {
        ...state,
        userRole: action.role,
        authView: "login",
      };

    case "AUTH_LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        authView: "role-selection",
      };

    case "AUTH_LOGOUT":
      return {
        ...state,

        isAuthenticated: false,
        userRole: null,
        authView: "role-selection",

        activeTab: "map",
        timeStep: 0,

        selectedHotspot: null,
        selectedDrainageNode: null,
        selectedRoute: null,

        reportModalOpen: false,
        notifOpen: false,
        profileOpen: false,
        mobileMenuOpen: false,
      };

    case "AUTH_BACK":
      return {
        ...state,
        userRole: null,
        authView: "role-selection",
      };

    /* ==================================================
       CITY
       ================================================== */

    case "SET_CITY":
      return {
        ...state,

        city: action.city,

        selectedHotspot: null,
        selectedDrainageNode: null,
        selectedRoute: null,

        timeStep: 0,

        incidents: cityData[action.city].incidents,

        notifOpen: false,
        profileOpen: false,
        mobileMenuOpen: false,
      };

    /* ==================================================
       NAVIGATION
       ================================================== */

    case "SET_TAB":
      return {
        ...state,
        activeTab: action.tab,
        notifOpen: false,
        profileOpen: false,
        mobileMenuOpen: false,
      };

    /* ==================================================
       FORECAST TIMELINE
       ================================================== */

    case "SET_TIME_STEP":
      return {
        ...state,
        timeStep: action.step,
      };

    /* ==================================================
       MAP LAYERS
       ================================================== */

    case "TOGGLE_LAYER": {
      const next = new Set(state.activeLayers);

      if (next.has(action.layer)) {
        next.delete(action.layer);
      } else {
        next.add(action.layer);
      }

      return {
        ...state,
        activeLayers: next,
      };
    }

    /* ==================================================
       MAP SELECTIONS
       ================================================== */

    case "SELECT_HOTSPOT":
      return {
        ...state,
        selectedHotspot: action.id,
      };

    case "SELECT_DRAINAGE_NODE":
      return {
        ...state,
        selectedDrainageNode: action.id,
      };

    case "SELECT_ROUTE":
      return {
        ...state,
        selectedRoute: action.id,
      };

    /* ==================================================
       INCIDENTS / REPORTS
       ================================================== */

    case "ADD_INCIDENT":
      return {
        ...state,
        incidents: [
          action.incident,
          ...state.incidents,
        ],
        reportModalOpen: false,
      };

    case "SET_INCIDENT_FILTER":
      return {
        ...state,
        incidentFilter: action.filter,
      };

    /* ==================================================
       NOTIFICATIONS
       ================================================== */

    case "MARK_NOTIF_READ":
      return {
        ...state,

        notifications:
          state.notifications.map((notification) =>
            notification.id === action.id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
          ),
      };

    case "MARK_ALL_READ":
      return {
        ...state,

        notifications:
          state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
      };

    case "TOGGLE_NOTIF":
      return {
        ...state,
        notifOpen: !state.notifOpen,
        profileOpen: false,
      };

    case "TOGGLE_PROFILE":
      return {
        ...state,
        profileOpen: !state.profileOpen,
        notifOpen: false,
      };

    case "TOGGLE_MOBILE_MENU":
      return {
        ...state,

        mobileMenuOpen:
          !state.mobileMenuOpen,

        notifOpen: false,
        profileOpen: false,
      };

    /* ==================================================
       REPORT MODAL
       ================================================== */

    case "OPEN_REPORT_MODAL":
      return {
        ...state,
        reportModalOpen: true,
      };

    case "CLOSE_REPORT_MODAL":
      return {
        ...state,
        reportModalOpen: false,
      };

    default:
      return state;
  }
}

const initialState: AppState = {
  /* ---------------- AUTH ---------------- */

  isAuthenticated: false,

  userRole: null,

  authView: "role-selection",

  /* ---------------- CITIZEN APP ---------------- */

  city: "delhi",

  activeTab: "map",

  timeStep: 0,

  activeLayers: defaultLayers,

  selectedHotspot: null,

  selectedDrainageNode: null,

  selectedRoute: null,

  incidents: cityData.delhi.incidents,

  notifications: initialNotifications,

  reportModalOpen: false,

  notifOpen: false,

  profileOpen: false,

  mobileMenuOpen: false,

  incidentFilter: "All",
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState
  );

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return ctx;
}
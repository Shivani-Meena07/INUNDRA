import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { cityData, initialNotifications, Incident } from "../data/mockData";

export type CityKey = "delhi" | "mumbai" | "chennai";
export type TabKey = "map" | "forecast" | "risk" | "drainage" | "reports" | "route";

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  city: string;
}

interface AppState {
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
  | { type: "SET_CITY"; city: CityKey }
  | { type: "SET_TAB"; tab: TabKey }
  | { type: "SET_TIME_STEP"; step: number }
  | { type: "TOGGLE_LAYER"; layer: string }
  | { type: "SELECT_HOTSPOT"; id: string | null }
  | { type: "SELECT_DRAINAGE_NODE"; id: string | null }
  | { type: "SELECT_ROUTE"; id: string | null }
  | { type: "ADD_INCIDENT"; incident: Incident }
  | { type: "MARK_NOTIF_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "TOGGLE_NOTIF" }
  | { type: "TOGGLE_PROFILE" }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "OPEN_REPORT_MODAL" }
  | { type: "CLOSE_REPORT_MODAL" }
  | { type: "SET_INCIDENT_FILTER"; filter: string };

const defaultLayers = new Set(["floodRisk", "rainfall", "drainage"]);

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
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
    case "SET_TAB":
      return { ...state, activeTab: action.tab, notifOpen: false, profileOpen: false, mobileMenuOpen: false };
    case "SET_TIME_STEP":
      return { ...state, timeStep: action.step };
    case "TOGGLE_LAYER": {
      const next = new Set(state.activeLayers);
      next.has(action.layer) ? next.delete(action.layer) : next.add(action.layer);
      return { ...state, activeLayers: next };
    }
    case "SELECT_HOTSPOT":
      return { ...state, selectedHotspot: action.id };
    case "SELECT_DRAINAGE_NODE":
      return { ...state, selectedDrainageNode: action.id };
    case "SELECT_ROUTE":
      return { ...state, selectedRoute: action.id };
    case "ADD_INCIDENT":
      return { ...state, incidents: [action.incident, ...state.incidents], reportModalOpen: false };
    case "MARK_NOTIF_READ":
      return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n) };
    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case "TOGGLE_NOTIF":
      return { ...state, notifOpen: !state.notifOpen, profileOpen: false };
    case "TOGGLE_PROFILE":
      return { ...state, profileOpen: !state.profileOpen, notifOpen: false };
    case "TOGGLE_MOBILE_MENU":
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen, notifOpen: false, profileOpen: false };
    case "OPEN_REPORT_MODAL":
      return { ...state, reportModalOpen: true };
    case "CLOSE_REPORT_MODAL":
      return { ...state, reportModalOpen: false };
    case "SET_INCIDENT_FILTER":
      return { ...state, incidentFilter: action.filter };
    default:
      return state;
  }
}

const initialState: AppState = {
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

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

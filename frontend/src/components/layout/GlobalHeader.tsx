import { Bell, ChevronDown, Menu, X, MapPin, User, LogOut, Settings, Star, BellOff } from "lucide-react";
import { useApp, CityKey, TabKey } from "../../state/AppContext";
import { cityData } from "../../data/mockData";

const NAV_TABS: { key: TabKey; label: string }[] = [
  { key: "map", label: "Live Map" },
  { key: "forecast", label: "Forecast" },
  { key: "risk", label: "Risk Analysis" },
  { key: "drainage", label: "Drainage" },
  { key: "reports", label: "Reports" },
  { key: "route", label: "Safe Route" },
];

const CITIES: CityKey[] = ["delhi", "mumbai", "chennai"];

const alertColors: Record<string, string> = {
  CRITICAL: "bg-red-600",
  HIGH: "bg-amber-600",
  MODERATE: "bg-yellow-600",
  SAFE: "bg-green-600",
};

export default function GlobalHeader() {
  const { state, dispatch } = useApp();
  const data = cityData[state.city];
  const unread = state.notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-warm-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-maroon-700 flex items-center justify-center rounded-[3px]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5 2 2 5 2 9C2 12 4 14 8 14C12 14 14 12 14 9C14 5 11 2 8 2Z" fill="white" fillOpacity="0.9"/>
              <path d="M4 9C4 9 5 7 8 7C11 7 12 9 12 9" stroke="#8B1A2A" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="9" r="1.5" fill="#8B1A2A"/>
            </svg>
          </div>
          <div>
            <div className="text-maroon-700 font-bold text-base tracking-tight leading-none">INUNDRA</div>
            <div className="text-warm-500 text-[9px] leading-none tracking-wide hidden sm:block">FLOOD NOWCASTING</div>
          </div>
        </div>

        {/* Alert pill */}
        <div className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-sm text-white text-[10px] font-medium tracking-wide ${alertColors[data.alertLevel] ?? "bg-warm-500"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
          {data.alertLevel}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => dispatch({ type: "SET_TAB", tab: tab.key })}
              className={`px-3 py-1.5 text-sm font-medium rounded-[3px] transition-colors ${
                state.activeTab === tab.key
                  ? "bg-maroon-50 text-maroon-700"
                  : "text-warm-700 hover:text-warm-900 hover:bg-warm-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {/* Area selector */}
          <div className="relative hidden md:block">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-warm-800 bg-warm-100 hover:bg-warm-200 rounded-[3px] transition-colors border border-warm-200"
              onClick={() => {
                const keys = CITIES;
                const next = keys[(keys.indexOf(state.city) + 1) % keys.length];
                dispatch({ type: "SET_CITY", city: next });
              }}
            >
              <MapPin size={13} className="text-maroon-700" />
              <span>{cityData[state.city].name}</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Full city dropdown via select */}
          <select
            className="hidden md:block text-xs text-warm-600 bg-transparent border-none outline-none cursor-pointer absolute opacity-0 w-0 h-0"
            value={state.city}
            onChange={e => dispatch({ type: "SET_CITY", city: e.target.value as CityKey })}
          />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => dispatch({ type: "TOGGLE_NOTIF" })}
              className="relative p-2 text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-[3px] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-maroon-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {state.notifOpen && <NotificationDropdown />}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => dispatch({ type: "TOGGLE_PROFILE" })}
              className="flex items-center gap-1.5 p-1.5 text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-[3px] transition-colors"
              aria-label="Profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-maroon-100 border border-maroon-200 flex items-center justify-center">
                <User size={14} className="text-maroon-700" />
              </div>
              <ChevronDown size={12} className="hidden sm:block" />
            </button>
            {state.profileOpen && <ProfileDropdown />}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => dispatch({ type: "TOGGLE_MOBILE_MENU" })}
            className="lg:hidden p-2 text-warm-600 hover:text-warm-900 hover:bg-warm-100 rounded-[3px] transition-colors"
            aria-label="Menu"
          >
            {state.mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* System status bar */}
      <div className="hidden md:flex items-center gap-4 px-4 py-1 bg-warm-50 border-t border-warm-100 text-[10px] text-warm-500 font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          SYSTEM OPERATIONAL
        </span>
        <span>Data updated: 2 min ago</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Rainfall feed</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Drainage model</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Forecast engine</span>
        <span className="ml-auto text-warm-400">{data.alertMessage}</span>
      </div>

      {/* Mobile menu */}
      {state.mobileMenuOpen && (
        <div className="lg:hidden border-t border-warm-200 bg-white">
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {/* City selector */}
            <div className="col-span-2 mb-1">
              <div className="text-[10px] text-warm-500 font-mono uppercase tracking-wide mb-1.5">Selected Area</div>
              <div className="flex gap-2">
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => dispatch({ type: "SET_CITY", city: c })}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-[3px] border transition-colors ${
                      state.city === c
                        ? "bg-maroon-700 text-white border-maroon-700"
                        : "text-warm-700 border-warm-200 hover:border-maroon-300"
                    }`}
                  >
                    {cityData[c].name}
                  </button>
                ))}
              </div>
            </div>
            {NAV_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => dispatch({ type: "SET_TAB", tab: tab.key })}
                className={`py-2.5 text-sm font-medium rounded-[3px] text-left px-3 transition-colors ${
                  state.activeTab === tab.key
                    ? "bg-maroon-50 text-maroon-700 border border-maroon-200"
                    : "text-warm-700 bg-warm-50 border border-warm-200 hover:bg-warm-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function NotificationDropdown() {
  const { state, dispatch } = useApp();
  const notifs = state.notifications;

  return (
    <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-warm-200 rounded-[4px] shadow-lg z-50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-warm-100">
        <span className="text-sm font-semibold text-warm-800">Notifications</span>
        <button
          onClick={() => dispatch({ type: "MARK_ALL_READ" })}
          className="text-[11px] text-maroon-700 hover:underline"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifs.map(n => (
          <button
            key={n.id}
            onClick={() => dispatch({ type: "MARK_NOTIF_READ", id: n.id })}
            className={`w-full text-left px-3 py-2.5 border-b border-warm-50 hover:bg-warm-50 transition-colors ${!n.read ? "bg-maroon-50/40" : ""}`}
          >
            <div className="flex items-start gap-2">
              {!n.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-maroon-600 shrink-0" />}
              {n.read && <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-transparent border border-warm-300 shrink-0" />}
              <div>
                <p className="text-xs text-warm-800">{n.message}</p>
                <p className="text-[10px] text-warm-400 mt-0.5 font-mono">{n.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileDropdown() {
  const { dispatch } = useApp();
  const items = [
    { icon: User, label: "Profile" },
    { icon: BellOff, label: "Notification Settings" },
    { icon: Star, label: "Preferred Area" },
    { icon: Settings, label: "System Preferences" },
    { icon: LogOut, label: "Sign Out" },
  ];
  return (
    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-warm-200 rounded-[4px] shadow-lg z-50">
      <div className="px-3 py-2.5 border-b border-warm-100">
        <div className="text-sm font-semibold text-warm-800">Riya Mehta</div>
        <div className="text-[11px] text-warm-500">Disaster Management Authority</div>
      </div>
      {items.map(({ icon: Icon, label }) => (
        <button
          key={label}
          onClick={() => dispatch({ type: "TOGGLE_PROFILE" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
        >
          <Icon size={14} className="text-warm-400" />
          {label}
        </button>
      ))}
    </div>
  );
}

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { TIER_INFO } from "../lib/rbac";
import "./BottomNav.css";

const TABS = [
    { label: "Home", path: "/", icon: "grid" },
    { label: "Bids", path: "/bids", icon: "file-text" },
    { label: "Contacts", path: "/contacts", icon: "users" },
    { label: "Company", path: "/company", icon: "briefcase" },
];

function TabIcon({ name }: { name: string }) {
    const map: Record<string, React.ReactNode> = {
        grid: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
        ),
        "file-text": (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        users: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        briefcase: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        ),
    };
    return map[name] || null;
}

export default function BottomNav() {
    const { subscription, profile, logout } = useAuth();
    const navigate = useNavigate();
    const tierInfo = TIER_INFO[subscription.tier];
    const [moreOpen, setMoreOpen] = useState(false);

    const [theme, setTheme] = useState<"dark" | "light">(() => {
        try { return (localStorage.getItem("xiri_theme") as "dark" | "light") || "dark"; } catch { return "dark"; }
    });

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("xiri_theme", next); } catch { /* */ }
    };

    const handleLogout = async () => {
        setMoreOpen(false);
        await logout();
        navigate("/login");
    };

    return (
        <>
            {/* "More" overlay sheet */}
            {moreOpen && (
                <div className="bottom-more-overlay" onClick={() => setMoreOpen(false)}>
                    <div className="bottom-more-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="bottom-more-header">
                            <span className="bottom-more-tier" style={{ color: tierInfo.color }}>
                                {tierInfo.name} Plan
                            </span>
                            <button className="bottom-more-close" onClick={() => setMoreOpen(false)}>✕</button>
                        </div>

                        <nav className="bottom-more-nav">
                            <NavLink to="/references" className="bottom-more-link" onClick={() => setMoreOpen(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                References
                            </NavLink>
                            <NavLink to="/settings" className="bottom-more-link" onClick={() => setMoreOpen(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                Settings
                            </NavLink>
                            <button className="bottom-more-link" onClick={toggleTheme}>
                                {theme === "dark" ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                )}
                                {theme === "dark" ? "Light Mode" : "Dark Mode"}
                            </button>
                            <button className="bottom-more-link bottom-more-logout" onClick={handleLogout}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Sign Out
                            </button>
                        </nav>

                        {profile && (
                            <div className="bottom-more-user">
                                <div className="bottom-more-avatar">
                                    {(profile.displayName || profile.email)[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="bottom-more-name">{profile.displayName || "User"}</div>
                                    <div className="bottom-more-email">{profile.email}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom tab bar */}
            <nav className="bottom-nav">
                {TABS.map((tab) => (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        end={tab.path === "/"}
                        className={({ isActive }) => `bottom-nav-tab ${isActive ? "active" : ""}`}
                    >
                        <TabIcon name={tab.icon} />
                        <span>{tab.label}</span>
                    </NavLink>
                ))}
                <button
                    className={`bottom-nav-tab ${moreOpen ? "active" : ""}`}
                    onClick={() => setMoreOpen(!moreOpen)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                    </svg>
                    <span>More</span>
                </button>
            </nav>
        </>
    );
}

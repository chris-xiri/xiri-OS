import { useState, useEffect, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { hasFeature, TIER_INFO, type Feature } from "../lib/rbac";
import "./Sidebar.css";

interface NavItem {
    label: string;
    path: string;
    icon: string;
    feature?: Feature;
    hidden?: boolean; // GTM: hide features not yet launched
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", path: "/", icon: "grid" },
    { label: "Bids", path: "/bids", icon: "file-text" },
    { label: "Calculator", path: "/bids/new", icon: "calculator", hidden: true },
    { label: "Contacts", path: "/contacts", icon: "users" },
    { label: "References", path: "/references", icon: "star" },
    { label: "Company", path: "/company", icon: "briefcase" },
    { label: "Invoicing", path: "/invoicing", icon: "credit-card", feature: "invoicing", hidden: true },
    { label: "Scheduling", path: "/scheduling", icon: "calendar", feature: "scheduling", hidden: true },
    { label: "Timekeeping", path: "/timekeeping", icon: "clock", feature: "timekeeping", hidden: true },
    { label: "Checklists", path: "/checklists", icon: "check-square", feature: "checklists", hidden: true },
    { label: "Inspections", path: "/inspections", icon: "search", feature: "inspections", hidden: true },
];

const SIDEBAR_KEY = "xiri_sidebar_collapsed";
const THEME_KEY = "xiri_theme";

function SidebarIcon({ name }: { name: string }) {
    const icons: Record<string, ReactNode> = {
        "grid": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
        ),
        "file-text": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        "users": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        "credit-card": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
        "calendar": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),
        "clock": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        "check-square": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
        "search": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        "calculator": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="10" y2="10" /><line x1="14" y1="10" x2="16" y2="10" />
                <line x1="8" y1="14" x2="10" y2="14" /><line x1="14" y1="14" x2="16" y2="14" />
                <line x1="8" y1="18" x2="16" y2="18" />
            </svg>
        ),
        "star": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        "briefcase": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
        ),
        "settings": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
        "log-out": (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
        ),
    };
    return icons[name] || null;
}

export default function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
    const { subscription, profile, logout } = useAuth();
    const navigate = useNavigate();
    const tierInfo = TIER_INFO[subscription.tier];

    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem(SIDEBAR_KEY) === "true"; } catch { return false; }
    });

    const toggleCollapse = () => {
        setCollapsed((v) => {
            const next = !v;
            try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch { /* ignore */ }
            return next;
        });
    };

    useEffect(() => {
        document.body.classList.toggle("sidebar-collapsed", collapsed);
        return () => { document.body.classList.remove("sidebar-collapsed"); };
    }, [collapsed]);

    // Theme
    const [theme, setTheme] = useState<"dark" | "light">(() => {
        try { return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark"; } catch { return "dark"; }
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
    }, [theme]);

    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
            {/* Logo + collapse toggle */}
            <div className="sidebar-logo">
                <span className="sidebar-logo-dot" />
                {!collapsed && <span>xiri<span style={{ color: "#00d4aa" }}>OS</span></span>}
                <button className="sidebar-collapse-btn" onClick={toggleCollapse} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} style={{ cursor: "pointer" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {collapsed ? (
                            <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
                        ) : (
                            <><polyline points="11 17 6 12 11 7" /><line x1="6" y1="12" x2="18" y2="12" /></>
                        )}
                    </svg>
                </button>
            </div>

            {/* Tier badge */}
            {!collapsed && (
                <div className="sidebar-tier" style={{ borderColor: tierInfo.color + "30", background: tierInfo.color + "08" }}>
                    <span className="tier-dot" style={{ background: tierInfo.color }} />
                    <span className="tier-name">{tierInfo.name} Plan</span>
                    <span className="tier-price" style={{ color: tierInfo.color }}>{tierInfo.price}</span>
                </div>
            )}

            {/* Nav */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.filter((i) => !i.hidden).map((item) => {
                    const locked = item.feature ? !hasFeature(subscription.tier, item.feature) : false;
                    return (
                        <NavLink
                            key={item.path}
                            to={locked ? "#" : item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive && !locked ? "active" : ""} ${locked ? "locked" : ""}`
                            }
                            onClick={(e) => {
                                if (locked) {
                                    e.preventDefault();
                                    navigate(item.path); // Will show FeatureGate
                                }
                                onMobileClose?.();
                            }}
                            title={collapsed ? item.label : undefined}
                        >
                            <SidebarIcon name={item.icon} />
                            {!collapsed && <span>{item.label}</span>}
                            {!collapsed && locked && (
                                <svg className="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="sidebar-bottom">
                <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} title={collapsed ? "Settings" : undefined}>
                    <SidebarIcon name="settings" />
                    {!collapsed && <span>Settings</span>}
                </NavLink>

                <button className="sidebar-link" onClick={toggleTheme} title={collapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}>
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
                    {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
                </button>

                <button className="sidebar-link sidebar-logout" onClick={handleLogout} title={collapsed ? "Sign Out" : undefined}>
                    <SidebarIcon name="log-out" />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                {profile && !collapsed && (
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {(profile.displayName || profile.email)[0]?.toUpperCase()}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{profile.displayName || "User"}</div>
                            <div className="sidebar-user-email">{profile.email}</div>
                        </div>
                    </div>
                )}

                {profile && collapsed && (
                    <div className="sidebar-user-collapsed" title={profile.displayName || profile.email}>
                        <div className="sidebar-avatar">
                            {(profile.displayName || profile.email)[0]?.toUpperCase()}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}

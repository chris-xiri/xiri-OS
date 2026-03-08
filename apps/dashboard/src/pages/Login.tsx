import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import "./Login.css";

export default function Login() {
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const isSignupMode = searchParams.get("mode") === "signup";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(isSignupMode);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isSignup) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                // Set displayName so AuthContext uses it instead of email
                if (fullName.trim()) {
                    await updateProfile(cred.user, { displayName: fullName.trim() });
                }
                // AuthContext onAuthStateChanged will auto-create profile + company with trial
            } else {
                await login(email, password);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
                setError("Invalid email or password.");
            } else if (msg.includes("too-many-requests")) {
                setError("Too many attempts. Please try again later.");
            } else if (msg.includes("email-already-in-use")) {
                setError("An account with this email already exists. Try signing in.");
            } else if (msg.includes("weak-password")) {
                setError("Password must be at least 6 characters.");
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="#00d4aa" fillOpacity="0.15" />
                        <path d="M8 16L14 22L24 10" stroke="#00d4aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="login-logo-text">xiri <span style={{ color: "#00d4aa" }}>OS</span></span>
                </div>

                <h1>{isSignup ? "Start your free trial" : "Welcome back"}</h1>
                <p className="login-subtitle">
                    {isSignup
                        ? "14-day Bid Plus trial — no credit card required"
                        : "Sign in to your account to continue"}
                </p>

                {error && (
                    <div className="login-error">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5" />
                            <path d="M8 5v3M8 10.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {isSignup && (
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Smith"
                                required
                                autoComplete="name"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            autoComplete="email"
                            autoFocus={!isSignup}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete={isSignup ? "new-password" : "current-password"}
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <span className="login-spinner" />
                        ) : isSignup ? (
                            "Create Account"
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="login-footer">
                    {isSignup ? (
                        <>
                            Already have an account?{" "}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(false); setError(""); }}>
                                Sign in →
                            </a>
                        </>
                    ) : (
                        <>
                            Don't have an account?{" "}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(true); setError(""); }}>
                                Start free trial →
                            </a>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}


import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import { trackSignupStarted, trackSignupCompleted } from "../lib/analytics";
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
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setError("");
        setGoogleLoading(true);
        try {
            trackSignupStarted("google");
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            trackSignupCompleted("google");
            // AuthContext onAuthStateChanged handles profile + company creation
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong";
            if (msg.includes("popup-closed-by-user")) {
                // User closed the popup — don't show error
            } else if (msg.includes("account-exists-with-different-credential")) {
                setError("An account with this email already exists. Try signing in with email.");
            } else {
                setError(msg);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isSignup) {
                trackSignupStarted("email");
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                // Set displayName so AuthContext uses it instead of email
                if (fullName.trim()) {
                    await updateProfile(cred.user, { displayName: fullName.trim() });
                }
                trackSignupCompleted("email");
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

                    <button type="submit" className="login-btn" disabled={loading || googleLoading}>
                        {loading ? (
                            <span className="login-spinner" />
                        ) : isSignup ? (
                            "Create Account"
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="login-divider">
                    <span>or</span>
                </div>

                <button
                    className="login-google-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                >
                    {googleLoading ? (
                        <span className="login-spinner login-spinner-dark" />
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z" fill="#FBBC05" />
                                <path d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.07l3.66 2.84c.87-2.6 3.3-4.16 6.16-4.16z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

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


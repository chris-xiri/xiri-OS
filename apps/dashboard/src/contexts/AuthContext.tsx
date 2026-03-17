import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { setUserId } from "../lib/analytics";
import { getAcquisitionSource } from "../lib/acquisition";
import Clarity from "@microsoft/clarity";
import type { Tier } from "../lib/rbac";

/* ─── Types ─── */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    companyId: string;
    role: "owner" | "manager" | "cleaner";
}

export interface CompanySubscription {
    tier: Tier;
    status: "active" | "trialing" | "past_due" | "canceled";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: string;
    trialEnd?: string;
}

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    subscription: CompanySubscription;
    loading: boolean;
    needsOnboarding: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    completeOnboarding: () => void;
}

const DEFAULT_SUBSCRIPTION: CompanySubscription = {
    tier: "bid",
    status: "active",
};

/* ─── Context ─── */
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [subscription, setSubscription] = useState<CompanySubscription>(DEFAULT_SUBSCRIPTION);
    const [loading, setLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        let unsubCompany: (() => void) | null = null;

        const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            // Clean up previous company listener
            if (unsubCompany) {
                unsubCompany();
                unsubCompany = null;
            }

            if (firebaseUser) {
                setUser(firebaseUser);
                setUserId(firebaseUser.uid);
                Clarity.identify(firebaseUser.uid, undefined, undefined, firebaseUser.email || undefined);

                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

                    if (userDoc.exists()) {
                        const data = userDoc.data() as Omit<UserProfile, "uid">;
                        const userProfile: UserProfile = { uid: firebaseUser.uid, ...data };
                        setProfile(userProfile);

                        // Real-time listener on company subscription
                        // Tier changes from Stripe webhooks update instantly
                        if (data.companyId) {
                            unsubCompany = onSnapshot(
                                doc(db, "companies", data.companyId),
                                (snap) => {
                                    if (snap.exists()) {
                                        const companyData = snap.data();
                                        if (companyData.subscription) {
                                            setSubscription(companyData.subscription as CompanySubscription);
                                        }
                                    }
                                },
                                (err) => {
                                    console.error("Company subscription listener error:", err);
                                }
                            );
                        }
                    } else {
                        // New user — auto-create profile + company with Bid Plus trial
                        const companyId = `company_${firebaseUser.uid}`;
                        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
                        const newProfile: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || "",
                            displayName: firebaseUser.displayName || firebaseUser.email || "",
                            companyId,
                            role: "owner",
                        };

                        const trialSubscription: CompanySubscription = {
                            tier: "bid_plus",
                            status: "trialing",
                            trialEnd,
                        };

                        // Write user + company docs
                        // Capture how the user found us
                        const acquisition = getAcquisitionSource();

                        await Promise.all([
                            setDoc(doc(db, "users", firebaseUser.uid), {
                                email: newProfile.email,
                                displayName: newProfile.displayName,
                                companyId: newProfile.companyId,
                                role: newProfile.role,
                                createdAt: new Date().toISOString(),
                                ...(acquisition && { acquisition }),
                            }),
                            setDoc(doc(db, "companies", companyId), {
                                name: newProfile.displayName + "'s Company",
                                ownerId: firebaseUser.uid,
                                subscription: trialSubscription,
                                createdAt: new Date().toISOString(),
                            }),
                        ]);

                        setProfile(newProfile);
                        setNeedsOnboarding(true);

                        // Start listening to the new company
                        unsubCompany = onSnapshot(
                            doc(db, "companies", companyId),
                            (snap) => {
                                if (snap.exists()) {
                                    const companyData = snap.data();
                                    if (companyData.subscription) {
                                        setSubscription(companyData.subscription as CompanySubscription);
                                    }
                                }
                            }
                        );
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                }
            } else {
                setUser(null);
                setProfile(null);
                setSubscription(DEFAULT_SUBSCRIPTION);
            }
            setLoading(false);
        });

        return () => {
            unsubAuth();
            if (unsubCompany) unsubCompany();
        };
    }, []);

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const completeOnboarding = () => {
        setNeedsOnboarding(false);
    };

    return (
        <AuthContext.Provider value={{ user, profile, subscription, loading, needsOnboarding, login, logout, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

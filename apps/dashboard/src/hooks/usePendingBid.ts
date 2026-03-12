import { useEffect, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
    BUILDING_TYPES,
    calculate,
    type CalculatorInputs,
    type RoomScope,
} from "@xiri-facility-solutions/shared";

const PENDING_BID_KEY = "xiri_pendingBid";

interface PendingContact {
    name: string;
    company: string;
    email: string;
    phone: string;
}

interface PendingBid {
    inputs: CalculatorInputs;
    roomScopes: RoomScope[];
    priceOverride: number | null;
    selectedState: string;
    selectedTasks: string[];
    results: ReturnType<typeof calculate>;
    savedAt: string;
    contact?: PendingContact | null;
}

/**
 * Consumes a pending bid from localStorage (saved by PublicCalculator)
 * and creates it in Firestore once the user is authenticated.
 * If contact info is present, also creates a contact and links it.
 *
 * Call this in Dashboard so it runs immediately after login/signup.
 */
export function usePendingBid() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const processed = useRef(false);

    useEffect(() => {
        const companyId = profile?.companyId;
        if (!companyId) return;

        // Only process once per mount cycle
        if (processed.current) return;

        const raw = localStorage.getItem(PENDING_BID_KEY);
        if (!raw) return;

        // Mark as processed immediately to prevent double-processing
        // (React 18 strict mode may fire effects twice)
        processed.current = true;

        let pending: PendingBid;
        try {
            pending = JSON.parse(raw);
        } catch {
            localStorage.removeItem(PENDING_BID_KEY);
            return;
        }

        // Guard against stale pending bids (older than 1 hour)
        const age = Date.now() - new Date(pending.savedAt).getTime();
        if (age > 60 * 60 * 1000) {
            localStorage.removeItem(PENDING_BID_KEY);
            return;
        }

        // Remove from localStorage BEFORE the async call to prevent
        // any other instance or re-render from picking it up
        localStorage.removeItem(PENDING_BID_KEY);

        const createBid = async () => {
            try {
                const { inputs, roomScopes, priceOverride, selectedState, selectedTasks, results, contact } = pending;
                const buildingType = BUILDING_TYPES.find((b) => b.id === inputs.buildingTypeId);
                const bidName = `Calculator Bid - ${buildingType?.name || "Building"} ${inputs.sqft.toLocaleString()} sqft`;
                const now = new Date().toISOString();

                // Auto-create contact if info was provided
                let contactId = "";
                if (contact && (contact.name || contact.company || contact.email || contact.phone)) {
                    const contactRef = await addDoc(
                        collection(db, "companies", companyId, "contacts"),
                        {
                            name: contact.name || "",
                            company: contact.company || "",
                            email: contact.email || "",
                            phone: contact.phone || "",
                            source: "public_calculator",
                            createdAt: now,
                            updatedAt: now,
                        }
                    );
                    contactId = contactRef.id;
                }

                const bidRef = await addDoc(
                    collection(db, "companies", companyId, "bids"),
                    {
                        contactId,
                        name: bidName,
                        status: "draft",
                        calculatorInputs: inputs,
                        selectedTasks,
                        roomScopes,
                        priceOverride,
                        state: selectedState,
                        results,
                        createdAt: now,
                        updatedAt: now,
                        version: 1,
                        versions: [],
                        source: "public_calculator",
                    }
                );

                // Navigate to the newly created bid
                navigate(`/bids/${bidRef.id}`);
            } catch (err) {
                console.error("Failed to create pending bid:", err);
                // Put it back so user can retry on next load
                try {
                    localStorage.setItem(PENDING_BID_KEY, JSON.stringify(pending));
                } catch { /* ignore */ }
                processed.current = false;
            }
        };

        createBid();
    }, [profile, navigate]);
}

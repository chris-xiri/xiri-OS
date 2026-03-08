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
} from "../lib/calculator";

const PENDING_BID_KEY = "xiri_pendingBid";

interface PendingBid {
    inputs: CalculatorInputs;
    roomScopes: RoomScope[];
    priceOverride: number | null;
    selectedState: string;
    selectedTasks: string[];
    results: ReturnType<typeof calculate>;
    savedAt: string;
}

/**
 * Consumes a pending bid from localStorage (saved by PublicCalculator)
 * and creates it in Firestore once the user is authenticated.
 *
 * Call this in Dashboard so it runs immediately after login/signup.
 */
export function usePendingBid() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const processing = useRef(false);

    useEffect(() => {
        if (!profile?.companyId || processing.current) return;

        const raw = localStorage.getItem(PENDING_BID_KEY);
        if (!raw) return;

        // Prevent double-processing
        processing.current = true;

        let pending: PendingBid;
        try {
            pending = JSON.parse(raw);
        } catch {
            localStorage.removeItem(PENDING_BID_KEY);
            processing.current = false;
            return;
        }

        // Guard against stale pending bids (older than 1 hour)
        const age = Date.now() - new Date(pending.savedAt).getTime();
        if (age > 60 * 60 * 1000) {
            localStorage.removeItem(PENDING_BID_KEY);
            processing.current = false;
            return;
        }

        const createBid = async () => {
            try {
                const { inputs, roomScopes, priceOverride, selectedState, selectedTasks, results } = pending;
                const buildingType = BUILDING_TYPES.find((b) => b.id === inputs.buildingTypeId);
                const bidName = `Calculator Bid - ${buildingType?.name || "Building"} ${inputs.sqft.toLocaleString()} sqft`;
                const now = new Date().toISOString();

                const bidRef = await addDoc(
                    collection(db, "companies", profile.companyId, "bids"),
                    {
                        contactId: "",
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

                // Clean up
                localStorage.removeItem(PENDING_BID_KEY);

                // Navigate to the newly created bid
                navigate(`/bids/${bidRef.id}`);
            } catch (err) {
                console.error("Failed to create pending bid:", err);
                localStorage.removeItem(PENDING_BID_KEY);
            } finally {
                processing.current = false;
            }
        };

        createBid();
    }, [profile, navigate]);
}

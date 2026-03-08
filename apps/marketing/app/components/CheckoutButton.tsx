"use client";

import { useState } from "react";

interface Props {
    plan: string; // "grow" | "pro" | "business"
    featured?: boolean;
    label: string;
}

export default function CheckoutButton({ plan, featured, label }: Props) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        setLoading(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, interval: "month" }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || "Something went wrong");
                setLoading(false);
            }
        } catch {
            alert("Network error — please try again");
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`btn ${featured ? "btn-primary" : "btn-secondary"}`}
            style={{
                width: "100%",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
            }}
        >
            {loading ? "Redirecting…" : label}
        </button>
    );
}

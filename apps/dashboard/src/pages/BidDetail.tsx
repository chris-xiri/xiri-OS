import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { BUILDING_TYPES, CLEANING_TASKS, FREQUENCIES, ROOM_TYPES, TASK_FREQUENCY_OPTIONS, generateProposal } from "@xiri-facility-solutions/shared";
import type { RoomScope, ProposalReference } from "@xiri-facility-solutions/shared";
import { saveAs } from "file-saver";
import type { Bid, ProposalTerms } from "./Bids";
import type { Contact } from "./Contacts";
import { hasFeature } from "../lib/rbac";
import { trackProposalGenerated } from "../lib/analytics";
import "./BidDetail.css";

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const STATUS_COLORS: Record<string, string> = {
    draft: "#8b92b3",
    sent: "#6366f1",
    won: "#10b981",
    lost: "#f87171",
};

const STATUS_OPTIONS: Bid["status"][] = ["draft", "sent", "won", "lost"];

export default function BidDetail() {
    const { bidId } = useParams<{ bidId: string }>();
    const navigate = useNavigate();
    const { profile, subscription } = useAuth();
    const [bid, setBid] = useState<Bid | null>(null);
    const [contact, setContact] = useState<Contact | null>(null);
    const [companyData, setCompanyData] = useState<{ name?: string; phone?: string; email?: string; address?: any; logoUrl?: string; legalName?: string;[k: string]: any }>({});
    const [loading, setLoading] = useState(true);
    const [viewingVersion, setViewingVersion] = useState<number | null>(null);
    const [termsOpen, setTermsOpen] = useState(false);
    const [localTerms, setLocalTerms] = useState<ProposalTerms | null>(null);
    const [termsSaving, setTermsSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [references, setReferences] = useState<ProposalReference[]>([]);
    const [deleting, setDeleting] = useState(false);

    const companyId = profile?.companyId;

    // Company info completeness check — gate proposal actions
    const companyProfileComplete = !!(companyData.name && companyData.name !== (profile?.displayName + "'s Company") && companyData.address);

    // Delete bid with confirmation
    const handleDeleteBid = async () => {
        if (!companyId || !bidId) return;
        if (!window.confirm("Are you sure you want to delete this bid? This cannot be undone.")) return;
        setDeleting(true);
        try {
            await deleteDoc(doc(db, "companies", companyId, "bids", bidId));
            navigate("/bids");
        } catch (err) {
            console.error("Failed to delete bid:", err);
            setDeleting(false);
        }
    };

    // Real-time bid listener
    useEffect(() => {
        if (!companyId || !bidId) return;
        return onSnapshot(doc(db, "companies", companyId, "bids", bidId), (snap) => {
            if (snap.exists()) {
                setBid({ id: snap.id, ...snap.data() } as Bid);
            } else {
                setBid(null);
            }
            setLoading(false);
        });
    }, [companyId, bidId]);

    // Load linked contact
    useEffect(() => {
        if (!companyId || !bid?.contactId) return;
        return onSnapshot(doc(db, "companies", companyId, "contacts", bid.contactId), (snap) => {
            if (snap.exists()) {
                setContact({ id: snap.id, ...snap.data() } as Contact);
            }
        });
    }, [companyId, bid?.contactId]);

    // Load company data (all fields for proposal terms)
    useEffect(() => {
        if (!companyId) return;
        getDoc(doc(db, "companies", companyId)).then((snap) => {
            if (snap.exists()) {
                const d = snap.data();
                setCompanyData(d);
            }
        });
    }, [companyId]);

    // Fetch references from collection
    useEffect(() => {
        if (!companyId) return;
        getDocs(collection(db, "companies", companyId, "references")).then((snap) => {
            const refs = snap.docs.map((d) => {
                const r = d.data();
                return {
                    companyName: r.company || "",
                    contactName: r.name || "",
                    phone: r.phone || undefined,
                    email: r.email || undefined,
                };
            });
            console.log("[References] Fetched", refs.length, "references");
            setReferences(refs);
        }).catch((err) => {
            console.error("[References] Failed to fetch:", err);
        });
    }, [companyId]);

    // Build equipment/supplies text based on bid's supply policy and company presets
    const buildEquipmentText = useCallback((cd: typeof companyData, bidSupplyPolicy?: string): string => {
        const base = cd.equipmentDescription || "";
        const policy = bidSupplyPolicy || cd.suppliesPolicy || "";
        // Map calculator supplyPolicy → Firestore policy name
        const mapped = policy === "client" ? "customer_provides" : policy === "shared" ? "both" : policy === "company" ? "we_provide" : policy;

        if (mapped === "we_provide") {
            const weProvide = cd.suppliesWeProvide || "";
            return [base, weProvide ? `All cleaning supplies are provided by us${weProvide ? `: ${weProvide}` : ""}.` : "All cleaning supplies are provided by our company."].filter(Boolean).join("\n\n");
        } else if (mapped === "customer_provides") {
            const custProvide = cd.suppliesCustomerProvides || "";
            return [base, custProvide ? `Cleaning supplies are provided by the client: ${custProvide}.` : "Cleaning supplies are provided by the client."].filter(Boolean).join("\n\n");
        } else if (mapped === "both") {
            const parts: string[] = [base];
            if (cd.suppliesWeProvide) parts.push(`We provide: ${cd.suppliesWeProvide}.`);
            if (cd.suppliesCustomerProvides) parts.push(`Client provides: ${cd.suppliesCustomerProvides}.`);
            if (!cd.suppliesWeProvide && !cd.suppliesCustomerProvides) parts.push("Supplies are shared between our company and the client.");
            return parts.filter(Boolean).join("\n\n");
        }
        return base;
    }, []);

    // Initialize proposal terms: use bid-saved terms or fall back to company defaults
    useEffect(() => {
        if (!bid || !companyData.legalName) return;
        if (bid.proposalTerms) {
            setLocalTerms(bid.proposalTerms);
        } else {
            // Derive supply policy from bid's calculator inputs
            const bidSupplyPolicy = bid.calculatorInputs?.supplyPolicy || "";
            // Build defaults from company data
            setLocalTerms({
                legalName: companyData.legalName || companyData.name || "",
                employeeStatus: companyData.employeeStatus || "",
                supervisionApproach: companyData.supervisionApproach || "",
                companyPhilosophy: companyData.companyPhilosophy || "",
                cancellationPolicy: companyData.cancellationPolicy || "",
                serviceGuarantee: companyData.serviceGuarantee || "",
                lateFeePolicy: companyData.lateFeePolicy || "",
                equipmentDescription: buildEquipmentText(companyData, bidSupplyPolicy),
                specialServices: companyData.specialServices || "",
                suppliesPolicy: companyData.suppliesPolicy || "",
                suppliesWeProvide: companyData.suppliesWeProvide || "",
                suppliesCustomerProvides: companyData.suppliesCustomerProvides || "",
                contractTerm: companyData.contractTerm || "",
                additionalTerms: companyData.additionalTerms || "",
                bonded: companyData.bonded || false,
                bondAmount: companyData.bondAmount || "",
                uniformedPersonnel: companyData.uniformedPersonnel || false,
            });
        }
    }, [bid?.id, companyData, buildEquipmentText]);

    // Shared: fetch COI and convert to image data URL (handles both PDF and image files)
    const fetchCoiDataUrl = useCallback(async (): Promise<string | undefined> => {
        const coiUrl = companyData.insuranceDocs?.coi;
        if (!coiUrl) return undefined;
        try {
            const resp = await fetch(coiUrl);
            const contentType = resp.headers.get("content-type") || "";
            const blob = await resp.blob();

            if (contentType.startsWith("image/")) {
                const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                return dataUrl;
            } else if (contentType.includes("pdf") || coiUrl.toLowerCase().includes(".pdf")) {
                const pdfjsLib = await import("pdfjs-dist");
                const workerModule = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
                const arrayBuffer = await blob.arrayBuffer();
                const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdfDoc.getPage(1);
                const scale = 2;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext("2d")!;
                await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
                return canvas.toDataURL("image/jpeg", 0.92);
            }
        } catch (err) {
            console.warn("[COI] Error processing COI:", err);
        }
        return undefined;
    }, [companyData]);

    const handlePreview = useCallback(async () => {
        if (!bid) return;
        if (!companyProfileComplete) {
            if (window.confirm("Complete your company profile first — your company name and address appear on every proposal.\n\nGo to Company Info now?")) {
                navigate("/company");
            }
            return;
        }
        const fmtAddr = (addr: any): string | undefined => {
            if (!addr) return undefined;
            if (typeof addr === "string") return addr;
            const parts = [addr.address, addr.city, addr.state].filter(Boolean);
            if (addr.zip) parts.push(addr.zip);
            return parts.length ? parts.join(", ") : undefined;
        };

        const coiImageDataUrl = await fetchCoiDataUrl();

        const { doc: pdfDoc } = await generateProposal({
            bidName: bid.name,
            companyName: companyData.name || "Our Company",
            contactName: contact?.name || "Client",
            contactCompany: contact?.company || "",
            contactEmail: contact?.email,
            contactPhone: contact?.phone,
            contactAddress: contact?.address,
            state: bid.state || "",
            inputs: bid.calculatorInputs,
            results: bid.results,
            selectedTasks: bid.selectedTasks,
            version: (bid as any).version || 1,
            createdAt: bid.createdAt,
            companyPhone: companyData.phone,
            companyEmail: companyData.email,
            companyAddress: fmtAddr(companyData.address),
            companyLogoUrl: companyData.logoUrl,
            proposalTerms: localTerms || undefined,
            roomScopes: (bid as any).roomScopes,
            priceOverride: (bid as any).priceOverride ?? null,
            references,
            coiImageDataUrl,
            watermark: "DRAFT",
        });

        trackProposalGenerated();
        const blob = pdfDoc.output("blob");
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
    }, [bid, companyData, contact, localTerms, fetchCoiDataUrl]);

    const saveTerms = useCallback(async (terms: ProposalTerms) => {
        if (!companyId || !bidId) return;
        setTermsSaving(true);
        await updateDoc(doc(db, "companies", companyId, "bids", bidId), { proposalTerms: terms });
        setTermsSaving(false);
        setTermsOpen(false);
    }, [companyId, bidId]);

    const resetTermsToDefaults = useCallback(() => {
        const bidSupplyPolicy = bid?.calculatorInputs?.supplyPolicy || "";
        const defaults: ProposalTerms = {
            legalName: companyData.legalName || companyData.name || "",
            employeeStatus: companyData.employeeStatus || "",
            supervisionApproach: companyData.supervisionApproach || "",
            companyPhilosophy: companyData.companyPhilosophy || "",
            cancellationPolicy: companyData.cancellationPolicy || "",
            serviceGuarantee: companyData.serviceGuarantee || "",
            lateFeePolicy: companyData.lateFeePolicy || "",
            equipmentDescription: buildEquipmentText(companyData, bidSupplyPolicy),
            specialServices: companyData.specialServices || "",
            suppliesPolicy: companyData.suppliesPolicy || "",
            suppliesWeProvide: companyData.suppliesWeProvide || "",
            suppliesCustomerProvides: companyData.suppliesCustomerProvides || "",
            contractTerm: companyData.contractTerm || "",
            additionalTerms: companyData.additionalTerms || "",
            bonded: companyData.bonded || false,
            bondAmount: companyData.bondAmount || "",
            uniformedPersonnel: companyData.uniformedPersonnel || false,
        };
        setLocalTerms(defaults);
        saveTerms(defaults);
    }, [companyData, saveTerms, bid, buildEquipmentText]);

    const handleStatusChange = useCallback(async (status: Bid["status"]) => {
        if (!companyId || !bidId) return;
        await updateDoc(doc(db, "companies", companyId, "bids", bidId), {
            status,
            updatedAt: new Date().toISOString(),
            ...(status === "sent" ? { sentAt: new Date().toISOString() } : {}),
        });
    }, [companyId, bidId]);

    const handleDelete = useCallback(async () => {
        if (!companyId || !bidId) return;
        if (!confirm("Delete this bid? This cannot be undone.")) return;
        await deleteDoc(doc(db, "companies", companyId, "bids", bidId));
        navigate("/bids");
    }, [companyId, bidId, navigate]);

    const handleDownloadPdf = useCallback(async () => {
        if (!bid) return;
        if (!companyProfileComplete) {
            if (window.confirm("Complete your company profile first — your company name and address appear on every proposal.\n\nGo to Company Info now?")) {
                navigate("/company");
            }
            return;
        }

        // Format structured address to a single string
        const fmtAddr = (addr: any): string | undefined => {
            if (!addr) return undefined;
            if (typeof addr === "string") return addr;
            const parts = [addr.address, addr.city, addr.state].filter(Boolean);
            if (addr.zip) parts.push(addr.zip);
            return parts.length ? parts.join(", ") : undefined;
        };

        const coiImageDataUrl = await fetchCoiDataUrl();

        const { doc: pdfDoc, filename } = await generateProposal({
            bidName: bid.name,
            companyName: companyData.name || "Our Company",
            contactName: contact?.name || "Client",
            contactCompany: contact?.company || "",
            contactEmail: contact?.email,
            contactPhone: contact?.phone,
            contactAddress: contact?.address,
            state: bid.state || "",
            inputs: bid.calculatorInputs,
            results: bid.results,
            selectedTasks: bid.selectedTasks,
            version: (bid as any).version || 1,
            createdAt: bid.createdAt,
            companyPhone: companyData.phone,
            companyEmail: companyData.email,
            companyAddress: fmtAddr(companyData.address),
            companyLogoUrl: companyData.logoUrl,
            proposalTerms: localTerms || undefined,
            roomScopes: (bid as any).roomScopes,
            priceOverride: (bid as any).priceOverride ?? null,
            coiImageDataUrl,
            references,
        });

        trackProposalGenerated();
        const pdfBlob = pdfDoc.output("blob");

        // Try native Save As dialog first (guarantees correct filename)
        if ("showSaveFilePicker" in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: "PDF Document",
                        accept: { "application/pdf": [".pdf"] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(pdfBlob);
                await writable.close();
                // Stamp download timestamp
                if (companyId && bidId) {
                    updateDoc(doc(db, "companies", companyId, "bids", bidId), { proposalDownloadedAt: new Date().toISOString() }).catch(() => { });
                }
                return;
            } catch (err: any) {
                if (err.name === "AbortError") return; // User cancelled
                console.warn("Save dialog failed, using fallback:", err);
            }
        }

        // Fallback: file-saver
        saveAs(pdfBlob, filename);
        // Stamp download timestamp
        if (companyId && bidId) {
            updateDoc(doc(db, "companies", companyId, "bids", bidId), { proposalDownloadedAt: new Date().toISOString() }).catch(() => { });
        }
    }, [bid, contact, companyData, localTerms, fetchCoiDataUrl]);

    const [emailSending, setEmailSending] = useState(false);

    const handleSendEmail = useCallback(async () => {
        if (!hasFeature(subscription.tier, "email_campaigns")) {
            alert("Email sending is available on the Grow plan and above. Upgrade to unlock!");
            return;
        }
        if (!bid || !contact?.email) {
            alert("This bid needs a contact with an email address to send a proposal.");
            return;
        }
        if (!companyData.email) {
            alert("Please add your company email in Company settings first. This is used as the reply-to address.");
            return;
        }

        const confirmSend = confirm(
            `Send proposal to ${contact.name} (${contact.email})?\n\nThe email will be CC'd to ${companyData.email} and replies will go to your company email.`
        );
        if (!confirmSend) return;

        setEmailSending(true);
        try {
            // Generate PDF without DRAFT watermark
            const fmtAddr = (addr: any): string | undefined => {
                if (!addr) return undefined;
                if (typeof addr === "string") return addr;
                const parts = [addr.address, addr.city, addr.state].filter(Boolean);
                if (addr.zip) parts.push(addr.zip);
                return parts.length ? parts.join(", ") : undefined;
            };

            const coiImageDataUrl = await fetchCoiDataUrl();

            const { doc: pdfDoc, filename } = await generateProposal({
                bidName: bid.name,
                companyName: companyData.name || "Our Company",
                contactName: contact.name || "Client",
                contactCompany: contact.company || "",
                contactEmail: contact.email,
                contactPhone: contact.phone,
                contactAddress: contact.address,
                state: bid.state || "",
                inputs: bid.calculatorInputs,
                results: bid.results,
                selectedTasks: bid.selectedTasks,
                version: (bid as any).version || 1,
                createdAt: bid.createdAt,
                companyPhone: companyData.phone,
                companyEmail: companyData.email,
                companyAddress: fmtAddr(companyData.address),
                companyLogoUrl: companyData.logoUrl,
                proposalTerms: localTerms || undefined,
                roomScopes: (bid as any).roomScopes,
                priceOverride: (bid as any).priceOverride ?? null,
                coiImageDataUrl,
                references,
                // No watermark for sent proposals
            });

            // Convert to base64 for the Cloud Function
            trackProposalGenerated();
            const pdfBase64 = pdfDoc.output("datauristring").split(",")[1];

            // Call Cloud Function
            const { httpsCallable } = await import("firebase/functions");
            const { functions } = await import("../lib/firebase");
            const sendProposal = httpsCallable(functions, "sendProposal");

            await sendProposal({
                bidId,
                companyId,
                pdfBase64,
                filename,
                toEmail: contact.email,
                toName: contact.name || "",
                ccEmail: companyData.email,
                replyToEmail: companyData.email,
                companyName: companyData.name || "Our Company",
                bidName: bid.name,
            });

            alert(`✅ Proposal sent to ${contact.email}!\nA copy was CC'd to ${companyData.email}.`);
        } catch (err: any) {
            console.error("Failed to send proposal email:", err);
            alert(`Failed to send email: ${err.message || "Unknown error"}. Please try again.`);
        } finally {
            setEmailSending(false);
        }
    }, [bid, contact, companyData, companyId, bidId, subscription.tier, localTerms, fetchCoiDataUrl, references]);

    if (loading) {
        return (
            <div className="bid-detail-page">
                <div className="app-loading" style={{ minHeight: 200 }}>
                    <div className="app-loading-spinner" />
                </div>
            </div>
        );
    }

    if (!bid) {
        return (
            <div className="bid-detail-page">
                <div className="bid-not-found">
                    <h2>Bid not found</h2>
                    <p>This bid may have been deleted.</p>
                    <button className="bd-btn bd-btn-secondary" onClick={() => navigate("/bids")}>
                        ← Back to Bids
                    </button>
                </div>
            </div>
        );
    }

    // Determine which data to show (current or historical version)
    const versions = (bid as any).versions || [];
    const currentVersion = (bid as any).version || 1;
    const displayData = viewingVersion !== null
        ? versions.find((v: any) => v.version === viewingVersion)
        : null;

    const results = displayData?.results || bid.results;
    const inputs = displayData?.calculatorInputs || bid.calculatorInputs;
    const tasks = displayData?.selectedTasks || bid.selectedTasks;
    const roomScopes: RoomScope[] | undefined = displayData?.roomScopes || (bid as any).roomScopes;
    const priceOverride: number | null = displayData?.priceOverride ?? (bid as any).priceOverride ?? null;
    const buildingType = BUILDING_TYPES.find((b) => b.id === inputs?.buildingTypeId);
    const frequency = FREQUENCIES.find((f) => f.value === inputs?.frequency);

    return (
        <div className="bid-detail-page">
            {/* Header */}
            <div className="bd-header">
                <button className="bd-back-btn" onClick={() => navigate("/bids")}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Bids
                </button>

                <div className="bd-title-row">
                    <div className="bd-title-left">
                        <h1>{bid.name}</h1>
                        <div className="bd-meta">
                            <span
                                className="bd-status-badge"
                                style={{
                                    color: STATUS_COLORS[bid.status],
                                    background: STATUS_COLORS[bid.status] + "18",
                                    borderColor: STATUS_COLORS[bid.status] + "30",
                                }}
                            >
                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </span>
                            <span className="bd-version-badge">v{currentVersion}</span>
                            {contact && (
                                <span className="bd-client-name">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                    {contact.name} · {contact.company}
                                </span>
                            )}
                            <span className="bd-date">
                                Created {new Date(bid.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="bd-actions">
                        <button className="bd-btn bd-btn-secondary" onClick={() => navigate(`/bids/new?bid=${bid.id}`)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Bid
                        </button>
                        <button className="bd-btn bd-btn-secondary" onClick={handlePreview}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            Preview
                        </button>
                        <button className="bd-btn bd-btn-primary" onClick={handleDownloadPdf}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Proposal
                        </button>
                        <button
                            className={`bd-btn ${hasFeature(subscription.tier, "email_campaigns") ? "bd-btn-accent" : "bd-btn-locked"}`}
                            onClick={handleSendEmail}
                            disabled={emailSending}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </svg>
                            {emailSending ? "Sending…" : hasFeature(subscription.tier, "email_campaigns") ? "Send Email" : "Send Email 🔒"}
                        </button>
                        <button
                            className="bd-btn bd-btn-danger"
                            onClick={handleDeleteBid}
                            disabled={deleting}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            {deleting ? "Deleting…" : "Delete"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Company info banner */}
            {!companyProfileComplete && (
                <div className="bd-company-banner">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Complete your <strong>company profile</strong> to generate professional proposals.</span>
                    <button onClick={() => navigate("/company")}>Set Up Company Info</button>
                </div>
            )}
            {viewingVersion !== null && (
                <div className="bd-version-banner">
                    Viewing version {viewingVersion} (saved {new Date(displayData?.savedAt).toLocaleDateString()})
                    <button onClick={() => setViewingVersion(null)}>View Current (v{currentVersion})</button>
                </div>
            )}

            <div className="bd-layout">
                {/* Main content */}
                <div className="bd-main">
                    {/* Price hero */}
                    <div className="bd-price-card">
                        <div className="bd-price-hero">
                            <span className="bd-price-value">{fmt(priceOverride ?? results?.totalPricePerMonth ?? 0)}</span>
                            <span className="bd-price-period">/month</span>
                            {priceOverride !== null && (
                                <div className="bd-override-note">
                                    ✏️ Manual override · Calculator estimate: {fmt(results?.totalPricePerMonth || 0)}
                                </div>
                            )}
                        </div>
                        <div className="bd-price-grid">
                            <div className="bd-price-item">
                                <span className="bd-price-label">Per Visit</span>
                                <span className="bd-price-amount">{fmt(results?.pricePerVisit || 0)}</span>
                            </div>
                            <div className="bd-price-item">
                                <span className="bd-price-label">Per Sq Ft</span>
                                <span className="bd-price-amount">${(results?.pricePerSqft || 0).toFixed(3)}</span>
                            </div>
                            <div className="bd-price-item">
                                <span className="bd-price-label">Hrs/Visit</span>
                                <span className="bd-price-amount">{(results?.hoursPerVisit || 0).toFixed(1)}</span>
                            </div>
                            <div className="bd-price-item">
                                <span className="bd-price-label">Visits/Mo</span>
                                <span className="bd-price-amount">{results?.visitsPerMonth || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Building details */}
                    <div className="bd-section">
                        <h3>Building Details</h3>
                        <div className="bd-details-grid">
                            <div className="bd-detail-item">
                                <span className="bd-detail-label">Building Type</span>
                                <span className="bd-detail-value">
                                    {buildingType?.icon} {buildingType?.name || "—"}
                                </span>
                            </div>
                            <div className="bd-detail-item">
                                <span className="bd-detail-label">Square Footage</span>
                                <span className="bd-detail-value">{(inputs?.sqft || 0).toLocaleString()} sq ft</span>
                            </div>
                            <div className="bd-detail-item">
                                <span className="bd-detail-label">Cleaning Frequency</span>
                                <span className="bd-detail-value">{frequency?.label || "—"}</span>
                            </div>
                            <div className="bd-detail-item">
                                <span className="bd-detail-label">State</span>
                                <span className="bd-detail-value">{bid.state || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bd-section">
                        <h3>Cost Breakdown</h3>
                        <div className="bd-breakdown">
                            <div className="bd-breakdown-row">
                                <span>Labor</span>
                                <span>{fmt(results?.laborCostPerMonth || 0)}</span>
                            </div>
                            <div className="bd-breakdown-row">
                                <span>Payroll Tax ({inputs?.payrollTaxPercent || 0}%)</span>
                                <span>{fmt(results?.payrollTaxCost || 0)}</span>
                            </div>
                            <div className="bd-breakdown-row">
                                <span>Supplies</span>
                                <span>{fmt(results?.supplyCostPerMonth || 0)}</span>
                            </div>
                            <div className="bd-breakdown-row">
                                <span>Overhead ({inputs?.overheadPercent || 0}%)</span>
                                <span>{fmt(results?.overheadCost || 0)}</span>
                            </div>
                            <div className="bd-breakdown-row bd-breakdown-subtotal">
                                <span>Total Cost</span>
                                <span>{fmt(results?.totalCostPerMonth || 0)}</span>
                            </div>
                            <div className="bd-breakdown-row bd-breakdown-profit">
                                <span>Profit ({inputs?.profitPercent || 0}%)</span>
                                <span>{fmt(results?.profitAmount || 0)}</span>
                            </div>
                            <div className="bd-breakdown-row bd-breakdown-total">
                                <span>Monthly Price</span>
                                <span>{fmt(results?.totalPricePerMonth || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cleaning Scope */}
                    <div className="bd-section">
                        <h3>Cleaning Scope</h3>
                        {roomScopes && roomScopes.length > 0 ? (
                            <div className="bd-room-scope">
                                {roomScopes.map((room) => {
                                    const roomType = ROOM_TYPES.find(r => r.id === room.roomTypeId);
                                    const roomTasks = CLEANING_TASKS.filter(t => room.tasks.includes(t.id));
                                    const totalCount = roomTasks.length + (room.customTasks?.length || 0);
                                    return (
                                        <div key={room.id} className="bd-room-group">
                                            <div className="bd-room-group-header">
                                                <span className="bd-room-icon">{roomType?.icon || "\ud83d\udce6"}</span>
                                                <span className="bd-room-name">{roomType?.name || room.customName || "Area"}</span>
                                                <span className="bd-room-task-count">{totalCount} tasks</span>
                                            </div>
                                            <div className="bd-room-task-list">
                                                {roomTasks.map(task => {
                                                    const taskFreq = room.taskFrequencies?.[task.id] || inputs?.frequency;
                                                    const freqOpt = taskFreq ? TASK_FREQUENCY_OPTIONS.find(o => o.value === taskFreq) : null;
                                                    const freqFallback = taskFreq ? FREQUENCIES.find(f => f.value === taskFreq) : null;
                                                    const freqLabel = freqOpt?.label || freqFallback?.label || null;
                                                    // Color-code by frequency intensity
                                                    const n = taskFreq ? parseFloat(taskFreq) : 0;
                                                    const freqStyle = n >= 5 ? { background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }  // daily (green)
                                                        : n >= 2 ? { background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }   // multi-weekly (blue)
                                                            : n >= 1 ? { background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }   // weekly (indigo)
                                                                : n >= 0.25 ? { background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" } // monthly (amber)
                                                                    : { background: "rgba(107, 114, 148, 0.12)", color: "#6b7294" };           // quarterly+ (gray)
                                                    return (
                                                        <div key={task.id} className="bd-task-item">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                            <div>
                                                                <span className="bd-task-name">{room.taskOverrides?.[task.id]?.name || task.name}</span>
                                                            </div>
                                                            {freqLabel && <span className="bd-task-freq" style={freqStyle}>{freqLabel}</span>}
                                                        </div>
                                                    );
                                                })}
                                                {room.customTasks?.map(ct => {
                                                    const ctFreq = ct.frequency || inputs?.frequency;
                                                    const ctFreqLabel = ctFreq ? (TASK_FREQUENCY_OPTIONS.find(o => o.value === ctFreq)?.label || FREQUENCIES.find(f => f.value === ctFreq)?.label) : null;
                                                    const cn = ctFreq ? parseFloat(ctFreq) : 0;
                                                    const ctStyle = cn >= 5 ? { background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }
                                                        : cn >= 2 ? { background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }
                                                            : cn >= 1 ? { background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }
                                                                : cn >= 0.25 ? { background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }
                                                                    : { background: "rgba(107, 114, 148, 0.12)", color: "#6b7294" };
                                                    return (
                                                        <div key={ct.id} className="bd-task-item bd-custom-task">
                                                            <span className="bd-custom-dot">●</span>
                                                            <div>
                                                                <span className="bd-task-name">{ct.name}</span>
                                                            </div>
                                                            {ctFreqLabel && <span className="bd-task-freq" style={ctStyle}>{ctFreqLabel}</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bd-tasks">
                                {CLEANING_TASKS.filter((t) => tasks?.includes(t.id)).map((task) => (
                                    <div key={task.id} className="bd-task-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <div>
                                            <span className="bd-task-name">{task.name}</span>
                                            <span className="bd-task-desc">{task.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="bd-sidebar">
                    {/* Status */}
                    <div className="bd-sidebar-card">
                        <h4>Status</h4>
                        <select
                            className="bd-status-select"
                            value={bid.status}
                            onChange={(e) => handleStatusChange(e.target.value as Bid["status"])}
                            style={{
                                color: STATUS_COLORS[bid.status],
                                borderColor: STATUS_COLORS[bid.status] + "40",
                            }}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
                        {(bid as any).sentAt && (
                            <p className="bd-sent-date">
                                Sent on {new Date((bid as any).sentAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* Contact */}
                    {contact && (
                        <div className="bd-sidebar-card">
                            <h4>Client</h4>
                            <div className="bd-contact-info">
                                <p className="bd-contact-name">{contact.name}</p>
                                <p className="bd-contact-company">{contact.company}</p>
                                {contact.email && <p className="bd-contact-detail">{contact.email}</p>}
                                {contact.phone && <p className="bd-contact-detail">{contact.phone}</p>}
                            </div>
                        </div>
                    )}

                    {/* Proposal Terms */}
                    <div className="bd-sidebar-card">
                        <div className="bd-terms-header" onClick={() => setTermsOpen(!termsOpen)}>
                            <h4>📋 Proposal Terms</h4>
                            <span className="bd-terms-toggle">{termsOpen ? "▾" : "▸"}</span>
                        </div>
                        {!termsOpen && localTerms && (
                            <div className="bd-terms-preview">
                                {localTerms.legalName && <p><strong>Entity:</strong> {localTerms.legalName}</p>}
                                {localTerms.cancellationPolicy && <p><strong>Cancel:</strong> {localTerms.cancellationPolicy.slice(0, 60)}…</p>}
                                {localTerms.contractTerm && <p><strong>Term:</strong> {localTerms.contractTerm}</p>}
                                <button className="bd-btn bd-btn-sm" onClick={(e) => { e.stopPropagation(); setTermsOpen(true); }}>
                                    Customize Terms
                                </button>
                            </div>
                        )}
                        {termsOpen && localTerms && (
                            <div className="bd-terms-editor">
                                {/* Text-based policy fields with toggles */}
                                {([
                                    ["legalName", "Legal Entity Name"],
                                    ["cancellationPolicy", "Cancellation Policy"],
                                    ["lateFeePolicy", "Late Fee / Payment Terms"],
                                    ["serviceGuarantee", "Service Guarantee"],
                                    ["equipmentDescription", "Equipment & Supplies"],
                                    ["employeeStatus", "Employee Status"],
                                    ["supervisionApproach", "Supervision & QC"],
                                    ["companyPhilosophy", "Company Philosophy"],
                                    ["specialServices", "Special Services"],
                                    ["contractTerm", "Contract Term"],
                                    ["additionalTerms", "Additional Terms"],
                                ] as [keyof ProposalTerms, string][]).map(([key, label]) => {
                                    const hasValue = !!(localTerms[key] as string);
                                    const companyDefault = (companyData[key] as string) || "";
                                    return (
                                        <div key={key} className="bd-term-field">
                                            <div className="bd-term-toggle-row">
                                                <label>{label}</label>
                                                <button
                                                    className={`bd-term-toggle ${hasValue ? "on" : ""}`}
                                                    onClick={() => {
                                                        if (hasValue) {
                                                            setLocalTerms({ ...localTerms, [key]: "" });
                                                        } else {
                                                            setLocalTerms({ ...localTerms, [key]: companyDefault || `[Enter ${label}]` });
                                                        }
                                                    }}
                                                    title={hasValue ? "Remove from proposal" : `Add from company profile${companyDefault ? "" : " (no default set)"}`}
                                                >
                                                    <span className="bd-term-toggle-dot" />
                                                </button>
                                            </div>
                                            {hasValue && (
                                                <textarea
                                                    value={(localTerms[key] as string) || ""}
                                                    onChange={(e) => setLocalTerms({ ...localTerms, [key]: e.target.value })}
                                                    rows={3}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                                {/* Boolean toggles */}
                                <div className="bd-term-field">
                                    <div className="bd-term-toggle-row">
                                        <label>Bonded & Insured</label>
                                        <button
                                            className={`bd-term-toggle ${localTerms.bonded ? "on" : ""}`}
                                            onClick={() => setLocalTerms({ ...localTerms, bonded: !localTerms.bonded })}
                                        >
                                            <span className="bd-term-toggle-dot" />
                                        </button>
                                    </div>
                                    {localTerms.bonded && (
                                        <div className="bd-term-inline">
                                            <label>Bond Amount</label>
                                            <input
                                                type="text"
                                                value={localTerms.bondAmount}
                                                onChange={(e) => setLocalTerms({ ...localTerms, bondAmount: e.target.value })}
                                                placeholder="e.g. $1,000,000"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="bd-term-field">
                                    <div className="bd-term-toggle-row">
                                        <label>Uniformed Personnel</label>
                                        <button
                                            className={`bd-term-toggle ${localTerms.uniformedPersonnel ? "on" : ""}`}
                                            onClick={() => setLocalTerms({ ...localTerms, uniformedPersonnel: !localTerms.uniformedPersonnel })}
                                        >
                                            <span className="bd-term-toggle-dot" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bd-terms-actions">
                                    <button className="bd-btn bd-btn-primary bd-btn-sm" disabled={termsSaving}
                                        onClick={() => saveTerms(localTerms)}>
                                        {termsSaving ? "Saving…" : "Save Terms"}
                                    </button>
                                    <button className="bd-btn bd-btn-secondary bd-btn-sm" onClick={resetTermsToDefaults}>
                                        Reset to Defaults
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Version History */}
                    {versions.length > 0 && (
                        <div className="bd-sidebar-card">
                            <h4>Version History</h4>
                            <div className="bd-versions">
                                <div
                                    className={`bd-version-item ${viewingVersion === null ? "active" : ""}`}
                                    onClick={() => setViewingVersion(null)}
                                >
                                    <span className="bd-version-num">v{currentVersion}</span>
                                    <span className="bd-version-date">Current</span>
                                    <span className="bd-version-price">{fmt(bid.results?.totalPricePerMonth || 0)}</span>
                                </div>
                                {[...versions].reverse().map((v: any) => (
                                    <div
                                        key={v.version}
                                        className={`bd-version-item ${viewingVersion === v.version ? "active" : ""}`}
                                        onClick={() => setViewingVersion(v.version)}
                                    >
                                        <span className="bd-version-num">v{v.version}</span>
                                        <span className="bd-version-date">
                                            {new Date(v.savedAt).toLocaleDateString()}
                                        </span>
                                        <span className="bd-version-price">
                                            {fmt(v.results?.totalPricePerMonth || 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Danger zone */}
                    <div className="bd-sidebar-card bd-danger-zone">
                        <h4>Danger Zone</h4>
                        <button className="bd-btn bd-btn-danger" onClick={handleDelete}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete Bid
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Proposal Preview Modal ─── */}
            {previewUrl && (
                <div className="bd-preview-overlay" onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}>
                    <div className="bd-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="bd-preview-header">
                            <span>Proposal Preview (Draft)</span>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button className="bd-btn bd-btn-primary bd-btn-sm" onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); handleDownloadPdf(); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download PDF
                                </button>
                                <button className="bd-btn bd-btn-secondary bd-btn-sm" onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}>
                                    ✕ Close
                                </button>
                            </div>
                        </div>
                        <iframe src={previewUrl} className="bd-preview-iframe" title="Proposal Preview" />
                    </div>
                </div>
            )}
        </div>
    );
}

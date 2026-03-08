import { useState, useEffect, useCallback, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import AddressAutocomplete, { type StructuredAddress, EMPTY_ADDRESS } from "../components/AddressAutocomplete";
import "./CompanyInfo.css";

/* ─── Types ─── */
interface CompanyData {
    /* Step 1 – General */
    legalName: string;
    dba: string;
    entityType: string;
    phone: string;
    email: string;
    website: string;
    address: StructuredAddress;
    logoUrl: string;
    /* Step 2 – Invoicing */
    paymentTerms: string;
    invoicingSchedule: string;
    paymentMethods: string[];
    lateFeePolicy: string;
    specialServices: string;
    /* Step 3 – Insurance */
    insuranceDocs: { coi: string; workersComp: string };
    bonded: boolean;
    bondAmount: string;
    licenses: string;
    /* Step 4 – Operations */
    suppliesPolicy: string;
    suppliesWeProvide: string;
    suppliesCustomerProvides: string;
    equipmentDescription: string;
    employeeStatus: string;
    supervisionApproach: string;
    uniformedPersonnel: boolean;
    /* Step 5 – Policies */
    companyPhilosophy: string;
    cancellationPolicy: string;
    contractTerm: string;
    serviceGuarantee: string;
    additionalTerms: string;
    /* Meta */
    setupComplete: boolean;
    setupStep: number;
}

const EMPTY: CompanyData = {
    legalName: "", dba: "", entityType: "", phone: "", email: "", website: "",
    address: { ...EMPTY_ADDRESS }, logoUrl: "",
    paymentTerms: "", invoicingSchedule: "", paymentMethods: [], lateFeePolicy: "", specialServices: "",
    insuranceDocs: { coi: "", workersComp: "" }, bonded: false, bondAmount: "", licenses: "",
    suppliesPolicy: "", suppliesWeProvide: "", suppliesCustomerProvides: "", equipmentDescription: "", employeeStatus: "", supervisionApproach: "", uniformedPersonnel: false,
    companyPhilosophy: "", cancellationPolicy: "", contractTerm: "", serviceGuarantee: "", additionalTerms: "",
    setupComplete: false, setupStep: 1,
};

const STEPS = [
    { id: 1, title: "General Information", subtitle: "Your company identity for proposals", icon: "🏢" },
    { id: 2, title: "Service & Invoicing", subtitle: "How you bill and what extras you offer", icon: "💰" },
    { id: 3, title: "Insurance & Compliance", subtitle: "Credibility docs your clients expect", icon: "🛡️" },
    { id: 4, title: "Operations & Equipment", subtitle: "How your team runs the job", icon: "🔧" },
    { id: 5, title: "Policies & Agreement", subtitle: "Terms that go into every proposal", icon: "📋" },
];

const ENTITY_TYPES = [
    { value: "", label: "Select entity type..." },
    { value: "llc", label: "LLC" },
    { value: "corp", label: "Corporation" },
    { value: "sole_proprietor", label: "Sole Proprietor" },
    { value: "partnership", label: "Partnership" },
    { value: "s_corp", label: "S-Corp" },
];

const PAYMENT_TERMS = [
    { value: "", label: "Select payment terms..." },
    { value: "due_on_receipt", label: "Due on Receipt" },
    { value: "net_15", label: "Net 15" },
    { value: "net_30", label: "Net 30" },
    { value: "net_45", label: "Net 45" },
    { value: "net_60", label: "Net 60" },
];

const INVOICING_SCHEDULES = [
    { value: "", label: "Select schedule..." },
    { value: "monthly", label: "Monthly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "per_service", label: "Per Service" },
    { value: "weekly", label: "Weekly" },
];

const PAYMENT_METHODS_LIST = [
    { value: "check", label: "Check" },
    { value: "ach", label: "ACH / Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "zelle", label: "Zelle" },
    { value: "venmo", label: "Venmo" },
    { value: "cash", label: "Cash" },
];

const SUPPLIES_OPTIONS = [
    { value: "", label: "Select supplies policy..." },
    { value: "we_provide", label: "We provide all supplies" },
    { value: "customer_provides", label: "Customer provides supplies" },
    { value: "both", label: "Shared — we provide some, customer provides some" },
];

const CONTRACT_TERMS = [
    { value: "", label: "Select contract term..." },
    { value: "month_to_month", label: "Month-to-Month" },
    { value: "6_months", label: "6 Months" },
    { value: "1_year", label: "1 Year (auto-renew)" },
    { value: "2_years", label: "2 Years" },
];

/** Format digits → (xxx) xxx-xxxx */
function fmtPhone(raw: string): string {
    const d = raw.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/* ─── AI Generation ─── */
const SYSTEM_CONSTRAINT = `CRITICAL RULES:
- Use ONLY the keywords the user provided. Do NOT add, invent, or substitute services, policies, or details that the user did not mention.
- If the user typed "floor care", write about floor care ONLY — do NOT add window cleaning, pressure washing, or anything else.
- Keep the tone professional and suitable for a commercial janitorial service proposal.
- Write in 2-3 concise sentences unless specified otherwise.
- Do NOT use bullet points or numbered lists — write in paragraph form.`;

const AI_PROMPTS: Record<string, { label: string; placeholder: string; recommendations: { title: string; text: string }[]; prompt: (companyName: string, keywords: string) => string }> = {
    employeeStatus: {
        label: "Employee Status Statement",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "W-2 Employees + Background Checks", text: "All cleaning personnel are W-2 employees of our company — not independent contractors or subcontractors. Each employee undergoes a thorough background check and screening process prior to placement at any client facility." },
            { title: "W-2 Employees + Drug & Background", text: "Our cleaning staff are full W-2 employees who undergo comprehensive background checks and pre-employment drug screening. We maintain full liability and workers' compensation coverage for all personnel assigned to your facility." },
            { title: "Bonded & Insured Staff", text: "All personnel are direct employees of our company, fully bonded and insured. Each team member is vetted through background checks and trained on facility-specific protocols before assignment." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 2-3 sentence employee status statement for "${n}". The user provided EXACTLY these keywords: "${kw}". Use ONLY these keywords. Do not add details or classifications the user did not provide.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a professional 2-3 sentence employee status statement for a janitorial company named "${n}". State that cleaning personnel are employees of the company (not subcontractors). Keep it generic — do not assume specific screening processes unless told.`,
    },
    supervisionApproach: {
        label: "Supervision & Quality Control",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "Nightly Checklists + Monthly Inspections", text: "Our team leads complete nightly cleaning checklists to ensure every task is performed to standard. A dedicated account manager conducts monthly on-site inspections and reviews results directly with the client." },
            { title: "Weekly Supervisor Walkthroughs", text: "A field supervisor performs weekly walkthroughs of your facility to verify cleaning quality and address any concerns in real time. Detailed inspection reports are provided to management upon request." },
            { title: "Digital Tracking + Spot Inspections", text: "We use a digital time-tracking and task-verification system so every cleaning visit is logged and documented. Random spot inspections are conducted to maintain our quality standards." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 2-3 sentence supervision and quality control statement for "${n}". The user provided EXACTLY these keywords: "${kw}". Describe ONLY the supervision methods the user listed. Do NOT add inspection types, reporting tools, or oversight methods that were not mentioned.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a professional 2-3 sentence supervision statement for "${n}", a janitorial company. Mention general management oversight and quality assurance. Keep it high-level.`,
    },
    companyPhilosophy: {
        label: "Company Philosophy",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "Quality & Reliability First", text: "We believe that a clean facility reflects the professionalism of everyone who works in it. Our commitment is to deliver reliable, high-quality cleaning services that our clients can count on every single day." },
            { title: "Customer-Centered Service", text: "Our philosophy is simple: treat every client's facility as if it were our own. We build lasting partnerships through transparent communication, consistent results, and a genuine commitment to exceeding expectations." },
            { title: "Detail-Oriented Excellence", text: "We are dedicated to the details that others overlook. Our team takes pride in delivering meticulous cleaning services that create healthier, more productive environments for our clients and their employees." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 2-3 sentence company philosophy for "${n}". The user wants the philosophy to focus on EXACTLY these themes: "${kw}". Use ONLY these values/themes. Do NOT add values or ideals the user did not list.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a professional 2-3 sentence company philosophy for "${n}", a janitorial services company. Keep it about customer satisfaction and quality.`,
    },
    cancellationPolicy: {
        label: "Cancellation Policy",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "30-Day Written Notice", text: "Either party may cancel this agreement with 30 days' written notice. All services rendered through the cancellation date will be invoiced and payable per the agreed-upon terms." },
            { title: "60-Day Written Notice", text: "This agreement may be terminated by either party with 60 days' written notice. The client is responsible for payment of all services provided through the effective cancellation date." },
            { title: "30-Day Notice + Early Termination Fee", text: "Either party may cancel with 30 days' written notice. Cancellation prior to the end of the initial contract term may be subject to an early termination fee equal to one month's service charge." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 1-2 sentence cancellation policy for "${n}". The user specified EXACTLY these terms: "${kw}". Use ONLY these terms — do not change the notice period, conditions, or method unless the user stated them.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a standard 1-2 sentence cancellation policy for "${n}", a janitorial company. Use 30-day written notice as the standard.`,
    },
    serviceGuarantee: {
        label: "Service Guarantee",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "Same-Day Response + Re-Clean", text: "If you are ever dissatisfied with our service, contact us and we will respond within the same business day. We will promptly re-clean any areas that do not meet your expectations at no additional charge." },
            { title: "24-Hour Resolution Guarantee", text: "We guarantee a response to any service concern within 24 hours. Our team will return to your facility to address and resolve the issue to your complete satisfaction, free of charge." },
            { title: "100% Satisfaction Guarantee", text: "Your satisfaction is guaranteed. If any aspect of our cleaning does not meet the agreed-upon standards, we will re-service the affected areas within 24 hours at no cost to you." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 2-3 sentence service guarantee for "${n}". The user specified EXACTLY these terms: "${kw}". Write ONLY about the guarantees the user mentioned. Do NOT add response times, remedies, or commitments the user did not specify.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a professional 2-3 sentence service guarantee for "${n}", a janitorial company. Mention responsiveness to concerns and willingness to address issues promptly.`,
    },
    lateFeePolicy: {
        label: "Late Fee Policy",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "1.5% Monthly After 30 Days", text: "Invoices not paid within 30 days of the invoice date are subject to a late fee of 1.5% per month on the outstanding balance until paid in full." },
            { title: "2% Monthly After 15 Days", text: "A late fee of 2% per month will be applied to any invoice balance not received within 15 days of the invoice date." },
            { title: "No Late Fees (Grace Period)", text: "We offer a 30-day grace period on all invoices. We kindly request prompt payment but do not charge late fees, as we value our ongoing client relationships." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 1-2 sentence late fee policy for "${n}". The user specified EXACTLY these terms: "${kw}". Use ONLY the rate, timeframe, and conditions the user provided. Do NOT change the percentage or due period.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a standard 1-2 sentence late fee policy for "${n}", a janitorial company. Use 1.5% per month after 30 days past due as the standard.`,
    },
    equipmentDescription: {
        label: "Equipment & Supplies Description",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "Full Commercial Equipment", text: "We provide all commercial-grade cleaning equipment including HEPA-filtered vacuums, microfiber systems, and auto-scrubbers. All equipment is regularly maintained and inspected to ensure peak performance." },
            { title: "Green Cleaning Equipment", text: "Our team uses environmentally friendly cleaning products paired with HEPA vacuums, microfiber cloths, and low-emission equipment. We are committed to reducing environmental impact while maintaining superior cleaning results." },
            { title: "Basic Equipment Provided", text: "We supply all necessary cleaning equipment and tools for daily janitorial services. Specialty equipment for periodic deep-cleaning tasks such as floor care is also available and included as needed." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 2-3 sentence equipment description for "${n}". The user listed EXACTLY this equipment: "${kw}". Mention ONLY the items the user listed — do NOT add equipment types, brands, or tools the user did not specify.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a professional 2-3 sentence equipment description for "${n}", a janitorial company. Mention that the company provides and maintains commercial-grade cleaning equipment. Keep it general.`,
    },
    specialServices: {
        label: "Special Services Offered",
        placeholder: "Select a recommendation, type your own, or click Generate…",
        recommendations: [
            { title: "Floor Care Services", text: "We offer professional floor care services including stripping, waxing, buffing, and sealing for VCT, hardwood, and concrete surfaces. These services are available upon request and quoted separately." },
            { title: "Carpet & Upholstery Cleaning", text: "Professional carpet cleaning, spot treatment, and upholstery care are available as add-on services. We use hot-water extraction methods for deep cleaning, quoted separately based on square footage." },
            { title: "Post-Construction Cleanup", text: "We provide comprehensive post-construction and renovation cleanup services including dust removal, debris clearing, and detail cleaning of all surfaces. These projects are quoted individually based on scope." },
        ],
        prompt: (n, kw) => kw
            ? `${SYSTEM_CONSTRAINT}\n\nWrite a 2-3 sentence special services description for "${n}". The user listed EXACTLY these services: "${kw}". Describe ONLY the services listed — do NOT add carpet cleaning, window washing, pressure washing, or any other service the user did not type. Mention they are available upon request and quoted separately.`
            : `${SYSTEM_CONSTRAINT}\n\nWrite a professional 2-3 sentence description stating that "${n}" offers additional specialty cleaning services available upon request and quoted separately. Do not list specific services.`,
    },
};

async function generateWithAI(prompt: string): Promise<string> {
    // Call Gemini Flash 2.0 via the Google AI API
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return "[Set VITE_GEMINI_API_KEY in .env to enable AI generation]";
    try {
        const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
        );
        const json = await resp.json();
        return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch {
        return "[AI generation failed — enter text manually]";
    }
}

/* ─── AI Textarea Component with Recommendations ─── */
function AITextarea({
    fieldKey, value, onChange, companyName,
}: {
    fieldKey: string; value: string; onChange: (v: string) => void; companyName: string;
}) {
    const meta = AI_PROMPTS[fieldKey];
    const [generating, setGenerating] = useState(false);
    const [selectedRec, setSelectedRec] = useState<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea to fit content
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }
    }, [value]);

    const handleGenerate = async () => {
        setGenerating(true);
        const keywords = value.trim();
        const fullPrompt = meta.prompt(companyName, keywords);
        const result = await generateWithAI(fullPrompt);
        onChange(result);
        setSelectedRec(null);
        setGenerating(false);
    };

    const handleSelectRec = (idx: number) => {
        const rec = meta.recommendations[idx];
        if (selectedRec === idx) {
            // Deselect
            setSelectedRec(null);
            onChange("");
        } else {
            setSelectedRec(idx);
            onChange(rec.text);
        }
    };

    // If text was manually edited away from the recommendation, clear selection
    const activeRecText = selectedRec !== null ? meta.recommendations[selectedRec]?.text : null;
    if (selectedRec !== null && value !== activeRecText) {
        // User edited — keep text but clear highlight (will run on next render)
    }

    return (
        <div className="ci-field">
            <label>{meta.label}</label>

            {/* Recommendation chips */}
            <div className="ci-rec-chips">
                <span className="ci-rec-label">Recommended:</span>
                {meta.recommendations.map((rec, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`ci-rec-chip ${value === rec.text ? "active" : ""}`}
                        onClick={() => handleSelectRec(idx)}
                        title={rec.text}
                    >
                        {value === rec.text && <span className="ci-rec-check">✓</span>}
                        {rec.title}
                    </button>
                ))}
            </div>

            {/* Textarea + Generate */}
            <div className="ci-ai-group">
                <textarea
                    ref={textareaRef}
                    className="ci-textarea"
                    value={value}
                    onChange={(e) => { onChange(e.target.value); setSelectedRec(null); }}
                    placeholder={meta.placeholder}
                    rows={4}
                />
                <button
                    type="button"
                    className="ci-ai-btn"
                    onClick={handleGenerate}
                    disabled={generating}
                    title="Generate with AI — uses your text as keywords"
                >
                    {generating ? (
                        <span className="ci-ai-spinner" />
                    ) : (
                        <>✨ Generate</>
                    )}
                </button>
            </div>
        </div>
    );
}

/* ─── File Upload Component ─── */
function FileUpload({
    label, currentUrl, accept, onUpload,
}: {
    label: string; currentUrl: string; accept: string;
    onUpload: (file: File) => Promise<void>;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        await onUpload(file);
        setUploading(false);
        e.target.value = "";
    };

    return (
        <div className="ci-field">
            <label>{label}</label>
            <div className="ci-file-upload" onClick={() => !uploading && inputRef.current?.click()}>
                {currentUrl ? (
                    <div className="ci-file-uploaded">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>Document uploaded</span>
                        <button type="button" className="ci-file-replace" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                            Replace
                        </button>
                        <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="ci-file-view"
                            onClick={(e) => e.stopPropagation()}>
                            View ↗
                        </a>
                    </div>
                ) : (
                    <div className="ci-file-empty">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span>{uploading ? "Uploading..." : "Click to upload PDF"}</span>
                    </div>
                )}
            </div>
            <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={handleChange} />
        </div>
    );
}

/* ═══════════════════════════════════════════ */
/* ─── Main Component ─── */
/* ═══════════════════════════════════════════ */
export default function CompanyInfo() {
    const { profile } = useAuth();
    const companyId = profile?.companyId;
    const [data, setData] = useState<CompanyData>({ ...EMPTY });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1);
    const [editingSection, setEditingSection] = useState<number | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    /* ─── Load company data ─── */
    useEffect(() => {
        if (!companyId) return;
        getDoc(doc(db, "companies", companyId)).then((snap) => {
            if (snap.exists()) {
                const d = snap.data();
                setData({
                    legalName: d.legalName || d.name || "",
                    dba: d.dba || "",
                    entityType: d.entityType || "",
                    phone: d.phone || "",
                    email: d.email || "",
                    website: d.website || "",
                    address: {
                        address: d.address?.address || "",
                        city: d.address?.city || "",
                        state: d.address?.state || "",
                        zip: d.address?.zip || "",
                    },
                    logoUrl: d.logoUrl || "",
                    paymentTerms: d.paymentTerms || "",
                    invoicingSchedule: d.invoicingSchedule || "",
                    paymentMethods: d.paymentMethods || [],
                    lateFeePolicy: d.lateFeePolicy || "",
                    specialServices: d.specialServices || "",
                    insuranceDocs: {
                        coi: d.insuranceDocs?.coi || "",
                        workersComp: d.insuranceDocs?.workersComp || "",
                    },
                    bonded: d.bonded || false,
                    bondAmount: d.bondAmount || "",
                    licenses: d.licenses || "",
                    suppliesPolicy: d.suppliesPolicy || "",
                    suppliesWeProvide: d.suppliesWeProvide || "",
                    suppliesCustomerProvides: d.suppliesCustomerProvides || "",
                    equipmentDescription: d.equipmentDescription || "",
                    employeeStatus: d.employeeStatus || "",
                    supervisionApproach: d.supervisionApproach || "",
                    uniformedPersonnel: d.uniformedPersonnel || false,
                    companyPhilosophy: d.companyPhilosophy || "",
                    cancellationPolicy: d.cancellationPolicy || "",
                    contractTerm: d.contractTerm || "",
                    serviceGuarantee: d.serviceGuarantee || "",
                    additionalTerms: d.additionalTerms || "",
                    setupComplete: d.setupComplete || false,
                    setupStep: d.setupStep || 1,
                });
                setStep(d.setupStep || 1);
            }
            setLoading(false);
        });
    }, [companyId]);

    /* ─── Helpers ─── */
    const set = useCallback(<K extends keyof CompanyData>(key: K, val: CompanyData[K]) => {
        setData((prev) => ({ ...prev, [key]: val }));
    }, []);

    const saveStep = useCallback(async (nextStep?: number, complete?: boolean) => {
        if (!companyId) return;
        setSaving(true);
        const update: Record<string, unknown> = { ...data };
        // Also keep `name` field for backward compat
        update.name = data.dba || data.legalName;
        if (nextStep != null) { update.setupStep = nextStep; setStep(nextStep); }
        if (complete) { update.setupComplete = true; setData((p) => ({ ...p, setupComplete: true })); }
        await updateDoc(doc(db, "companies", companyId), update);
        setSaving(false);
    }, [companyId, data]);

    const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !companyId) return;
        const storageRef = ref(storage, `companies/${companyId}/logo.${file.name.split(".").pop()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        set("logoUrl", url);
        await updateDoc(doc(db, "companies", companyId), { logoUrl: url });
    }, [companyId, set]);

    const handleInsuranceUpload = useCallback(async (type: "coi" | "workersComp", file: File) => {
        if (!companyId) return;
        const storageRef = ref(storage, `companies/${companyId}/insurance/${type}.${file.name.split(".").pop()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setData((prev) => ({
            ...prev,
            insuranceDocs: { ...prev.insuranceDocs, [type]: url },
        }));
        await updateDoc(doc(db, "companies", companyId), {
            [`insuranceDocs.${type}`]: url,
        });
    }, [companyId]);

    const togglePaymentMethod = useCallback((method: string) => {
        setData((prev) => {
            const methods = prev.paymentMethods.includes(method)
                ? prev.paymentMethods.filter((m) => m !== method)
                : [...prev.paymentMethods, method];
            return { ...prev, paymentMethods: methods };
        });
    }, []);

    const companyDisplayName = data.dba || data.legalName || "your company";

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="ci-page">
                <div className="ci-loading"><div className="ci-loading-spinner" /></div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════ */
    /* ─── WIZARD MODE ─── */
    /* ═══════════════════════════════════════════ */
    if (!data.setupComplete) {
        return (
            <div className="ci-page ci-wizard">
                {/* Progress bar */}
                <div className="ci-progress">
                    {STEPS.map((s) => (
                        <div
                            key={s.id}
                            className={`ci-progress-step ${step === s.id ? "active" : ""} ${step > s.id ? "done" : ""}`}
                            onClick={() => { if (s.id <= step) setStep(s.id); }}
                        >
                            <div className="ci-progress-dot">
                                {step > s.id ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : s.id}
                            </div>
                            <span className="ci-progress-label">{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Step header */}
                <div className="ci-step-header">
                    <span className="ci-step-icon">{STEPS[step - 1].icon}</span>
                    <h1>{STEPS[step - 1].title}</h1>
                    <p>{STEPS[step - 1].subtitle}</p>
                </div>

                {/* Step content */}
                <div className="ci-step-body">
                    {step === 1 && <Step1General data={data} set={set} logoInputRef={logoInputRef} handleLogoUpload={handleLogoUpload} />}
                    {step === 2 && <Step2Invoicing data={data} set={set} togglePaymentMethod={togglePaymentMethod} companyName={companyDisplayName} />}
                    {step === 3 && <Step3Insurance data={data} set={set} handleInsuranceUpload={handleInsuranceUpload} />}
                    {step === 4 && <Step4Operations data={data} set={set} companyName={companyDisplayName} />}
                    {step === 5 && <Step5Policies data={data} set={set} companyName={companyDisplayName} />}
                </div>

                {/* Navigation */}
                <div className="ci-step-nav">
                    {step > 1 && (
                        <button className="ci-btn ci-btn-outline" onClick={() => setStep(step - 1)}>
                            ← Back
                        </button>
                    )}
                    <div className="ci-step-nav-right">
                        {step < 5 && (
                            <button className="ci-btn ci-btn-ghost" onClick={() => { saveStep(step + 1); }}>
                                Skip for now
                            </button>
                        )}
                        {step < 5 ? (
                            <button className="ci-btn ci-btn-primary" onClick={() => saveStep(step + 1)} disabled={saving}>
                                {saving ? "Saving..." : "Continue →"}
                            </button>
                        ) : (
                            <button className="ci-btn ci-btn-primary" onClick={() => saveStep(undefined, true)} disabled={saving}>
                                {saving ? "Saving..." : "Complete Setup ✓"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════ */
    /* ─── SECTION VIEW (Post-Setup) ─── */
    /* ═══════════════════════════════════════════ */
    return (
        <div className="ci-page ci-sections">
            <div className="ci-sections-header">
                <div>
                    <h1>Company Information</h1>
                    <p className="ci-sections-subtitle">Manage the details that appear in your proposals</p>
                </div>
                <button className="ci-btn ci-btn-outline" onClick={() => {
                    setData((p) => ({ ...p, setupComplete: false }));
                    setStep(1);
                }}>
                    🔄 Re-run Setup Wizard
                </button>
            </div>

            {STEPS.map((s) => (
                <section key={s.id} className={`ci-section-card ${editingSection === s.id ? "editing" : ""}`}>
                    <div className="ci-section-card-header" onClick={() => setEditingSection(editingSection === s.id ? null : s.id)}>
                        <span className="ci-section-icon">{s.icon}</span>
                        <div>
                            <h2>{s.title}</h2>
                            <p>{s.subtitle}</p>
                        </div>
                        <span className="ci-section-toggle">{editingSection === s.id ? "▲" : "▼"}</span>
                    </div>
                    {editingSection === s.id && (
                        <div className="ci-section-card-body">
                            {s.id === 1 && <Step1General data={data} set={set} logoInputRef={logoInputRef} handleLogoUpload={handleLogoUpload} />}
                            {s.id === 2 && <Step2Invoicing data={data} set={set} togglePaymentMethod={togglePaymentMethod} companyName={companyDisplayName} />}
                            {s.id === 3 && <Step3Insurance data={data} set={set} handleInsuranceUpload={handleInsuranceUpload} />}
                            {s.id === 4 && <Step4Operations data={data} set={set} companyName={companyDisplayName} />}
                            {s.id === 5 && <Step5Policies data={data} set={set} companyName={companyDisplayName} />}

                            <button className="ci-btn ci-btn-primary ci-section-save" onClick={() => { saveStep(); setEditingSection(null); }} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </section>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════ */
/* ─── Step Components ─── */
/* ═══════════════════════════════════════════════════════ */

type SetFn = <K extends keyof CompanyData>(key: K, val: CompanyData[K]) => void;

/* ─── Step 1: General ─── */
function Step1General({ data, set, logoInputRef, handleLogoUpload }: {
    data: CompanyData; set: SetFn;
    logoInputRef: React.RefObject<HTMLInputElement | null>;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <>
            <div className="ci-field-row">
                <div className="ci-field ci-field-flex">
                    <label>Legal Entity Name *</label>
                    <input className="ci-input" value={data.legalName} onChange={(e) => set("legalName", e.target.value)}
                        placeholder="Greenbranch Cleaning Service LLC" />
                </div>
                <div className="ci-field ci-field-flex">
                    <label>DBA (Doing Business As)</label>
                    <input className="ci-input" value={data.dba} onChange={(e) => set("dba", e.target.value)}
                        placeholder="Optional trade name" />
                </div>
            </div>
            <div className="ci-field-row">
                <div className="ci-field ci-field-flex">
                    <label>Entity Type</label>
                    <select className="ci-select" value={data.entityType} onChange={(e) => set("entityType", e.target.value)}>
                        {ENTITY_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div className="ci-field ci-field-flex">
                    <label>Phone</label>
                    <input className="ci-input" value={data.phone}
                        onChange={(e) => set("phone", fmtPhone(e.target.value))}
                        placeholder="(555) 123-4567" />
                </div>
            </div>
            <div className="ci-field-row">
                <div className="ci-field ci-field-flex">
                    <label>Email</label>
                    <input className="ci-input" type="email" value={data.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="info@yourcompany.com" />
                </div>
                <div className="ci-field ci-field-flex">
                    <label>Website</label>
                    <input className="ci-input" value={data.website}
                        onChange={(e) => set("website", e.target.value)}
                        placeholder="www.yourcompany.com" />
                </div>
            </div>
            <div className="ci-field">
                <label>Address</label>
                <AddressAutocomplete
                    value={data.address}
                    onChange={(addr) => set("address", addr)}
                />
            </div>
            {/* Logo */}
            <div className="ci-field">
                <label>Company Logo</label>
                <div className="ci-logo-upload" onClick={() => logoInputRef.current?.click()}>
                    {data.logoUrl ? (
                        <img src={data.logoUrl} alt="Logo" className="ci-logo-preview" />
                    ) : (
                        <div className="ci-logo-placeholder">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span>Upload Logo</span>
                        </div>
                    )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                <span className="ci-hint">PNG or JPG, max 5MB. Used on proposal cover page.</span>
            </div>
        </>
    );
}

/* ─── Step 2: Invoicing ─── */
function Step2Invoicing({ data, set, togglePaymentMethod, companyName }: {
    data: CompanyData; set: SetFn; togglePaymentMethod: (m: string) => void; companyName: string;
}) {
    return (
        <>
            <div className="ci-field-row">
                <div className="ci-field ci-field-flex">
                    <label>Payment Terms</label>
                    <select className="ci-select" value={data.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)}>
                        {PAYMENT_TERMS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div className="ci-field ci-field-flex">
                    <label>Invoicing Schedule</label>
                    <select className="ci-select" value={data.invoicingSchedule} onChange={(e) => set("invoicingSchedule", e.target.value)}>
                        {INVOICING_SCHEDULES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="ci-field">
                <label>Accepted Payment Methods</label>
                <div className="ci-chip-group">
                    {PAYMENT_METHODS_LIST.map((m) => (
                        <button key={m.value} type="button"
                            className={`ci-chip ${data.paymentMethods.includes(m.value) ? "active" : ""}`}
                            onClick={() => togglePaymentMethod(m.value)}>
                            {data.paymentMethods.includes(m.value) ? "✓ " : ""}{m.label}
                        </button>
                    ))}
                </div>
            </div>
            <AITextarea fieldKey="lateFeePolicy" value={data.lateFeePolicy} onChange={(v) => set("lateFeePolicy", v)} companyName={companyName} />
            <AITextarea fieldKey="specialServices" value={data.specialServices} onChange={(v) => set("specialServices", v)} companyName={companyName} />
        </>
    );
}

/* ─── Step 3: Insurance ─── */
function Step3Insurance({ data, set, handleInsuranceUpload }: {
    data: CompanyData; set: SetFn;
    handleInsuranceUpload: (type: "coi" | "workersComp", file: File) => Promise<void>;
}) {
    return (
        <>
            <div className="ci-field-row">
                <FileUpload
                    label="General Liability (COI / ACORD)"
                    currentUrl={data.insuranceDocs.coi}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onUpload={(f) => handleInsuranceUpload("coi", f)}
                />
                <FileUpload
                    label="Worker's Compensation"
                    currentUrl={data.insuranceDocs.workersComp}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onUpload={(f) => handleInsuranceUpload("workersComp", f)}
                />
            </div>
            <div className="ci-field-row">
                <div className="ci-field ci-field-flex">
                    <label>Bonded?</label>
                    <div className="ci-toggle-row">
                        <button type="button" className={`ci-toggle-btn ${data.bonded === true ? "active" : ""}`}
                            onClick={() => set("bonded", true)}>
                            Yes
                        </button>
                        <button type="button" className={`ci-toggle-btn ${data.bonded === false ? "active" : ""}`}
                            onClick={() => set("bonded", false)}>
                            No
                        </button>
                        {data.bonded && (
                            <input className="ci-input ci-bond-input" value={data.bondAmount}
                                onChange={(e) => set("bondAmount", e.target.value)}
                                placeholder="Bond amount (e.g. $10,000)" />
                        )}
                    </div>
                </div>
            </div>
            <div className="ci-field">
                <label>Licenses & Certifications</label>
                <textarea className="ci-textarea" value={data.licenses}
                    onChange={(e) => set("licenses", e.target.value)}
                    placeholder="State license numbers, certifications (e.g. ISSA CIMS, Green Seal)" rows={3} />
            </div>
        </>
    );
}

/* ─── Step 4: Operations ─── */
function Step4Operations({ data, set, companyName }: {
    data: CompanyData; set: SetFn; companyName: string;
}) {
    return (
        <>
            <div className="ci-field">
                <label>Supplies Policy</label>
                <select className="ci-select" value={data.suppliesPolicy} onChange={(e) => set("suppliesPolicy", e.target.value)}>
                    {SUPPLIES_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            {data.suppliesPolicy === "both" && (
                <div className="ci-field-row">
                    <div className="ci-field">
                        <label>We Provide</label>
                        <textarea className="ci-textarea" value={data.suppliesWeProvide}
                            onChange={(e) => set("suppliesWeProvide", e.target.value)}
                            placeholder="e.g. chemicals, trash liners, paper towels…" rows={2} />
                    </div>
                    <div className="ci-field">
                        <label>Customer Provides</label>
                        <textarea className="ci-textarea" value={data.suppliesCustomerProvides}
                            onChange={(e) => set("suppliesCustomerProvides", e.target.value)}
                            placeholder="e.g. hand soap, toilet paper, specialty items…" rows={2} />
                    </div>
                </div>
            )}
            <div className="ci-field ci-field-flex">
                <label>Uniformed Personnel?</label>
                <div className="ci-toggle-row">
                    <button type="button" className={`ci-toggle-btn ${data.uniformedPersonnel === true ? "active" : ""}`}
                        onClick={() => set("uniformedPersonnel", true)}>
                        Yes
                    </button>
                    <button type="button" className={`ci-toggle-btn ${data.uniformedPersonnel === false ? "active" : ""}`}
                        onClick={() => set("uniformedPersonnel", false)}>
                        No
                    </button>
                </div>
            </div>
            <AITextarea fieldKey="equipmentDescription" value={data.equipmentDescription} onChange={(v) => set("equipmentDescription", v)} companyName={companyName} />
            <AITextarea fieldKey="employeeStatus" value={data.employeeStatus} onChange={(v) => set("employeeStatus", v)} companyName={companyName} />
            <AITextarea fieldKey="supervisionApproach" value={data.supervisionApproach} onChange={(v) => set("supervisionApproach", v)} companyName={companyName} />
        </>
    );
}

/* ─── Step 5: Policies ─── */
function Step5Policies({ data, set, companyName }: {
    data: CompanyData; set: SetFn; companyName: string;
}) {
    return (
        <>
            <AITextarea fieldKey="companyPhilosophy" value={data.companyPhilosophy} onChange={(v) => set("companyPhilosophy", v)} companyName={companyName} />
            <div className="ci-field-row">
                <div className="ci-field ci-field-flex">
                    <label>Contract Term</label>
                    <select className="ci-select" value={data.contractTerm} onChange={(e) => set("contractTerm", e.target.value)}>
                        {CONTRACT_TERMS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <AITextarea fieldKey="cancellationPolicy" value={data.cancellationPolicy} onChange={(v) => set("cancellationPolicy", v)} companyName={companyName} />
            <AITextarea fieldKey="serviceGuarantee" value={data.serviceGuarantee} onChange={(v) => set("serviceGuarantee", v)} companyName={companyName} />
            <div className="ci-field">
                <label>Additional Terms</label>
                <textarea className="ci-textarea" value={data.additionalTerms}
                    onChange={(e) => set("additionalTerms", e.target.value)}
                    placeholder="Any additional terms or notes to include in proposals" rows={4} />
            </div>
        </>
    );
}

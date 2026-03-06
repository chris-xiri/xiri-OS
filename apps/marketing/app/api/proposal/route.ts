// Proposal API — generates branded HTML proposal email and sends via Resend

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend – set RESEND_API_KEY in .env.local
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

// Types
interface ProposalRequest {
    lead: {
        name: string;
        email: string;
        phone: string;
        company: string;
        clientName: string;
        clientAddress: string;
    };
    estimate: {
        monthlyPrice: number;
        pricePerVisit: number;
        pricePerSqft: number;
        hoursPerVisit: number;
        visitsPerMonth: number;
        totalHoursPerMonth: number;
        laborCostPerMonth: number;
        payrollTaxCost: number;
        supplyCostPerMonth: number;
        overheadCost: number;
        profitPerMonth: number;
        effectiveHourlyRate: number;
        toilets: number;
        urinals: number;
        sinks: number;
    };
    inputs: {
        buildingType: string;
        sqft: number;
        frequency: string;
        hourlyRate: number;
        profitMargin: number;
        overheadPercent: number;
        supplyCostPerSqft: number;
        payrollTaxPercent: number;
    };
    state: string;
    includedTasks: Array<{
        id: string;
        name: string;
        category: string;
        description: string;
    }>;
}

function generateProposalHtml(data: ProposalRequest): string {
    const { lead, estimate, inputs, includedTasks } = data;
    const fmt = (n: number) =>
        n.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const tasksByCategory: Record<string, typeof includedTasks> = {};
    for (const task of includedTasks) {
        if (!tasksByCategory[task.category]) tasksByCategory[task.category] = [];
        tasksByCategory[task.category].push(task);
    }

    const categoryLabels: Record<string, string> = {
        general: "General Cleaning",
        restrooms: "Restroom Services",
        floors: "Floor Care",
        specialty: "Specialty Services",
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; margin: 0; padding: 0; background: #f8f9fa; }
    .container { max-width: 700px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #0c0f1a 0%, #141829 100%); padding: 48px 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 800; }
    .header .brand { color: #00d4aa; }
    .header .subtitle { color: #c4c9e0; margin-top: 8px; font-size: 14px; }
    .section { padding: 32px 40px; }
    .section + .section { border-top: 1px solid #e9ecef; }
    .section-title { font-size: 18px; font-weight: 700; color: #0c0f1a; margin: 0 0 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .detail-row .label { color: #6c757d; }
    .detail-row .value { font-weight: 600; color: #1a1a2e; }
    .highlight-box { background: linear-gradient(135deg, #0c0f1a 0%, #141829 100%); border-radius: 12px; padding: 32px; text-align: center; margin: 16px 0; }
    .highlight-box .price { font-size: 48px; font-weight: 800; color: #00d4aa; }
    .highlight-box .period { color: #c4c9e0; font-size: 16px; }
    .highlight-box .sub { color: #8b92b3; font-size: 13px; margin-top: 8px; }
    .task-list { list-style: none; padding: 0; margin: 0; }
    .task-list li { padding: 6px 0; font-size: 14px; color: #495057; display: flex; gap: 8px; align-items: flex-start; }
    .task-list li::before { content: "✓"; color: #00d4aa; font-weight: 700; flex-shrink: 0; }
    .category-label { font-size: 13px; font-weight: 700; color: #00d4aa; text-transform: uppercase; letter-spacing: 0.05em; margin: 16px 0 8px; }
    .category-label:first-child { margin-top: 0; }
    .cost-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .cost-item { background: #f8f9fa; border-radius: 8px; padding: 16px; text-align: center; }
    .cost-item .amount { font-size: 20px; font-weight: 700; color: #0c0f1a; }
    .cost-item .desc { font-size: 12px; color: #6c757d; margin-top: 4px; }
    .footer { padding: 32px 40px; text-align: center; background: #f8f9fa; border-top: 1px solid #e9ecef; }
    .footer .cta { display: inline-block; background: #00d4aa; color: #0c0f1a; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; }
    .footer p { color: #6c757d; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>● xiri<span class="brand">OS</span></h1>
      <div class="subtitle">Commercial Cleaning Bid Proposal</div>
    </div>

    <div class="section">
      <div class="section-title">Prepared For</div>
      <div class="detail-row"><span class="label">Client</span><span class="value">${lead.clientName}</span></div>
      <div class="detail-row"><span class="label">Location</span><span class="value">${lead.clientAddress}</span></div>
      <div class="detail-row"><span class="label">Prepared By</span><span class="value">${lead.company || lead.name}</span></div>
    </div>

    <div class="section">
      <div class="highlight-box">
        <div class="price">$${fmt(estimate.monthlyPrice)}</div>
        <div class="period">per month</div>
        <div class="sub">$${fmt(estimate.pricePerVisit)} per visit · $${fmt(estimate.pricePerSqft)}/sqft</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Property Details</div>
      <div class="detail-row"><span class="label">Building Type</span><span class="value">${inputs.buildingType}</span></div>
      <div class="detail-row"><span class="label">Square Footage</span><span class="value">${inputs.sqft.toLocaleString()} sqft</span></div>
      <div class="detail-row"><span class="label">Cleaning Frequency</span><span class="value">${inputs.frequency}</span></div>
    </div>

    <div class="section">
      <div class="section-title">Scope of Services</div>
      ${Object.entries(tasksByCategory)
            .map(
                ([cat, tasks]) => `
        <div class="category-label">${categoryLabels[cat] || cat}</div>
        <ul class="task-list">
          ${tasks.map((t) => `<li>${t.name}</li>`).join("")}
        </ul>
      `
            )
            .join("")}
    </div>

    <div class="section">
      <div class="section-title">Time & Cost Estimate</div>
      <div class="cost-grid">
        <div class="cost-item">
          <div class="amount">${estimate.hoursPerVisit.toFixed(1)} hrs</div>
          <div class="desc">Per Visit</div>
        </div>
        <div class="cost-item">
          <div class="amount">${estimate.visitsPerMonth}</div>
          <div class="desc">Visits/Month</div>
        </div>
        <div class="cost-item">
          <div class="amount">${estimate.totalHoursPerMonth.toFixed(1)} hrs</div>
          <div class="desc">Total Hours/Month</div>
        </div>
        <div class="cost-item">
          <div class="amount">$${fmt(estimate.effectiveHourlyRate)}/hr</div>
          <div class="desc">Effective Rate</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Cost Breakdown</div>
      <div class="detail-row"><span class="label">Labor</span><span class="value">$${fmt(estimate.laborCostPerMonth)}</span></div>
      <div class="detail-row"><span class="label">Payroll Tax (${inputs.payrollTaxPercent}%)</span><span class="value">$${fmt(estimate.payrollTaxCost)}</span></div>
      <div class="detail-row"><span class="label">Supplies</span><span class="value">$${fmt(estimate.supplyCostPerMonth)}</span></div>
      <div class="detail-row"><span class="label">Overhead (${inputs.overheadPercent}%)</span><span class="value">$${fmt(estimate.overheadCost)}</span></div>
      <div class="detail-row" style="border-top: 2px solid #0c0f1a; margin-top: 8px; padding-top: 12px;">
        <span class="label" style="font-weight: 700; color: #0c0f1a;">Profit (${inputs.profitMargin}%)</span>
        <span class="value" style="color: #00d4aa;">$${fmt(estimate.profitPerMonth)}</span>
      </div>
    </div>

    <div class="footer">
      <p style="margin-bottom: 16px; color: #495057;">This estimate was generated using the xiriOS Bid Calculator.</p>
      <a href="https://os.xiri.ai/calculator" class="cta">Try the Free Calculator →</a>
      <p>Questions? Contact ${lead.name} at ${lead.email}${lead.phone ? ` or ${lead.phone}` : ""}</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
    try {
        const data: ProposalRequest = await req.json();
        const { lead, estimate, inputs } = data;

        // Validate required fields
        if (!lead.name || !lead.email || !lead.clientName || !lead.clientAddress) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate proposal HTML
        const proposalHtml = generateProposalHtml(data);

        // Send proposal email to the lead
        const emailResult = await resend.emails.send({
            from: "xiriOS <proposals@xiri.ai>",
            to: lead.email,
            subject: `Cleaning Bid Proposal — ${lead.clientName}`,
            html: proposalHtml,
        });

        // Log for now — later: save lead to Firestore
        console.log("Proposal sent:", {
            to: lead.email,
            client: lead.clientName,
            monthly: estimate.monthlyPrice,
            sqft: inputs.sqft,
            emailId: emailResult?.data?.id,
        });

        return NextResponse.json({
            success: true,
            message: "Proposal sent successfully",
            emailId: emailResult?.data?.id,
        });
    } catch (error) {
        console.error("Proposal API error:", error);
        return NextResponse.json(
            { error: "Failed to generate proposal" },
            { status: 500 }
        );
    }
}

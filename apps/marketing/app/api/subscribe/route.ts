import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_AUDIENCE_ID = 'dd16c5f5-fd01-4be8-aa99-31ba66a5e37b';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const audienceId = process.env.RESEND_AUDIENCE_ID || DEFAULT_AUDIENCE_ID;
    try {
      await resend.contacts.create({
        email,
        audienceId,
        unsubscribed: false,
      });
    } catch (contactErr) {
      console.warn('Failed to add contact to Resend Audience:', contactErr);
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Xiri Launchpad <launchpad@xiri.ai>',
      to: [email],
      subject: 'Day 1: How to set up your Single-Member LLC legally',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; color: #1f2937; line-height: 1.6; background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          
          <div style="border-bottom: 2px solid #00d4aa; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="font-weight: 800; font-size: 18px; color: #0f172a;">● xiri<span style="color: #00d4aa;">OS</span> Launchpad</span>
            <span style="float: right; color: #64748b; font-size: 13px; font-weight: 600;">Day 1 of 7</span>
          </div>

          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Day 1: Choosing the Best Legal Structure for Your Cleaning Business</h2>
          
          <p>Before taking your first client, establishing personal liability protection is essential. Here is a quick comparison of how the top 3 business structures stack up:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; text-align: left;">
                <th style="padding: 8px; color: #334155;">Structure</th>
                <th style="padding: 8px; color: #334155;">Personal Protection</th>
                <th style="padding: 8px; color: #334155;">Best Suited For</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px; font-weight: 600;">Sole Proprietorship</td>
                <td style="padding: 8px; color: #dc2626;">❌ No protection</td>
                <td style="padding: 8px;">Part-time side gigs</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f0fdf4;">
                <td style="padding: 8px; font-weight: 700; color: #047857;">Single-Member LLC ★</td>
                <td style="padding: 8px; color: #16a34a; font-weight: 600;">✅ Full asset shield</td>
                <td style="padding: 8px; font-weight: 600;">95% of cleaning startups</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: 600;">S-Corporation</td>
                <td style="padding: 8px; color: #16a34a;">✅ Full asset shield</td>
                <td style="padding: 8px;">Companies making $70k+ net</td>
              </tr>
            </tbody>
          </table>

          <h4 style="color: #0f172a; margin-bottom: 8px;">Key Takeaways & Action Steps:</h4>
          <ul style="padding-left: 20px; margin-top: 4px;">
            <li><strong>Single-Member LLC:</strong> Keeps your personal savings, home, and vehicle safe from business liabilities while retaining simple Schedule C pass-through tax filing.</li>
            <li><strong>Keep Your Home Address Private:</strong> Use a Registered Agent like <a href="https://www.northwestregisteredagent.com/" style="color: #2563eb; font-weight: 600;">Northwest Registered Agent</a> so your personal home address isn't published on public state records.</li>
            <li><strong>Get Your Free EIN:</strong> Never pay a third party to get an Employer Identification Number. Apply directly on the official <a href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" style="color: #2563eb; font-weight: 600;">IRS.gov Portal</a> for free.</li>
          </ul>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://os.xiri.ai/start-cleaning-business/llc-setup" style="display: inline-block; background: #00d4aa; color: #0f172a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; font-size: 14px;">
              Read the Full Legal Structure Comparison Guide →
            </a>
          </div>

          <p style="font-size: 14px;">Tomorrow in Day 2, we will cover General Liability insurance benchmarks and why starting with 1099 contractors saves initial overhead!</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />

          <p style="color: #64748b; font-size: 11px; line-height: 1.5; margin: 0;">
            <strong>Educational & Legal Disclaimer:</strong> The information provided in this email sequence and website is for informational and educational purposes only and does not constitute legal, tax, or financial advice. We recommend consulting a licensed attorney or CPA regarding your specific business structure.<br/><br/>
            © 2026 xiriOS · <a href="https://os.xiri.ai" style="color: #64748b;">os.xiri.ai</a> · <a href="https://www.sba.gov/business-guide/launch-your-business/choose-business-structure" style="color: #64748b;">SBA.gov Reference</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Resend subscription error:', error);
    return NextResponse.json({ error: error?.message || 'Subscription failed' }, { status: 500 });
  }
}

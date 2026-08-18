import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_AUDIENCE_ID,
      });
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Xiri Launchpad <launchpad@os.xiri.ai>',
      to: [email],
      subject: 'Day 1: How to set up your Single-Member LLC legally',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="color: #1e3a8a;">Welcome to Day 1 of The Cleaning Business Launchpad!</h2>
          <p>Before taking your first client, establishing a solid legal foundation is essential. For 99% of new cleaning business owners, a <strong>Single-Member LLC</strong> is the best choice.</p>

          <h3>Why a Single-Member LLC?</h3>
          <ul>
            <li><strong>Personal Liability Protection:</strong> Keeps your personal savings separate from business liabilities.</li>
            <li><strong>Simple Pass-Through Taxation:</strong> Business profits/losses flow directly onto your personal tax return (Schedule C)—no complex corporate tax filings needed.</li>
          </ul>

          <p>💡 <strong>Action Step:</strong> Set up your Single-Member LLC quickly and keep your home address off public records using <a href="https://www.northwestregisteredagent.com/" style="color: #2563eb; font-weight: bold;">Northwest Registered Agent</a>.</p>

          <p>Tomorrow, in Day 2, we will cover General Liability insurance through <strong>Corgi Insurance</strong> and why starting with 1099 contractors saves initial overhead!</p>

          <br/>
          <p>To your success,<br/><strong>The Xiri Team</strong><br/><a href="https://os.xiri.ai">os.xiri.ai</a></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Resend subscription error:', error);
    return NextResponse.json({ error: error?.message || 'Subscription failed' }, { status: 500 });
  }
}

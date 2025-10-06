import { Resend } from 'resend';
import { SignJWT } from 'jose';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const { email, consent } = await request.json<{ email?: string; consent?: boolean }>();
    if (!email || !consent) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(env.JWT_SECRET));

    const confirmUrl = `${env.APP_URL}/confirm?token=${token}`;
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Confirm your email',
      html: `<p>Please <a href="${confirmUrl}">confirm your email</a> to join the waitlist.</p>`,
    });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};

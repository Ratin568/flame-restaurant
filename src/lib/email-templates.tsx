import {Body, Button, Container, Head, Hr, Html, Preview, Section, Text} from '@react-email/components';
import {createHash} from 'node:crypto';
import {sendEmail, type EmailResult} from './email';

function hashId(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

const brand = {bg: '#0a0a0a', card: '#141414', primary: '#FF5722', text: '#fafafa', muted: '#a1a1aa'};

/** ─── ایمیل خوش‌آمدگویی ─── */
export function WelcomeEmail({name}: {name: string}) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Flame 🔥</Preview>
      <Body style={{backgroundColor: brand.bg, fontFamily: 'Arial, sans-serif'}}>
        <Container style={{backgroundColor: brand.card, margin: '40px auto', borderRadius: 12, padding: 32}}>
          <Text style={{color: brand.primary, fontSize: 28, fontWeight: 'bold', margin: 0}}>🔥 Flame</Text>
          <Text style={{color: brand.text, fontSize: 20, fontWeight: 'bold'}}>Hi {name}!</Text>
          <Text style={{color: brand.muted, fontSize: 14, lineHeight: '22px'}}>
            Welcome to Flame — where every patty hits a real open flame. Your account is ready:
            order faster, track live, and earn loyalty points with every order.
          </Text>
          <Section style={{textAlign: 'center', margin: '24px 0'}}>
            <Button
              href={`${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/menu`}
              style={{backgroundColor: brand.primary, color: '#fff', borderRadius: 8, padding: '12px 28px', fontWeight: 'bold'}}
            >
              Browse the Menu
            </Button>
          </Section>
          <Hr style={{borderColor: '#262626'}} />
          <Text style={{color: brand.muted, fontSize: 12}}>
            First order? Use WELCOME10 for 10% off.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export async function sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
  return sendEmail({to, subject: 'Welcome to Flame 🔥', content: <WelcomeEmail name={name} />, idempotencyKey: `welcome-email:${to}`});
}

/** ─── ایمیل تایید سفارش ─── */
export function OrderConfirmationEmail({
  name,
  orderNumber,
  trackingToken,
  lines,
  total,
}: {
  name: string;
  orderNumber: string;
  trackingToken: string;
  lines: {nameSnapshot: string; quantity: number}[];
  total: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Order {orderNumber} confirmed</Preview>
      <Body style={{backgroundColor: brand.bg, fontFamily: 'Arial, sans-serif'}}>
        <Container style={{backgroundColor: brand.card, margin: '40px auto', borderRadius: 12, padding: 32}}>
          <Text style={{color: brand.primary, fontSize: 28, fontWeight: 'bold', margin: 0}}>🔥 Flame</Text>
          <Text style={{color: brand.text, fontSize: 20, fontWeight: 'bold'}}>Order confirmed! 🎉</Text>
          <Text style={{color: brand.muted, fontSize: 14}}>
            Thanks {name}! Your order <strong style={{color: brand.primary}}>{orderNumber}</strong> is being prepared.
          </Text>

          <Section style={{margin: '16px 0', borderTop: '1px solid #262626', borderBottom: '1px solid #262626', padding: '12px 0'}}>
            {lines.map((line) => (
              <Text key={line.nameSnapshot} style={{color: brand.text, fontSize: 14, margin: '4px 0'}}>
                {line.quantity}× {line.nameSnapshot}
              </Text>
            ))}
          </Section>

          <Text style={{color: brand.text, fontSize: 16, fontWeight: 'bold'}}>
            Total: {total}
          </Text>

          <Section style={{textAlign: 'center', margin: '24px 0'}}>
            <Button
              href={`${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/order/track?token=${encodeURIComponent(trackingToken)}`}
              style={{backgroundColor: brand.primary, color: '#fff', borderRadius: 8, padding: '12px 28px', fontWeight: 'bold'}}
            >
              Track Your Order
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: {name: string; orderNumber: string; trackingToken: string; lines: {nameSnapshot: string; quantity: number}[]; total: string},
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: `Order ${data.orderNumber} confirmed 🎉`,
    content: <OrderConfirmationEmail {...data} />,
    idempotencyKey: `order-confirmation:${data.orderNumber}`,
  });
}
export function EmailVerificationEmail({name, token, locale}: {name: string; token: string; locale: string}) {
  const url = `${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/${locale}/verify-email?token=${encodeURIComponent(token)}`;
  return (
    <Html><Head /><Preview>Verify your Flame account</Preview><Body style={{backgroundColor: brand.bg, fontFamily: 'Arial, sans-serif'}}>
      <Container style={{backgroundColor: brand.card, margin: '40px auto', borderRadius: 12, padding: 32}}>
        <Text style={{color: brand.primary, fontSize: 28, fontWeight: 'bold'}}>🔥 Flame</Text>
        <Text style={{color: brand.text, fontSize: 20, fontWeight: 'bold'}}>Verify your email</Text>
        <Text style={{color: brand.muted, fontSize: 14, lineHeight: '22px'}}>Hi {name}, please verify your email address to activate your Flame account. This link expires in 24 hours.</Text>
        <Section style={{textAlign: 'center', margin: '24px 0'}}><Button href={url} style={{backgroundColor: brand.primary, color: '#fff', borderRadius: 8, padding: '12px 28px', fontWeight: 'bold'}}>Verify Email</Button></Section>
      </Container>
    </Body></Html>
  );
}

export async function sendEmailVerificationEmail(to: string, name: string, token: string, locale: string): Promise<EmailResult> {
  return sendEmail({to, subject: 'Verify your Flame account 🔥', content: <EmailVerificationEmail name={name} token={token} locale={locale} />, idempotencyKey: `verify-email:${hashId(token)}`});
}

export function PasswordResetEmail({name, token, locale}: {name: string; token: string; locale: string}) {
  const url = `${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}/${locale}/reset-password?token=${encodeURIComponent(token)}`;
  return (
    <Html><Head /><Preview>Reset your Flame password</Preview><Body style={{backgroundColor: brand.bg, fontFamily: 'Arial, sans-serif'}}>
      <Container style={{backgroundColor: brand.card, margin: '40px auto', borderRadius: 12, padding: 32}}>
        <Text style={{color: brand.primary, fontSize: 28, fontWeight: 'bold'}}>🔥 Flame</Text>
        <Text style={{color: brand.text, fontSize: 20, fontWeight: 'bold'}}>Reset your password</Text>
        <Text style={{color: brand.muted, fontSize: 14, lineHeight: '22px'}}>Hi {name}, we received a password reset request. The link expires in 1 hour and can only be used once.</Text>
        <Section style={{textAlign: 'center', margin: '24px 0'}}><Button href={url} style={{backgroundColor: brand.primary, color: '#fff', borderRadius: 8, padding: '12px 28px', fontWeight: 'bold'}}>Reset Password</Button></Section>
      </Container>
    </Body></Html>
  );
}

export async function sendPasswordResetEmail(to: string, name: string, token: string, locale: string): Promise<EmailResult> {
  return sendEmail({to, subject: 'Reset your Flame password', content: <PasswordResetEmail name={name} token={token} locale={locale} />, idempotencyKey: `password-reset:${hashId(token)}`});
}

export function SuspiciousLoginEmail({name, ip, userAgent}: {name: string; ip: string; userAgent: string}) {
  return <Html><Head /><Preview>New sign-in to your Flame account</Preview><Body style={{backgroundColor: brand.bg, fontFamily: 'Arial, sans-serif'}}><Container style={{backgroundColor: brand.card, margin: '40px auto', borderRadius: 12, padding: 32}}><Text style={{color: brand.primary, fontSize: 28, fontWeight: 'bold'}}>🔥 Flame</Text><Text style={{color: brand.text, fontSize: 20, fontWeight: 'bold'}}>New sign-in detected</Text><Text style={{color: brand.muted, fontSize: 14, lineHeight: '22px'}}>Hi {name}, a sign-in was detected from a new device or location.</Text><Text style={{color: brand.text, fontSize: 13}}>IP: {ip}</Text><Text style={{color: brand.muted, fontSize: 12}}>Browser: {userAgent}</Text><Text style={{color: brand.muted, fontSize: 12}}>If this was not you, reset your password immediately.</Text></Container></Body></Html>;
}

export async function sendSuspiciousLoginEmail(to: string, name: string, ip: string, userAgent: string, _locale: string): Promise<EmailResult> {
  return sendEmail({to, subject: 'New sign-in detected on Flame', content: <SuspiciousLoginEmail name={name} ip={ip} userAgent={userAgent} />, idempotencyKey: `suspicious-login:${hashId(`${to}:${ip}:${userAgent}`)}`});
}

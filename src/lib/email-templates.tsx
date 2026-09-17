import {Body, Button, Container, Head, Hr, Html, Preview, Section, Text} from '@react-email/components';
import {sendEmail} from './email';

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
              href="https://flame.example.com/menu"
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

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  return sendEmail({to, subject: 'Welcome to Flame 🔥', content: <WelcomeEmail name={name} />});
}

/** ─── ایمیل تایید سفارش ─── */
export function OrderConfirmationEmail({
  name,
  orderNumber,
  lines,
  total,
}: {
  name: string;
  orderNumber: string;
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
              href="https://flame.example.com/order/track"
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
  data: {name: string; orderNumber: string; lines: {nameSnapshot: string; quantity: number}[]; total: string},
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `Order ${data.orderNumber} confirmed 🎉`,
    content: <OrderConfirmationEmail {...data} />,
  });
}
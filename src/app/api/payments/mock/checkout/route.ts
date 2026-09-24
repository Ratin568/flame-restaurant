import {db} from '@/lib/db';

export async function GET(req: Request) {
  const u = new URL(req.url);
  const transaction = u.searchParams.get('transaction');
  const locale = u.searchParams.get('locale') || 'en';
  if (!transaction) return new Response('Missing transaction', {status:400});
  const payment = await db.paymentTransaction.findUnique({where:{id:transaction}, include:{order:true}});
  if (!payment || payment.provider !== 'MOCK') return new Response('Invalid mock transaction', {status:404});
  const secret = process.env.MOCK_WEBHOOK_SECRET || 'flame-local-test-secret';
  const form = (status:string, label:string) => `<form method=\"POST\" action=\"/api/payments/mock/webhook\" style=\"margin:12px 0\"><input type=\"hidden\" name=\"secret\" value=\"${secret}\"><input type=\"hidden\" name=\"transactionId\" value=\"${transaction}\"><input type=\"hidden\" name=\"status\" value=\"${status}\"><input type=\"hidden\" name=\"locale\" value=\"${locale}\"><button style=\"padding:12px 18px;cursor:pointer\" type=\"submit\">${label}</button></form>`;
  const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Flame Test Payment</title></head><body style=\"font-family:system-ui;max-width:680px;margin:60px auto;padding:24px\"><h1>🔥 Flame Test Payment</h1><p>Order <b>${payment.order.orderNumber}</b></p><p>Amount: <b>${payment.amount} ${payment.currency}</b></p><p>This is a local development provider. No real money is moved.</p>${form('paid','Simulate successful payment')} ${form('failed','Simulate failed payment')} ${form('canceled','Simulate canceled payment')}<p style=\"color:#666;margin-top:28px\">Transaction: ${transaction}</p></body></html>`;
  return new Response(html,{headers:{'content-type':'text/html; charset=utf-8'}});
}

const styles: Record<string, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-600',
  CONFIRMED: 'bg-blue-500/15 text-blue-600',
  PREPARING: 'bg-orange-500/15 text-orange-600',
  READY: 'bg-purple-500/15 text-purple-600',
  SHIPPING: 'bg-cyan-500/15 text-cyan-600',
  DELIVERED: 'bg-green-500/15 text-green-600',
  CANCELLED: 'bg-red-500/15 text-red-600',
};

export function OrderStatusBadge({status}: {status: string}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
}
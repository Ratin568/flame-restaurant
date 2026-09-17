import {Mail, MailOpen, Trash2} from 'lucide-react';
import {db} from '@/lib/db';
import {deleteMessageAction, markMessageReadAction} from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({orderBy: {createdAt: 'desc'}, take: 100});

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black">Messages</h1>
        {unread > 0 && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            {unread} unread
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {messages.length === 0 && (
          <p className="rounded-xl border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            No messages yet.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl border bg-card p-4 ${msg.isRead ? 'border-border' : 'border-primary/40'}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {!msg.isRead && <span className="size-2 rounded-full bg-primary" />}
              <span className="font-semibold">{msg.name}</span>
              <a href={`mailto:${msg.email}`} dir="ltr" className="text-sm text-primary hover:underline">
                {msg.email}
              </a>
              <span className="ms-auto text-xs text-muted-foreground">
                {new Intl.DateTimeFormat('en-US', {dateStyle: 'short', timeStyle: 'short'}).format(msg.createdAt)}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{msg.message}</p>

            <div className="mt-3 flex items-center gap-2">
              <form action={markMessageReadAction}>
                <input type="hidden" name="id" value={msg.id} />
                <input type="hidden" name="next" value={String(!msg.isRead)} />
                <button
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 ${
                    msg.isRead ? 'border border-border text-muted-foreground' : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {msg.isRead ? <MailOpen className="size-3.5" /> : <Mail className="size-3.5" />}
                  {msg.isRead ? 'Mark unread' : 'Mark read'}
                </button>
              </form>

              <form action={deleteMessageAction}>
                <input type="hidden" name="id" value={msg.id} />
                <button
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                  aria-label="Delete message"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
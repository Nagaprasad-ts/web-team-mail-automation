import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    ChevronDown,
    Hand,
    Inbox,
    Mail,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import StatCard from '@/components/stat-card';

type Campaign = {
    id: number;
    subject: string;
    body: string;
    status: 'sent' | 'failed' | 'partial';
    triggered_by: string;
    sent_at: string | null;
    recipients: string[];
    recipient_count: number;
};

type Props = {
    campaigns: Campaign[];
    stats: {
        total: number;
        automated: number;
        manual: number;
        failed: number;
    };
};

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const statusConfig = {
    sent: {
        icon: CheckCircle2,
        label: 'Sent',
        className: 'bg-green-500/10 text-green-700 dark:text-green-400',
        iconClass: 'text-green-500',
    },
    partial: {
        icon: AlertTriangle,
        label: 'Partial',
        className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        iconClass: 'text-amber-500',
    },
    failed: {
        icon: XCircle,
        label: 'Failed',
        className: 'bg-red-500/10 text-red-700 dark:text-red-400',
        iconClass: 'text-red-500',
    },
};

export default function MailHistoryPage({ campaigns, stats }: Props) {
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <>
            <Head title="Email Logs" />

            <div className="flex flex-col gap-6 p-4 pb-8">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Email Logs</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        A complete record of every email dispatched — manual or automated.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="Total sent" value={stats.total} icon={Mail} />
                    <StatCard label="Automated" value={stats.automated} icon={CalendarClock} tint="text-primary" />
                    <StatCard label="Manual" value={stats.manual} icon={Hand} tint="text-blue-500" />
                    <StatCard
                        label="Needs attention"
                        value={stats.failed}
                        icon={stats.failed > 0 ? AlertTriangle : CheckCircle2}
                        tint={stats.failed > 0 ? 'text-red-500' : 'text-green-500'}
                    />
                </div>

                {/* Campaign list */}
                <div className="rounded-xl border bg-card">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-semibold">All sent emails</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Click a row to expand the full email preview and recipient list.
                        </p>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 p-14 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                                <Inbox className="size-7 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold">No emails sent yet</h3>
                                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                                    Once an email is dispatched it will appear here for review.
                                </p>
                            </div>
                            <Link
                                href="/mail-automation"
                                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                            >
                                Go to Mail Automation →
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {campaigns.map((c) => {
                                const isAuto = c.triggered_by === 'cron';
                                const TriggerIcon = isAuto ? CalendarClock : Hand;
                                const status = statusConfig[c.status];
                                const StatusIcon = status.icon;
                                const open = openId === c.id;

                                return (
                                    <li key={c.id}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenId(open ? null : c.id)}
                                            className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30"
                                        >
                                            {/* Trigger icon */}
                                            <div
                                                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                                                    isAuto
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-blue-500/10 text-blue-500'
                                                }`}
                                            >
                                                <TriggerIcon className="size-4.5" />
                                            </div>

                                            {/* Main info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate font-medium">
                                                        {c.subject}
                                                    </p>
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                                                    >
                                                        <StatusIcon className="size-3" />
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {isAuto ? 'Automated schedule' : 'Compose & send'}
                                                    {' · '}
                                                    {c.recipient_count} recipient{c.recipient_count === 1 ? '' : 's'}
                                                    {' · '}
                                                    {c.sent_at ? fmtDate(c.sent_at) : '—'}
                                                </p>
                                            </div>

                                            {/* Chevron */}
                                            <ChevronDown
                                                className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {/* Expanded detail */}
                                        {open && (
                                            <div className="border-t bg-muted/20 px-5 py-5">
                                                <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                                                    <span>
                                                        <strong className="text-foreground">Sent:</strong>{' '}
                                                        {c.sent_at ? fmtDateTime(c.sent_at) : '—'}
                                                    </span>
                                                    <span>
                                                        <strong className="text-foreground">Source:</strong>{' '}
                                                        {isAuto ? 'Automated schedule' : 'Manual compose'}
                                                    </span>
                                                    <span>
                                                        <strong className="text-foreground">Recipients:</strong>{' '}
                                                        {c.recipient_count}
                                                    </span>
                                                </div>

                                                <div className="grid gap-5 lg:grid-cols-3">
                                                    <div className="lg:col-span-2">
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                            Email body
                                                        </p>
                                                        <div
                                                            className="rounded-lg border bg-background p-4 text-sm leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: c.body }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                            Recipients ({c.recipients.length})
                                                        </p>
                                                        <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border bg-background p-3">
                                                            {c.recipients.map((email) => (
                                                                <li
                                                                    key={email}
                                                                    className="truncate text-xs text-muted-foreground hover:text-foreground"
                                                                >
                                                                    {email}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}


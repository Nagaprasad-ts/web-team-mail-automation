import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    Clock,
    History,
    Users,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';

type LastCampaign = {
    subject: string;
    status: 'sent' | 'partial' | 'failed';
    triggered_by: string;
    sent_at: string | null;
    recipient_count: number;
};

type Props = {
    scheduleStats: { total: number; active: number };
    overview: {
        active_recipients: number;
        last_campaign: LastCampaign | null;
    };
};

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

export default function MailAutomationIndex({ scheduleStats, overview }: Props) {
    const lc = overview.last_campaign;

    return (
        <>
            <Head title="Mail Automation" />

            <div className="flex flex-col gap-6 p-4 pb-8">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Mail Automation</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Manage your department newsletter — automated or on demand.
                    </p>
                </div>

                {/* Schedules summary card */}
                <Link
                    href="/mail-automation/schedules"
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        scheduleStats.active > 0
                            ? 'border-green-500/30 bg-gradient-to-br from-green-500/5 via-card to-card'
                            : 'border-border bg-card hover:border-primary/40'
                    }`}
                >
                    <div
                        className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${
                            scheduleStats.active > 0 ? 'bg-green-500' : 'bg-muted-foreground/30'
                        }`}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4 p-5 pl-6">
                        <div className="flex items-center gap-4">
                            <div
                                className={`flex size-12 items-center justify-center rounded-xl ${
                                    scheduleStats.active > 0
                                        ? 'bg-green-500/10 text-green-600'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <CalendarClock className="size-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-semibold">Scheduled Automations</h2>
                                    {scheduleStats.active > 0 && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                                            <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
                                            {scheduleStats.active} active
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    {scheduleStats.total === 0
                                        ? 'No schedules yet — create one to automate sends.'
                                        : `${scheduleStats.total} schedule${scheduleStats.total === 1 ? '' : 's'} configured${scheduleStats.active === 0 ? ', all paused' : ''}.`}
                                </p>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-primary group-hover:underline">
                            {scheduleStats.total === 0 ? 'Create first schedule →' : 'Manage schedules →'}
                        </span>
                    </div>
                </Link>

                {/* Action cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/mail-automation/schedules/create"
                        className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                    >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="flex items-start justify-between">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <CalendarClock className="size-5" />
                            </div>
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                {scheduleStats.total} configured
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold">New Automated Schedule</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Set a cadence, write a template, pick recipients. The system fires it automatically.
                            </p>
                        </div>
                        <span className="text-sm font-medium text-primary group-hover:underline">
                            Create schedule →
                        </span>
                    </Link>

                    <Link
                        href="/mail-automation/compose"
                        className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-blue-500/50 hover:shadow-md"
                    >
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="flex items-start justify-between">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                <Zap className="size-5" />
                            </div>
                            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                                {overview.active_recipients} ready
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold">Compose & Send Now</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Write a one-off announcement and dispatch it to selected departments immediately.
                            </p>
                        </div>
                        <span className="text-sm font-medium text-blue-500 group-hover:underline">
                            Open composer →
                        </span>
                    </Link>
                </div>

                {/* Quick stats strip */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border bg-muted/40 px-5 py-3 text-sm">
                    <Link
                        href="/mail-automation/recipients"
                        className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Users className="size-3.5" />
                        <strong className="text-foreground">{overview.active_recipients}</strong>
                        &nbsp;active recipients
                    </Link>
                    <span className="hidden h-4 w-px bg-border sm:block" />
                    {lc ? (
                        <Link
                            href="/mail-automation/history"
                            className="flex min-w-0 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {lc.status === 'sent' ? (
                                <CheckCircle2 className="size-3.5 shrink-0 text-green-500" />
                            ) : (
                                <AlertCircle className="size-3.5 shrink-0 text-amber-500" />
                            )}
                            <span className="truncate">
                                Last:&nbsp;<strong className="text-foreground">{lc.subject}</strong>
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href="/mail-automation/history"
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <History className="size-3.5" /> No campaigns yet
                        </Link>
                    )}
                    {lc?.sent_at && (
                        <>
                            <span className="hidden h-4 w-px bg-border sm:block" />
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="size-3.5" />
                                {fmtDate(lc.sent_at)}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

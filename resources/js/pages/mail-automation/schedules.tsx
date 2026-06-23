import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarClock,
    Clock,
    Pause,
    Pencil,
    Play,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';

type Schedule = {
    id: number;
    name: string;
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    day_of_month: number | null;
    day_of_week: number | null;
    time: string;
    subject: string;
    recipient_ids: number[];
    last_sent_at: string | null;
};

type Props = {
    schedules: Schedule[];
    stats: { total: number; active: number; paused: number };
};

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function cadenceText(s: Schedule): string {
    if (s.frequency === 'daily') return `Every day at ${s.time}`;
    if (s.frequency === 'weekly') return `Every ${WEEKDAYS[s.day_of_week ?? 1]} at ${s.time}`;
    return `Day ${s.day_of_month ?? 1} of every month at ${s.time}`;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

export default function SchedulesPage({ schedules, stats }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleToggle = (s: Schedule) => {
        router.patch(
            `/mail-automation/schedules/${s.id}/toggle`,
            { enabled: !s.enabled },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(s.enabled ? `"${s.name}" paused.` : `"${s.name}" resumed.`),
                onError: () => toast.error('Failed to update.'),
            },
        );
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/mail-automation/schedules/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success(`"${deleteTarget.name}" deleted.`),
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    };

    return (
        <>
            <Head title="Schedules" />

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
                title="Delete schedule?"
                description={
                    deleteTarget ? (
                        <>
                            <span className="font-medium text-foreground">"{deleteTarget.name}"</span>{' '}
                            will be permanently deleted. This cannot be undone.
                        </>
                    ) : null
                }
                confirmLabel="Delete"
                destructive
                loading={deleting}
                onConfirm={handleDelete}
            />

            <div className="flex flex-col gap-6 p-4 pb-8">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Schedules</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Each schedule runs independently on its own cadence with its own template and recipients.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/mail-automation/schedules/create">
                            <Plus className="size-4" /> New schedule
                        </Link>
                    </Button>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <p className="text-2xl font-semibold">{stats.total}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="rounded-xl border bg-card p-4 text-center">
                        <p className={`text-2xl font-semibold ${stats.paused > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {stats.paused}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Paused</p>
                    </div>
                </div>

                {/* List */}
                {schedules.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-14 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                            <CalendarClock className="size-7 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold">No schedules yet</h3>
                            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                                Create a schedule to start automating department newsletter sends.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/mail-automation/schedules/create">
                                <Plus className="size-4" /> Create first schedule
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {schedules.map((s) => (
                            <div
                                key={s.id}
                                className={`group relative overflow-hidden rounded-xl border-2 bg-card transition-all ${
                                    s.enabled
                                        ? 'border-green-500/25'
                                        : 'border-border'
                                }`}
                            >
                                <div
                                    className={`absolute inset-y-0 left-0 w-1 ${
                                        s.enabled ? 'bg-green-500' : 'bg-muted-foreground/30'
                                    }`}
                                />

                                <div className="flex flex-wrap items-start gap-4 p-4 pl-5">
                                    {/* Icon */}
                                    <div
                                        className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${
                                            s.enabled
                                                ? 'bg-green-500/10 text-green-600'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <CalendarClock className="size-5" />
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">{s.name}</h3>
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    s.enabled
                                                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {s.enabled && (
                                                    <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
                                                )}
                                                {s.enabled ? 'Active' : 'Paused'}
                                            </span>
                                        </div>

                                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {cadenceText(s)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="size-3" />
                                                {s.recipient_ids.length > 0
                                                    ? `${s.recipient_ids.length} recipient${s.recipient_ids.length === 1 ? '' : 's'}`
                                                    : 'All active recipients'}
                                            </span>
                                            {s.last_sent_at && (
                                                <span>Last sent {fmtDate(s.last_sent_at)}</span>
                                            )}
                                        </div>

                                        {s.subject && (
                                            <p className="mt-2 truncate text-sm text-foreground/80">
                                                {s.subject}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            type="button"
                                            variant={s.enabled ? 'outline' : 'default'}
                                            size="sm"
                                            onClick={() => handleToggle(s)}
                                            className={s.enabled ? 'text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30' : ''}
                                        >
                                            {s.enabled ? (
                                                <><Pause className="size-3.5" /> Pause</>
                                            ) : (
                                                <><Play className="size-3.5" /> Resume</>
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            asChild
                                        >
                                            <Link href={`/mail-automation/schedules/${s.id}/edit`} title="Edit">
                                                <Pencil className="size-3.5" />
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                            onClick={() => setDeleteTarget(s)}
                                            title="Delete"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

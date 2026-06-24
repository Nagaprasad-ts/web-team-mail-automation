import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Department = {
    id: number;
    department: string;
    email: string;
    active: boolean;
};

type ScheduleData = {
    id: number;
    name: string;
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    day_of_month: number | null;
    day_of_week: number | null;
    time: string;
    subject: string;
    body: string;
    recipient_ids: number[];
    last_sent_at: string | null;
};

type Props = {
    departments: Department[];
    schedule: ScheduleData | null;
};

const WEEKDAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

const DEFAULT_TEMPLATE = `<p>Dear Team,</p>
<p>Greetings from the NHEI Web Team!</p>
<p>[Write your message here...]</p>
<p>Regards,<br/>NHEI Web Team</p>`;

export default function ScheduleFormPage({ departments, schedule }: Props) {
    const isEdit = schedule !== null;

    const [recipientIds, setRecipientIds] = useState<Set<number>>(
        () =>
            new Set(
                schedule && schedule.recipient_ids.length > 0
                    ? schedule.recipient_ids
                    : departments.map((d) => d.id),
            ),
    );

    const form = useForm({
        name: schedule?.name ?? '',
        enabled: schedule?.enabled ?? true,
        frequency: schedule?.frequency ?? 'monthly',
        day_of_month: schedule?.day_of_month ?? 1,
        day_of_week: schedule?.day_of_week ?? 1,
        time: schedule?.time ?? '09:00',
        subject: schedule?.subject ?? '',
        body: schedule?.body || DEFAULT_TEMPLATE,
        recipient_ids: [] as number[],
    });

    const cadenceSummary = () => {
        const t = form.data.time;
        if (form.data.frequency === 'daily') return `Every day at ${t}`;
        if (form.data.frequency === 'weekly') {
            const day = WEEKDAYS.find((w) => w.value === Number(form.data.day_of_week))?.label;
            return `Every ${day} at ${t}`;
        }
        return `Day ${form.data.day_of_month} of every month at ${t}`;
    };

    const toggleRecipient = (id: number) =>
        setRecipientIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAll = () =>
        setRecipientIds(
            recipientIds.size === departments.length
                ? new Set()
                : new Set(departments.map((d) => d.id)),
        );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            recipient_ids: Array.from(recipientIds),
        }));

        if (isEdit) {
            form.patch(`/mail-automation/schedules/${schedule.id}`, {
                onSuccess: () => toast.success('Schedule saved.'),
                onError: (errs) => toast.error(Object.values(errs)[0] ?? 'Failed to save.'),
            });
        } else {
            form.post('/mail-automation/schedules', {
                onSuccess: () => toast.success('Schedule created.'),
                onError: (errs) => toast.error(Object.values(errs)[0] ?? 'Failed to create.'),
            });
        }
    };

    return (
        <>
            <Head title={isEdit ? `Edit: ${schedule.name}` : 'New Schedule'} />

            <div className="flex flex-col gap-6 p-4 pb-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            {isEdit ? `Edit: ${schedule.name}` : 'New Schedule'}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {form.data.enabled ? cadenceSummary() : 'Automation disabled'}
                            {isEdit && schedule.last_sent_at && (
                                <> · Last sent {new Date(schedule.last_sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                            )}
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0">
                        <Link href="/mail-automation/schedules">
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Identity */}
                    <section className="rounded-xl border bg-card p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <Label>Schedule name</Label>
                                <Input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g. Monthly Newsletter, Weekly Digest"
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-xs text-red-600">{form.errors.name}</p>
                                )}
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 pt-7 text-sm select-none shrink-0">
                                <Checkbox
                                    checked={form.data.enabled}
                                    onCheckedChange={(v) => form.setData('enabled', !!v)}
                                />
                                Enable automation
                            </label>
                        </div>
                    </section>

                    {/* Timing */}
                    <section className="rounded-xl border bg-card p-6">
                        <h2 className="font-semibold">Timing</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">When should this email go out?</p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select
                                    value={form.data.frequency}
                                    onValueChange={(v) =>
                                        form.setData('frequency', v as 'daily' | 'weekly' | 'monthly')
                                    }
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {form.data.frequency === 'monthly' && (
                                <div className="space-y-2">
                                    <Label>Day of month <span className="text-muted-foreground">(1–28)</span></Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={28}
                                        value={form.data.day_of_month}
                                        onChange={(e) => form.setData('day_of_month', Number(e.target.value))}
                                    />
                                </div>
                            )}

                            {form.data.frequency === 'weekly' && (
                                <div className="space-y-2">
                                    <Label>Day of week</Label>
                                    <Select
                                        value={String(form.data.day_of_week)}
                                        onValueChange={(v) => form.setData('day_of_week', Number(v))}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {WEEKDAYS.map((w) => (
                                                <SelectItem key={w.value} value={String(w.value)}>
                                                    {w.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Send time <span className="text-muted-foreground">(24 h)</span></Label>
                                <Input
                                    type="time"
                                    value={form.data.time}
                                    onChange={(e) => form.setData('time', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Template */}
                    <section className="rounded-xl border bg-card p-6 space-y-4">
                        <div>
                            <h2 className="font-semibold">Email template</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Reused on every automated run for this schedule.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                placeholder="e.g. Update from the NHEI Web Team"
                            />
                            {form.errors.subject && (
                                <p className="text-xs text-red-600">{form.errors.subject}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Body</Label>
                            <RichTextEditor
                                value={form.data.body}
                                onChange={(html) => form.setData('body', html)}
                            />
                        </div>
                    </section>

                    {/* Recipients */}
                    <section className="rounded-xl border bg-card p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Recipients</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Who receives this schedule's sends. Manage the full list on the{' '}
                                    <Link href="/mail-automation/recipients" className="text-primary underline-offset-2 hover:underline">
                                        Recipients page
                                    </Link>
                                    .
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                    {recipientIds.size}/{departments.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                                >
                                    {recipientIds.size === departments.length ? 'Deselect all' : 'Select all'}
                                </button>
                            </div>
                        </div>

                        {departments.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No recipients yet.{' '}
                                <Link href="/mail-automation/recipients" className="text-primary underline-offset-2 hover:underline">
                                    Add one
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
                                {departments.map((d) => (
                                    <label
                                        key={d.id}
                                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 hover:bg-muted/60 select-none"
                                    >
                                        <Checkbox
                                            checked={recipientIds.has(d.id)}
                                            onCheckedChange={() => toggleRecipient(d.id)}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium leading-tight">{d.department}</p>
                                            <p className="truncate text-xs text-muted-foreground">{d.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/mail-automation/schedules">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            {form.processing
                                ? (isEdit ? 'Saving…' : 'Creating…')
                                : (isEdit ? 'Save changes' : 'Create schedule')}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

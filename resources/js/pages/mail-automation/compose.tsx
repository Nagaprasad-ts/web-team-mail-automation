import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Department = {
    id: number;
    department: string;
    email: string;
    active: boolean;
};

type Props = {
    departments: Department[];
};

const DEFAULT_TEMPLATE = `<p>Dear Team,</p>
<p>Greetings from the NHEI Web Team!</p>
<p>[Write your message here...]</p>
<p>Regards,<br/>NHEI Web Team</p>`;

export default function ComposePage({ departments }: Props) {
    const [selected, setSelected] = useState<Set<number>>(
        () => new Set(departments.map((d) => d.id)),
    );

    const form = useForm({ subject: '', body: DEFAULT_TEMPLATE });

    const selectedEmails = useMemo(
        () => departments.filter((d) => selected.has(d.id)).map((d) => d.email),
        [departments, selected],
    );

    const toggle = (id: number) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAll = () =>
        setSelected(
            selected.size === departments.length
                ? new Set()
                : new Set(departments.map((d) => d.id)),
        );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (selectedEmails.length === 0) {
            toast.error('Select at least one recipient.');
            return;
        }
        router.post(
            '/mail-automation/send',
            { subject: form.data.subject, body: form.data.body, recipients: selectedEmails },
            {
                onSuccess: () => toast.success(`Mail sent to ${selectedEmails.length} recipients.`),
                onError: (errs) => toast.error(Object.values(errs)[0] ?? 'Failed to send.'),
            },
        );
    };

    return (
        <>
            <Head title="Compose & Send" />

            <div className="flex flex-col gap-6 p-4 pb-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Compose & Send</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Write and dispatch a one-off newsletter. This won't affect the automated schedule.
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="shrink-0">
                        <Link href="/mail-automation">
                            <ArrowLeft className="size-4" /> Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email content */}
                    <section className="rounded-xl border bg-card p-6 space-y-4">
                        <div>
                            <h2 className="font-semibold">Email content</h2>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={form.data.subject}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                placeholder="Monthly update from the NHEI Web Team"
                                required
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
                                <div className="flex items-center gap-2">
                                    <Users className="size-4 text-primary" />
                                    <h2 className="font-semibold">Recipients</h2>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                        {selected.size}/{departments.length}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pick the departments for this one-off send. Manage the master list on the{' '}
                                    <Link href="/mail-automation/recipients" className="text-primary underline-offset-2 hover:underline">
                                        Recipients page
                                    </Link>
                                    .
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline"
                            >
                                {selected.size === departments.length ? 'Deselect all' : 'Select all'}
                            </button>
                        </div>

                        {departments.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No active recipients.{' '}
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
                                            checked={selected.has(d.id)}
                                            onCheckedChange={() => toggle(d.id)}
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

                    {/* Footer actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            Sending to{' '}
                            <span className="font-semibold text-foreground">{selectedEmails.length}</span>{' '}
                            of {departments.length} departments
                        </p>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/mail-automation">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing || selectedEmails.length === 0}
                            >
                                <Send className="size-4" />
                                {form.processing ? 'Sending…' : 'Send Now'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

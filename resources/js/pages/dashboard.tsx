import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    History,
    Mail,
    ShieldCheck,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import type { DashboardInvitation } from '@/types';

type Props = {
    pendingInvitations?: DashboardInvitation[];
};

const quickActions = [
    {
        href: '/mail-automation',
        title: 'Compose & schedule',
        description: 'Send a newsletter now or configure the automated cadence.',
        icon: Mail,
        accent: 'bg-primary/10 text-primary',
    },
    {
        href: '/mail-automation/recipients',
        title: 'Manage recipients',
        description: 'Add, edit, pause or remove department contacts.',
        icon: Users,
        accent: 'bg-blue-500/10 text-blue-500',
    },
    {
        href: '/mail-automation/history',
        title: 'Campaign history',
        description: 'Audit every send — manual or automated — with full details.',
        icon: History,
        accent: 'bg-purple-500/10 text-purple-500',
    },
];

const principles = [
    {
        icon: CalendarClock,
        title: 'Schedule once, run forever',
        body: 'Configure frequency, day, and time. The system fires automatically — no manual intervention required.',
    },
    {
        icon: ShieldCheck,
        title: 'One source of truth',
        body: 'The recipient list is shared across automated and manual sends. Pause an HOD to skip them without losing the record.',
    },
    {
        icon: Zap,
        title: 'Override anytime',
        body: 'Need a one-off announcement? Compose & send now picks a custom subset without touching the schedule.',
    },
];

const rules = [
    'Do not send promotional or third-party content through this system.',
    'Verify all department email addresses before adding them to the list.',
    'Sensitive announcements must be approved by the relevant HOD before dispatch.',
    'Review every "failed" or "partial" campaign in Campaign History the same day.',
    'Do not modify the SES configuration or scheduled cron without the Web Team Lead’s approval.',
];

export default function Dashboard({ pendingInvitations = [] }: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const user = usePage().props.auth?.user;

    return (
        <>
            <Head title="Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="flex flex-col gap-6 p-4">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary">
                                NHEI · Web Team Console
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
                            </h1>
                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                Compose newsletters, manage the recipient
                                directory, and audit every send. Read the
                                guidelines below before dispatching anything
                                official.
                            </p>
                        </div>
                        <Button asChild size="lg">
                            <Link href="/mail-automation">
                                <Mail className="size-4" /> Open Mail Automation
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    {quickActions.map(
                        ({ href, title, description, icon: Icon, accent }) => (
                            <Link
                                key={href}
                                href={href}
                                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex size-10 items-center justify-center rounded-lg ${accent}`}
                                    >
                                        <Icon className="size-5" />
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            </Link>
                        ),
                    )}
                </div>

                {/* Principles */}
                <div className="rounded-xl border p-6">
                    <h2 className="text-lg font-semibold">
                        How this works
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Three principles that keep the system predictable.
                    </p>
                    <div className="mt-5 grid gap-5 md:grid-cols-3">
                        {principles.map(({ icon: Icon, title, body }) => (
                            <div key={title} className="flex gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium">
                                        {title}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {body}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rules */}
                <div className="rounded-xl border p-6">
                    <h2 className="text-lg font-semibold">
                        Rules & regulations
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Non-negotiables for anyone sending through this console.
                    </p>
                    <ol className="mt-5 space-y-3 text-sm">
                        {rules.map((rule, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                    {i + 1}
                                </span>
                                <span className="leading-relaxed">{rule}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});

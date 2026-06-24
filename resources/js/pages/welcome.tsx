import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarClock, History, Send, Users } from 'lucide-react';
import { dashboard, login } from '@/routes';

const chips = [
    { icon: CalendarClock, label: 'Schedules' },
    { icon: Send,          label: 'Compose' },
    { icon: Users,         label: 'Recipients' },
    { icon: History,       label: 'Logs' },
];

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';
    const ctaHref  = auth.user ? dashboardUrl : login();
    const ctaLabel = auth.user ? 'Go to Dashboard →' : 'Sign in to continue →';

    return (
        <>
            <Head title="NHEI Web Team · Mail Automation" />

            <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
                {/* Subtle radial glow behind the hero */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
                    style={{
                        background:
                            'radial-gradient(ellipse 70% 40% at 50% 0%, color-mix(in srgb, var(--color-primary, #1a6b42) 8%, transparent), transparent)',
                    }}
                />

                {/* ── Hero ─────────────────────────────────────────────── */}
                <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
                    {/* Logo mark */}
                    <div className="mb-7 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/8 dark:bg-white/10 dark:ring-white/10">
                        <img src="/nhei-favicon.ico" alt="NHEI" className="size-14 object-contain" />
                    </div>

                    {/* Identity */}
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        New Horizon Educational Institutions
                    </p>
                    <h1 className="mt-3 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
                        Mail Automation
                    </h1>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                        Internal platform for the Web Team to automate and manage department email communications.
                    </p>

                    {/* CTA */}
                    <Link
                        href={ctaHref}
                        className="mt-8 inline-flex items-center rounded-xl bg-primary px-7 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {ctaLabel}
                    </Link>

                    {/* Feature chips */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                        {chips.map(({ icon: Icon, label }) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground"
                            >
                                <Icon className="size-3.5" />
                                {label}
                            </span>
                        ))}
                    </div>
                </main>

                {/* ── Footer ───────────────────────────────────────────── */}
                <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} New Horizon Educational Institutions · Web Team · Internal Use Only
                </footer>
            </div>
        </>
    );
}

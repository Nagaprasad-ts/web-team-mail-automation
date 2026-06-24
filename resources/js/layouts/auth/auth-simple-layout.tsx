import { Link } from '@inertiajs/react';
import { CalendarClock, History, Send, Users } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const features = [
    { icon: CalendarClock, text: 'Automated scheduled sends' },
    { icon: Send,          text: 'Compose & send instantly' },
    { icon: Users,         text: 'Department recipient management' },
    { icon: History,       text: 'Complete email audit log' },
];

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh lg:grid-cols-[420px_1fr]">

            {/* ── Left brand panel (desktop only) ─────────────────────── */}
            <aside className="relative hidden flex-col justify-between bg-zinc-950 p-10 lg:flex">
                {/* Logo */}
                <Link href={home()} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
                        <img src="/nhei-favicon.ico" alt="NHEI" className="size-7 object-contain" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight text-white">NHEI Web Team</p>
                        <p className="text-xs text-white/40">Mail Automation Console</p>
                    </div>
                </Link>

                {/* Tagline + features */}
                <div>
                    <h2 className="text-3xl font-semibold leading-snug tracking-tight text-white">
                        Department email<br />automation,<br />simplified.
                    </h2>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
                        Manage scheduled sends, one-off announcements, and your full recipient list — all in one place.
                    </p>
                    <ul className="mt-8 space-y-3">
                        {features.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                                    <Icon className="size-3.5 text-white/60" />
                                </span>
                                <span className="text-sm text-white/55">{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Attribution */}
                <p className="text-xs text-white/20">
                    New Horizon Educational Institutions · Internal Use Only
                </p>
            </aside>

            {/* ── Right form panel ─────────────────────────────────────── */}
            <main className="flex flex-col items-center justify-center bg-background p-6 md:p-10">
                {/* Mobile logo */}
                <Link href={home()} className="mb-10 flex items-center gap-3 lg:hidden">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/8 dark:bg-white/10 dark:ring-white/10">
                        <img src="/nhei-favicon.ico" alt="NHEI" className="size-7 object-contain" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight">NHEI Web Team</p>
                        <p className="text-xs text-muted-foreground">Mail Automation Console</p>
                    </div>
                </Link>

                <div className="w-full max-w-sm">
                    <div className="mb-7">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}

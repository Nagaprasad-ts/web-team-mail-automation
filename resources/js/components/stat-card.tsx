import { ComponentType } from 'react';

type Props = {
    label: string;
    value: number | string;
    icon?: ComponentType<{ className?: string }>;
    tint?: string;
};

export default function StatCard({ label, value, icon: Icon, tint = 'text-foreground' }: Props) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between">
                <p className={`text-3xl font-semibold ${tint}`}>{value}</p>
                {Icon && <Icon className={`size-4 ${tint}`} />}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

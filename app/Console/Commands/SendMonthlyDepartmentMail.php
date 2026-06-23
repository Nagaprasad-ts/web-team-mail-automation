<?php

namespace App\Console\Commands;

use App\Models\DepartmentEmail;
use App\Models\MailSchedule;
use App\Services\DepartmentMailer;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendMonthlyDepartmentMail extends Command
{
    protected $signature = 'mail:send-scheduled {--force : Send all enabled schedules regardless of timing}';

    protected $description = 'Send newsletters for every enabled schedule that is due at the current minute';

    public function handle(DepartmentMailer $mailer): int
    {
        $now = Carbon::now();
        $schedules = MailSchedule::query()->where('enabled', true)->get();

        if ($schedules->isEmpty()) {
            return self::SUCCESS;
        }

        foreach ($schedules as $schedule) {
            if (! $this->option('force') && ! $schedule->isDueAt($now)) {
                continue;
            }

            if (! $schedule->subject || ! $schedule->body) {
                $this->warn("Schedule [{$schedule->id}] \"{$schedule->name}\" has no subject/body — skipping.");
                continue;
            }

            if (! $this->option('force')
                && $schedule->last_sent_at
                && $schedule->last_sent_at->isSameMinute($now)
            ) {
                continue;
            }

            $ids = $schedule->recipient_ids ?? [];
            $emails = empty($ids)
                ? null
                : DepartmentEmail::whereIn('id', $ids)->where('active', true)->pluck('email')->all();

            $campaign = $mailer->send(
                subject: $schedule->subject,
                bodyHtml: $schedule->body,
                recipientEmails: $emails,
                triggeredBy: 'cron',
            );

            $schedule->update(['last_sent_at' => $now]);

            $this->info("Schedule [{$schedule->id}] \"{$schedule->name}\" dispatched. Campaign #{$campaign->id}, status: {$campaign->status}.");
        }

        return self::SUCCESS;
    }
}

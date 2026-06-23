<?php

namespace App\Services;

use App\Mail\DepartmentNewsletter;
use App\Models\DepartmentEmail;
use App\Models\MailCampaign;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DepartmentMailer
{
    /**
     * @param  array<int, string>|null  $recipientEmails  When null, sends to all active department emails.
     */
    public function send(
        string $subject,
        string $bodyHtml,
        ?array $recipientEmails = null,
        string $triggeredBy = 'manual',
        ?int $userId = null,
    ): MailCampaign {
        $recipients = $recipientEmails === null
            ? DepartmentEmail::query()->where('active', true)->pluck('email')->all()
            : array_values(array_unique(array_filter($recipientEmails)));

        $failed = [];

        foreach ($recipients as $email) {
            try {
                Mail::to($email)->send(new DepartmentNewsletter($subject, $bodyHtml));
            } catch (\Throwable $e) {
                Log::error('Department mail send failed', [
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
                $failed[] = $email;
            }
        }

        $status = match (true) {
            count($failed) === 0 => 'sent',
            count($failed) === count($recipients) => 'failed',
            default => 'partial',
        };

        return MailCampaign::create([
            'subject' => $subject,
            'body' => $bodyHtml,
            'recipients' => $recipients,
            'status' => $status,
            'triggered_by' => $triggeredBy,
            'user_id' => $userId,
            'sent_at' => now(),
        ]);
    }
}

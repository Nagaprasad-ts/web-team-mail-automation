<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name', 'enabled', 'frequency', 'day_of_month', 'day_of_week', 'time',
    'subject', 'body', 'recipient_ids', 'last_sent_at',
])]
class MailSchedule extends Model
{
    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'recipient_ids' => 'array',
            'last_sent_at' => 'datetime',
        ];
    }

    public function isDueAt(\Illuminate\Support\Carbon $now): bool
    {
        if (! $this->enabled) {
            return false;
        }

        [$h, $m] = array_pad(explode(':', $this->time), 2, '00');
        if ((int) $now->format('H') !== (int) $h || (int) $now->format('i') !== (int) $m) {
            return false;
        }

        return match ($this->frequency) {
            'daily'   => true,
            'weekly'  => (int) $now->dayOfWeek === (int) $this->day_of_week,
            'monthly' => (int) $now->day === (int) $this->day_of_month,
            default   => false,
        };
    }
}

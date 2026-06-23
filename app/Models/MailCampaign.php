<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['subject', 'body', 'recipients', 'status', 'triggered_by', 'user_id', 'sent_at'])]
class MailCampaign extends Model
{
    protected function casts(): array
    {
        return [
            'recipients' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

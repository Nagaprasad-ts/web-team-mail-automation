<?php

use App\Models\TeamInvitation;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    TeamInvitation::query()
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->delete();
})->daily()->description('Delete expired team invitations');

Schedule::command('mail:send-scheduled')
    ->everyMinute()
    ->withoutOverlapping()
    ->description('Check user-configured schedule and dispatch newsletter when due');

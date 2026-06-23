<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MailAutomationController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');

    // Dashboard
    Route::get('mail-automation', [MailAutomationController::class, 'index'])->name('mail-automation.index');

    // Schedules (list + CRUD)
    Route::get('mail-automation/schedules', [MailAutomationController::class, 'schedules'])->name('mail-automation.schedules');
    Route::get('mail-automation/schedules/create', [MailAutomationController::class, 'scheduleCreate'])->name('mail-automation.schedules.create');
    Route::post('mail-automation/schedules', [MailAutomationController::class, 'storeSchedule'])->name('mail-automation.schedules.store');
    Route::get('mail-automation/schedules/{schedule}/edit', [MailAutomationController::class, 'scheduleEdit'])->name('mail-automation.schedules.edit');
    Route::patch('mail-automation/schedules/{schedule}', [MailAutomationController::class, 'updateSchedule'])->name('mail-automation.schedules.update');
    Route::delete('mail-automation/schedules/{schedule}', [MailAutomationController::class, 'destroySchedule'])->name('mail-automation.schedules.destroy');
    Route::patch('mail-automation/schedules/{schedule}/toggle', [MailAutomationController::class, 'toggleSchedule'])->name('mail-automation.schedules.toggle');

    // Compose & send (one-off)
    Route::get('mail-automation/compose', [MailAutomationController::class, 'compose'])->name('mail-automation.compose');
    Route::post('mail-automation/send', [MailAutomationController::class, 'send'])->name('mail-automation.send');

    // History
    Route::get('mail-automation/history', [MailAutomationController::class, 'history'])->name('mail-automation.history');

    // Recipients
    Route::get('mail-automation/recipients', [MailAutomationController::class, 'recipients'])->name('mail-automation.recipients');
    Route::post('mail-automation/departments', [MailAutomationController::class, 'storeDepartment'])->name('mail-automation.departments.store');
    Route::patch('mail-automation/departments/{department}', [MailAutomationController::class, 'updateDepartment'])->name('mail-automation.departments.update');
    Route::delete('mail-automation/departments', [MailAutomationController::class, 'destroyAllDepartments'])->name('mail-automation.departments.destroyAll');
    Route::post('mail-automation/departments/bulk-delete', [MailAutomationController::class, 'destroyManyDepartments'])->name('mail-automation.departments.bulkDelete');
    Route::delete('mail-automation/departments/{department}', [MailAutomationController::class, 'destroyDepartment'])->name('mail-automation.departments.destroy');
});

require __DIR__.'/settings.php';

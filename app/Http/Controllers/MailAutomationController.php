<?php

namespace App\Http\Controllers;

use App\Models\DepartmentEmail;
use App\Models\MailCampaign;
use App\Models\MailSchedule;
use App\Services\DepartmentMailer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class MailAutomationController extends Controller
{
    // ── Dashboard ─────────────────────────────────────────────────────────────

    public function index(): Response
    {
        $activeCount = DepartmentEmail::query()->where('active', true)->count();
        $lastCampaign = MailCampaign::query()->latest('sent_at')->first();
        $totalSchedules = MailSchedule::query()->count();
        $activeSchedules = MailSchedule::query()->where('enabled', true)->count();

        return Inertia::render('mail-automation/index', [
            'scheduleStats' => [
                'total'  => $totalSchedules,
                'active' => $activeSchedules,
            ],
            'overview' => [
                'active_recipients' => $activeCount,
                'last_campaign' => $lastCampaign ? [
                    'subject'         => $lastCampaign->subject,
                    'status'          => $lastCampaign->status,
                    'triggered_by'    => $lastCampaign->triggered_by,
                    'sent_at'         => $lastCampaign->sent_at?->toIso8601String(),
                    'recipient_count' => count($lastCampaign->recipients ?? []),
                ] : null,
            ],
        ]);
    }

    // ── Schedule list ─────────────────────────────────────────────────────────

    public function schedules(): Response
    {
        $schedules = MailSchedule::query()
            ->orderByDesc('enabled')
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id'           => $s->id,
                'name'         => $s->name,
                'enabled'      => $s->enabled,
                'frequency'    => $s->frequency,
                'day_of_month' => $s->day_of_month,
                'day_of_week'  => $s->day_of_week,
                'time'         => $s->time,
                'subject'      => $s->subject ?? '',
                'recipient_ids' => $s->recipient_ids ?? [],
                'last_sent_at' => $s->last_sent_at?->toIso8601String(),
            ]);

        return Inertia::render('mail-automation/schedules', [
            'schedules' => $schedules,
            'stats' => [
                'total'  => $schedules->count(),
                'active' => $schedules->where('enabled', true)->count(),
                'paused' => $schedules->where('enabled', false)->count(),
            ],
        ]);
    }

    // ── Schedule create/edit ──────────────────────────────────────────────────

    public function scheduleCreate(): Response
    {
        return Inertia::render('mail-automation/schedule', [
            'departments' => DepartmentEmail::query()
                ->orderBy('department')
                ->get(['id', 'department', 'email', 'active']),
            'schedule' => null,
        ]);
    }

    public function scheduleEdit(MailSchedule $schedule): Response
    {
        return Inertia::render('mail-automation/schedule', [
            'departments' => DepartmentEmail::query()
                ->orderBy('department')
                ->get(['id', 'department', 'email', 'active']),
            'schedule' => [
                'id'           => $schedule->id,
                'name'         => $schedule->name,
                'enabled'      => $schedule->enabled,
                'frequency'    => $schedule->frequency,
                'day_of_month' => $schedule->day_of_month,
                'day_of_week'  => $schedule->day_of_week,
                'time'         => $schedule->time,
                'subject'      => $schedule->subject ?? '',
                'body'         => $schedule->body ?? '',
                'recipient_ids' => $schedule->recipient_ids ?? [],
                'last_sent_at' => $schedule->last_sent_at?->toIso8601String(),
            ],
        ]);
    }

    // ── Schedule store/update/delete/toggle ───────────────────────────────────

    public function storeSchedule(Request $request): RedirectResponse
    {
        $data = $this->validateSchedule($request);
        $this->normaliseDays($data);

        MailSchedule::create($data);

        return Redirect::route('mail-automation.schedules')
            ->with('success', 'Schedule created.');
    }

    public function updateSchedule(Request $request, MailSchedule $schedule): RedirectResponse
    {
        $data = $this->validateSchedule($request);
        $this->normaliseDays($data);

        $schedule->update($data);

        return Redirect::route('mail-automation.schedules')
            ->with('success', 'Schedule saved.');
    }

    public function destroySchedule(MailSchedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return back()->with('success', 'Schedule deleted.');
    }

    public function toggleSchedule(Request $request, MailSchedule $schedule): RedirectResponse
    {
        $data = $request->validate(['enabled' => ['required', 'boolean']]);
        $schedule->update(['enabled' => $data['enabled']]);

        return back()->with(
            'success',
            $data['enabled'] ? "\"{$schedule->name}\" resumed." : "\"{$schedule->name}\" paused.",
        );
    }

    // ── Compose ───────────────────────────────────────────────────────────────

    public function compose(): Response
    {
        return Inertia::render('mail-automation/compose', [
            'departments' => DepartmentEmail::query()
                ->where('active', true)
                ->orderBy('department')
                ->get(['id', 'department', 'email', 'active']),
        ]);
    }

    // ── Send (manual) ─────────────────────────────────────────────────────────

    public function send(Request $request, DepartmentMailer $mailer): RedirectResponse
    {
        $data = $request->validate([
            'subject'      => ['required', 'string', 'max:255'],
            'body'         => ['required', 'string'],
            'recipients'   => ['required', 'array', 'min:1'],
            'recipients.*' => ['email'],
        ]);

        $campaign = $mailer->send(
            subject: $data['subject'],
            bodyHtml: $data['body'],
            recipientEmails: $data['recipients'],
            triggeredBy: 'manual',
            userId: $request->user()?->id,
        );

        return Redirect::route('mail-automation.index')->with('success', match ($campaign->status) {
            'sent'    => 'Mail sent to '.count($campaign->recipients).' recipients.',
            'partial' => 'Mail partially sent. Check logs for failures.',
            'failed'  => 'Mail send failed. Check logs.',
        });
    }

    // ── History ───────────────────────────────────────────────────────────────

    public function history(): Response
    {
        $campaigns = MailCampaign::query()
            ->latest('sent_at')
            ->take(100)
            ->get(['id', 'subject', 'body', 'status', 'triggered_by', 'sent_at', 'recipients'])
            ->map(fn ($c) => [
                'id'              => $c->id,
                'subject'         => $c->subject,
                'body'            => $c->body,
                'status'          => $c->status,
                'triggered_by'    => $c->triggered_by,
                'sent_at'         => $c->sent_at?->toIso8601String(),
                'recipients'      => $c->recipients ?? [],
                'recipient_count' => count($c->recipients ?? []),
            ]);

        return Inertia::render('mail-automation/history', [
            'campaigns' => $campaigns,
            'stats' => [
                'total'     => $campaigns->count(),
                'automated' => $campaigns->where('triggered_by', 'cron')->count(),
                'manual'    => $campaigns->where('triggered_by', 'manual')->count(),
                'failed'    => $campaigns->whereIn('status', ['failed', 'partial'])->count(),
            ],
        ]);
    }

    // ── Recipients CRUD ───────────────────────────────────────────────────────

    public function recipients(): Response
    {
        return Inertia::render('mail-automation/recipients', [
            'departments' => DepartmentEmail::query()
                ->orderBy('department')
                ->get(['id', 'department', 'email', 'active']),
        ]);
    }

    public function storeDepartment(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'department' => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:department_emails,email'],
        ]);

        DepartmentEmail::create(['department' => $data['department'], 'email' => $data['email'], 'active' => true]);

        return back()->with('success', 'Department added.');
    }

    public function updateDepartment(Request $request, DepartmentEmail $department): RedirectResponse
    {
        $data = $request->validate([
            'department' => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:department_emails,email,'.$department->id],
            'active'     => ['required', 'boolean'],
        ]);

        $department->update($data);

        return back()->with('success', 'Department updated.');
    }

    public function destroyDepartment(DepartmentEmail $department): RedirectResponse
    {
        $department->delete();

        return back()->with('success', 'Department removed.');
    }

    public function destroyAllDepartments(): RedirectResponse
    {
        DepartmentEmail::query()->delete();

        return back()->with('success', 'All departments removed.');
    }

    public function destroyManyDepartments(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:department_emails,id'],
        ]);

        $count = DepartmentEmail::whereIn('id', $data['ids'])->delete();

        return back()->with('success', "$count recipient(s) removed.");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function validateSchedule(Request $request): array
    {
        return $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'enabled'        => ['required', 'boolean'],
            'frequency'      => ['required', 'in:daily,weekly,monthly'],
            'day_of_month'   => ['nullable', 'integer', 'between:1,28'],
            'day_of_week'    => ['nullable', 'integer', 'between:0,6'],
            'time'           => ['required', 'regex:/^\d{2}:\d{2}$/'],
            'subject'        => ['nullable', 'string', 'max:255'],
            'body'           => ['nullable', 'string'],
            'recipient_ids'  => ['nullable', 'array'],
            'recipient_ids.*' => ['integer', 'exists:department_emails,id'],
        ]);
    }

    private function normaliseDays(array &$data): void
    {
        if ($data['frequency'] === 'monthly') {
            $data['day_of_week'] = null;
            $data['day_of_month'] = $data['day_of_month'] ?? 1;
        } elseif ($data['frequency'] === 'weekly') {
            $data['day_of_month'] = null;
            $data['day_of_week'] = $data['day_of_week'] ?? 1;
        } else {
            $data['day_of_month'] = null;
            $data['day_of_week'] = null;
        }
    }
}

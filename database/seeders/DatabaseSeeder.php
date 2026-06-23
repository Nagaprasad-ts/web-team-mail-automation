<?php

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\DepartmentEmail;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'webteam@college.edu'],
            [
                'name' => 'Web Team Admin',
                'password' => Hash::make('WebTeam@2026'),
                'email_verified_at' => now(),
            ],
        );

        if (! $user->personalTeam()) {
            $team = Team::create(['name' => 'Web Team', 'is_personal' => true]);
            $team->memberships()->create(['user_id' => $user->id, 'role' => TeamRole::Owner]);
            $user->forceFill(['current_team_id' => $team->id])->save();
        }

        $departments = [
            ['department' => 'Computer Science & Engineering', 'email' => 'hod.cse@college.edu'],
            ['department' => 'Information Science & Engineering', 'email' => 'hod.ise@college.edu'],
            ['department' => 'Electronics & Communication', 'email' => 'hod.ece@college.edu'],
            ['department' => 'Electrical & Electronics', 'email' => 'hod.eee@college.edu'],
            ['department' => 'Mechanical Engineering', 'email' => 'hod.mech@college.edu'],
            ['department' => 'Civil Engineering', 'email' => 'hod.civil@college.edu'],
            ['department' => 'Mathematics', 'email' => 'hod.maths@college.edu'],
            ['department' => 'Physics', 'email' => 'hod.physics@college.edu'],
            ['department' => 'Chemistry', 'email' => 'hod.chemistry@college.edu'],
            ['department' => 'MBA', 'email' => 'hod.mba@college.edu'],
        ];

        foreach ($departments as $d) {
            DepartmentEmail::updateOrCreate(
                ['email' => $d['email']],
                ['department' => $d['department'], 'active' => true],
            );
        }
    }
}

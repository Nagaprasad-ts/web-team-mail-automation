<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mail_schedules', function (Blueprint $table) {
            $table->string('name')->default('Monthly Newsletter')->after('id');
        });

        \DB::table('mail_schedules')->where('id', 1)->update(['name' => 'Monthly Newsletter']);
    }

    public function down(): void
    {
        Schema::table('mail_schedules', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mail_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Schedule');
            $table->boolean('enabled')->default(false);
            $table->enum('frequency', ['daily', 'weekly', 'monthly'])->default('monthly');
            $table->unsignedTinyInteger('day_of_month')->nullable();
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->string('time', 5)->default('09:00');
            $table->string('subject')->nullable();
            $table->longText('body')->nullable();
            $table->json('recipient_ids')->nullable();
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_schedules');
    }
};

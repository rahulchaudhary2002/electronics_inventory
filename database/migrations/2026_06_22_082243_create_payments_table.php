<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            // Credit / Due
            $table->decimal('advance_amount', 12, 2)->nullable();
            $table->decimal('remaining_amount', 12, 2)->nullable();
            $table->date('due_date')->nullable();
            // Installment / EMI
            $table->decimal('down_payment', 12, 2)->nullable();
            $table->unsignedTinyInteger('installment_months')->nullable();
            $table->decimal('monthly_installment', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

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
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained()->cascadeOnDelete();
            $table->string('product_name');
            $table->string('product_model')->nullable();
            $table->string('customer_name');
            $table->string('customer_mobile', 20);
            $table->string('customer_address')->nullable();
            $table->enum('case_type', ['warranty_repair', 'exchange_return', 'paid_service']);
            $table->text('problem');
            $table->enum('status', ['received', 'in_progress', 'resolved', 'returned', 'canceled'])->default('received');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};

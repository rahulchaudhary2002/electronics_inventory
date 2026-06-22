<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('origin_outlet_id')->constrained('outlets')->cascadeOnDelete();
            $table->foreignId('destination_outlet_id')->constrained('outlets')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_mobile', 20);
            $table->string('customer_address')->nullable();
            $table->decimal('price', 12, 2);
            $table->decimal('quantity', 10, 2)->default(1);
            $table->enum('payment_type', ['cash', 'cheque', 'online', 'credit', 'installment']);
            $table->enum('status', ['pending', 'confirm', 'dispatched', 'delivered', 'canceled'])->default('pending');
            $table->string('warranty_card')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->decimal('advance_amount', 12, 2)->nullable();
            $table->decimal('remaining_amount', 12, 2)->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('down_payment', 12, 2)->nullable();
            $table->unsignedTinyInteger('installment_months')->nullable();
            $table->decimal('monthly_installment', 12, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('orders');
    }
};

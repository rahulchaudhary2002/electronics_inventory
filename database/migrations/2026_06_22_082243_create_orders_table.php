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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outlet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_mobile', 20);
            $table->string('customer_address')->nullable();
            $table->decimal('price', 12, 2);
            $table->enum('payment_type', ['cash', 'cheque', 'online', 'credit', 'installment']);
            $table->enum('status', ['pending', 'confirm', 'dispatched', 'delivered', 'canceled'])->default('pending');
            $table->string('warranty_card')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

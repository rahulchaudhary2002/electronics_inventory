<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'outlet_id', 'product_id', 'customer_name', 'customer_mobile',
        'customer_address', 'price', 'quantity', 'payment_type', 'status', 'warranty_card',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected $appends = ['warranty_card_url'];

    public function getWarrantyCardUrlAttribute(): ?string
    {
        return $this->warranty_card ? asset('storage/' . $this->warranty_card) : null;
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}

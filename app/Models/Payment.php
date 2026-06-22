<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 'advance_amount', 'remaining_amount', 'due_date',
        'down_payment', 'installment_months', 'monthly_installment',
    ];

    protected $casts = [
        'advance_amount'      => 'decimal:2',
        'remaining_amount'    => 'decimal:2',
        'down_payment'        => 'decimal:2',
        'monthly_installment' => 'decimal:2',
        'due_date'            => 'date:Y-m-d',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

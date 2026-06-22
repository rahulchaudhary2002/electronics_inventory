<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    protected $fillable = [
        'outlet_id', 'product_name', 'product_model', 'customer_name', 'customer_mobile',
        'customer_address', 'case_type', 'problem', 'status',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}

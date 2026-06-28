<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = ['name', 'model_number', 'type', 'warranty', 'image', 'brand_id', 'category_id', 'is_active'];

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function outlets(): BelongsToMany
    {
        return $this->belongsToMany(Outlet::class)
            ->withPivot(['initial_qty', 'cost'])
            ->withTimestamps();
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }
}

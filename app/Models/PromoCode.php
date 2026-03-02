<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
        'code', 'discount_type', 'discount_value', 'min_order_value',
        'max_uses', 'used_count', 'expires_at', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean', 'expires_at' => 'datetime'];
}

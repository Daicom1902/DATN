<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'customer_name', 'customer_email', 'customer_phone',
        'shipping_address', 'shipping_ward', 'shipping_district', 'shipping_city',
        'subtotal', 'discount_amount', 'shipping_fee', 'tax_amount', 'total',
        'promo_code_id', 'promo_code_used',
        'payment_method', 'payment_status', 'status', 'note',
    ];

    protected $casts = [
        'subtotal'        => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_fee'    => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'total'           => 'decimal:2',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

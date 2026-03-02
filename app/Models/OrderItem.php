<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'order_id', 'product_id', 'variant_id',
        'product_name', 'size_label', 'unit_price', 'quantity', 'subtotal', 'image_url',
    ];

    protected $casts = ['unit_price' => 'decimal:2', 'subtotal' => 'decimal:2'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

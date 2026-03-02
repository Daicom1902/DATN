<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    public $timestamps = false;
    protected $fillable = ['product_id', 'size_label', 'price', 'old_price', 'stock', 'sku', 'is_active'];
    protected $casts = ['price' => 'decimal:2', 'old_price' => 'decimal:2', 'is_active' => 'boolean'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

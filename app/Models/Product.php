<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'brand_id', 'category_id', 'description',
        'scent_intensity', 'longevity', 'sillage',
        'price', 'old_price', 'image', 'badge',
        'rating', 'review_count', 'is_active', 'is_featured',
    ];

    protected $casts = [
        'price'     => 'decimal:2',
        'old_price' => 'decimal:2',
        'rating'    => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function fragranceNotes()
    {
        return $this->hasMany(FragranceNote::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class)->where('is_approved', 1);
    }
}

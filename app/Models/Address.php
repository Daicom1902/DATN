<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'recipient', 'phone', 'address_line', 'ward', 'district', 'city', 'is_default'];
    protected $casts = ['is_default' => 'boolean'];
}

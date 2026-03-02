<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FragranceNote extends Model
{
    public $timestamps = false;
    protected $fillable = ['product_id', 'layer', 'note'];
}

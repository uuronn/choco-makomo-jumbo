<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    protected $table = 'user';

    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $hidden = ['created_at', 'updated_at'];

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'name', 'email', 'point', 'photoUrl', 'last_activity_at', 'created_at', 'updated_at'
    ];
}

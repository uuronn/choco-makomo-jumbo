<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    protected $table = 'users';

    protected $primaryKey = 'id';

    public $incrementing = false; // UID を文字列の PK にするため false
    protected $keyType = 'string';

    // protected $fillable = ['id', 'name', 'email', 'point'];
    protected $fillable = [
        'id', 'name', 'email', 'email_verified_at', 'password', 'point', 'remember_token', 'created_at', 'updated_at'
    ];
}

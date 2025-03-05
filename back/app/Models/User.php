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

    protected $fillable = ['id', 'name', 'email', 'point'];
}

<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class UserCharacter extends Model
{
    protected $table = 'userCharacter';

    protected $primaryKey = ['userId', 'characterId'];
    public $incrementing = false;
    protected $keyType = 'string';

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'userId', 'characterId', 'level', 'life', 'power', 'speed', 'evasion'
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'id');
    }

    public function character()
    {
        return $this->belongsTo(Character::class, 'characterId', 'id');
    }

    // public function getKey()
    // {
    //     return [
    //         'userId' => $this->userId,
    //         'characterId' => $this->characterId,
    //     ];
    // }

    protected static function boot()
    {
        parent::boot();
    }
}

<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class UserCharacter extends Model
{
    protected $table = 'user_character';

    protected $primaryKey = ['user_id', 'character_id'];
    public $incrementing = false;
    protected $keyType = 'string';

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'user_id', 'character_id', 'level', 'life', 'power', 'speed', 'evasion'
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function character()
    {
        return $this->belongsTo(Character::class, 'character_id', 'id');
    }

    // 複合主キーの場合、getKeyメソッドをオーバーライド
    public function getKey()
    {
        return [
            'user_id' => $this->user_id,
            'character_id' => $this->character_id,
        ];
    }

    protected static function boot()
    {
        parent::boot();
    }
}

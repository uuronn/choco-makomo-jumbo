<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class UserCharacter extends Model
{
    protected $table = 'user_character';

    protected $primaryKey = ['user_id', 'character_id'];
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id', 'character_id', 'acquired_at', 'level', 'life', 'power', 'speed'
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

    /**
     * モデルが作成される際に初期ステータスを反映
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (is_null($model->power)) {
                $model->life = $model->character->base_life;
                $model->power = $model->character->base_power;
                $model->speed = $model->character->base_speed;
            }
        });
    }
}

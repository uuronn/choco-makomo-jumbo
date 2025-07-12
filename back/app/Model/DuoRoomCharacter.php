<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DuoRoomCharacter extends Model
{
    protected $table = 'duoRoomCharacter';

    // 主キーを UUID（string）にする設定
    protected $keyType = 'string';
    public $incrementing = false;

    // created_at, updated_at は非表示
    protected $hidden = ['created_at', 'updated_at'];

    // マスアサインメント許可
    protected $fillable = [
        'id',
        'duo_room_id',
        'character_id',
        'user_id',
        'level',
        'max_life',
        'life',
        'power',
        'speed',
        'evasion',
        'critical',
        'is_active',
        'is_dead',
        'block_count',
        'confusion_count',
        'poison_count',
        'special_skill_turn',
        'special_used',
        'is_error_mode',
        // 必要に応じて他のステータスも追加
    ];

    // キャスト設定
    protected $casts = [
        'is_active' => 'boolean',
        'is_dead'   => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        // レコード作成時に自動で UUID を振る
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            // is_active / is_dead のデフォルト
            if (is_null($model->is_active)) {
                $model->is_active = true;
            }
            if (is_null($model->is_dead)) {
                $model->is_dead = false;
            }
        });
    }

    /**
     * このキャラクターが所属する DuoRoom
     */
    public function duoRoom()
    {
        return $this->belongsTo(DuoRoom::class, 'duo_room_id', 'id');
    }

    /**
     * 紐づく Character マスタ
     */
    public function character()
    {
        return $this->belongsTo(Character::class, 'character_id', 'id');
    }

    /**
     * このキャラを持つユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}

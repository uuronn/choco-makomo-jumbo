<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Character extends Model
{
    protected $keyType = 'string'; // 主キーが文字列型
    public $incrementing = false;  // 自動インクリメントしない

    protected $fillable = [
        'id', 'name', 'rarity', 'base_power', 'image_url', 'base_life', 'base_speed', 'skill'
    ];

    /**
     * モデルが作成される際にUUIDを自動生成
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}

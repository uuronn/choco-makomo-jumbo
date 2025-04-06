<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;

class ReportLog extends Model
{
    protected $table = 'reportLog';

    protected $fillable = [
        'id',
        'title',
        'content',
        'type',
        'userId'
    ];

    public $incrementing = false;
    protected $keyType = 'string';
}

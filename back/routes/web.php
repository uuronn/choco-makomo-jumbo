<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('app'); // React を埋め込んだ Blade
})->where('any', '.*');

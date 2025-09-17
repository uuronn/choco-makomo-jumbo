<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('welcome'); // React を埋め込んだ Blade
})->where('any', '.*');

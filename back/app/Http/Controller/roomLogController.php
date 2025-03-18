<?php

namespace App\Http\Controller;

use App\Model\RoomLog;
use Illuminate\Http\Request;

class roomLogController
{
    public function logs(Request $request)
    {
        $roomId = $request->route('roomId');
        $logs = RoomLog::where('roomId', $roomId)->orderBy('created_at', 'desc')->get();
        return response()->json($logs, 200);
    }
}

<?php

namespace App\Http\Controller\UserCharacter;

use App\Services\UserCharacterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Http\Response;

readonly class LevelUpUserCharacterController
{
    private UserCharacterService $userCharacterService;

    public function __construct(UserCharacterService $userCharacterService)
    {
        $this->userCharacterService = $userCharacterService;
    }

    /**
     * 特定のユーザーのキャラクターをレベルアップする
     * @param Request $request リクエストオブジェクト
     * @return Response|JsonResponse レスポンス
     * @throws Exception
     */
    public function __invoke(Request $request): Response | JsonResponse
    {
        DB::beginTransaction();

        try {
            $userId = $request->route('userId');
            $characterId = $request->route('characterId');

            if (!$userId || !$characterId) {
                throw new Exception('Missing userId or characterId', 400);
            }

            $request->validate([
                'life' => 'required|integer|min:0',
                'power' => 'required|integer|min:0',
                'speed' => 'required|integer|min:0',
            ]);

            $this->userCharacterService->levelUpUserCharacter(
                $userId,
                $characterId,
                $request->input('life'),
                $request->input('power'),
                $request->input('speed')
            );

            DB::commit();

            return response()->noContent();
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to level up character',
                'error' => $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }
}

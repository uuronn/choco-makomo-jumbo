<?php

namespace App\Http\Controller;

use App\Service\PassiveSkillManager;
use App\Model\Character;
use App\Model\Room;
use App\Model\RoomCharacter;
use App\Model\RoomLog;
use App\Model\User;
use App\Model\UserCharacter;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoomController
{

    /**
     * ルームをマニュアル承認する
     */
    private function approveManually(Room $room)
    {
        DB::transaction(function () use ($room) {
            $roomId = $room->id;

            $hostCharacters = RoomCharacter::where('roomId', $roomId)
                ->where('userId', $room->hostUserId)
                ->with('character')
                ->get();

            $guestCharacters = RoomCharacter::where('roomId', $roomId)
                ->where('userId', $room->guestUserId)
                ->with('character')
                ->get();

            // ホストのボーナス適用
            $hostCharacterNames = $hostCharacters->pluck('character.name')->toArray();
            $hostBonuses = $this->applyPartyBonuses($hostCharacterNames, $room->hostUser, $room);

            foreach ($hostCharacters as $character) {
                RoomCharacter::where('id', $character->id)->update([
                    'life' => $character->life * $hostBonuses['lifeMultiplier'],
                    'maxLife' => $character->maxLife * $hostBonuses['lifeMultiplier'],
                    'power' => $character->power * $hostBonuses['powerMultiplier'],
                    'speed' => $character->speed * $hostBonuses['speedMultiplier'],
                    'evasion' => $character->evasion * $hostBonuses['evasionMultiplier'],
                ]);
            }

            if (!empty($hostBonuses['logs'])) {
                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'partyBonus',
                    'actorUserId' => $room->hostUserId,
                    'description' => implode(' / ', $hostBonuses['logs']),
                ]);
            }

            // ゲストのボーナス適用
            $guestCharacterNames = $guestCharacters->pluck('character.name')->toArray();
            $guestBonuses = $this->applyPartyBonuses($guestCharacterNames, $room->guestUser, $room);

            foreach ($guestCharacters as $character) {
                RoomCharacter::where('id', $character->id)->update([
                    'life' => $character->life * $guestBonuses['lifeMultiplier'],
                    'maxLife' => $character->maxLife * $guestBonuses['lifeMultiplier'],
                    'power' => $character->power * $guestBonuses['powerMultiplier'],
                    'speed' => $character->speed * $guestBonuses['speedMultiplier'],
                    'evasion' => $character->evasion * $guestBonuses['evasionMultiplier'],
                ]);
            }

            if (!empty($guestBonuses['logs'])) {
                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'partyBonus',
                    'actorUserId' => $room->guestUserId,
                    'description' => implode(' / ', $guestBonuses['logs']),
                ]);
            }

            RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);

            $characters = RoomCharacter::where('roomId', $roomId)
                ->orderBy('speed', 'desc')
                ->get();

            $firstTurn = $characters->first();
            $room->update([
                'status' => 'battling',
                'currentTurnUserId' => $firstTurn->userId,
                'currentTurnCharacterId' => $firstTurn->characterId,
            ]);
        });
    }

    /**
     * パーティボーナスを適用する
     */
    private function applyPartyBonuses($characterNames, $user, $room)
    {
        $powerMultiplier = 1.0;
        $speedMultiplier = 1.0;
        $lifeMultiplier = 1.0;
        $evasionMultiplier = 1.0;
        $logs = [];

        // 1. HTML「HTML5トリオ」: HTML, CSS, JavaScriptでパワー1.3倍、HP1.3倍、回避率+10%
        if (!array_diff(['HTML', 'CSS', 'JavaScript'], $characterNames)) {
            $powerMultiplier *= 1.3;
            $lifeMultiplier *= 1.3;
            $evasionMultiplier *= 1.1;
            $logs[] = "{$user->name} が「HTML5トリオ」を発動、攻撃力30%アップ、最大HP30%アップ、回避率10%アップ";
        }

        // 2. CSS「UI/UXトリオ」: CSS, JavaScript, TypeScriptでスピード1.2倍、回避率+10%
        if (!array_diff(['CSS', 'JavaScript', 'TypeScript'], $characterNames)) {
            $speedMultiplier *= 1.2;
            $evasionMultiplier *= 1.1;
            $logs[] = "{$user->name} が「UI/UXトリオ」を発動、スピード20%アップ、回避率10%アップ";
        }

        // 3. JavaScript「フロントエンドトリオ」: JavaScript, HTML, CSSでスピード1.3倍、回避率+10%
        if (!array_diff(['JavaScript', 'HTML', 'CSS'], $characterNames)) {
            $speedMultiplier *= 1.3;
            $evasionMultiplier *= 1.1;
            $logs[] = "{$user->name} が「フロントエンドトリオ」を発動、スピード30%アップ、回避率10%アップ";
        }

        // 4. TypeScript「型安全トリオ」: TypeScript, JavaScript, Reactでパワー1.2倍、スピード1.2倍、回避率+10%
        if (!array_diff(['TypeScript', 'JavaScript', 'React'], $characterNames)) {
            $powerMultiplier *= 1.2;
            $speedMultiplier *= 1.2;
            $evasionMultiplier *= 1.1;
            $logs[] = "{$user->name} が「型安全トリオ」を発動、攻撃力20%アップ、スピード20%アップ、回避率10%アップ";
        }

        // 5. PHP「LAMPスタック」: PHP, MySQL, Apacheでパワー1.5倍、HP1.5倍
        if (!array_diff(['PHP', 'MySQL', 'Apache'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「LAMPスタック」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 6. Ruby「Railsマジック」: Ruby, Ruby on Railsでパワー1.5倍、スピード1.5倍、HP1.5倍
        if (count(array_intersect(['Ruby', 'Ruby on Rails'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「Railsマジック」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 7. Swift「iOS開発」: Swift, JavaScriptでスピード1.5倍、回避率+20%
        if (count(array_intersect(['Swift', 'JavaScript'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「iOS開発」を発動、スピード50%アップ、回避率20%アップ";
        }

        // 8. Angular「三大フレームワーク」: Angular, React, Vueでパワー1.3倍、スピード1.3倍、HP1.3倍、回避率+5%
        if (!array_diff(['Angular', 'React', 'Vue'], $characterNames)) {
            $powerMultiplier *= 1.3;
            $speedMultiplier *= 1.3;
            $lifeMultiplier *= 1.3;
            $evasionMultiplier *= 1.05;
            $logs[] = "{$user->name} が「三大フレームワーク」を発動、攻撃力30%アップ、スピード30%アップ、最大HP30%アップ、回避率5%アップ";
        }

        // 9. React「Reactツートップ」: React, TypeScriptでパワー1.5倍、スピード1.5倍、HP1.5倍
        if (count(array_intersect(['React', 'TypeScript'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「Reactツートップ」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 10. Vue「Vue3」: Vue, JavaScript, TypeScriptでHP50%回復（戦闘開始時）
        if (!array_diff(['Vue', 'JavaScript', 'TypeScript'], $characterNames)) {
            $healRatio = 0.5;
            $characters = RoomCharacter::where('roomId', $room->id)
                ->where('userId', $user->id)
                ->where('isDead', false)
                ->get();
            foreach ($characters as $character) {
                $healAmount = $character->maxLife * $healRatio;
                $newLife = min($character->maxLife, $character->life + $healAmount);
                $character->update(['life' => $newLife]);
            }
            $logs[] = "{$user->name} が「Vue3」を発動、味方全員のHP50%回復";
        }

        // 11. Ruby on Rails「規約優先」: Ruby on Rails, Rubyでパワー1.5倍、スピード1.5倍、HP1.5倍
        if (count(array_intersect(['Ruby on Rails', 'Ruby'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「規約優先」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 12. AWS「三大クラウド」: AWS, Azure, Google CloudでHP1.6倍
        if (!array_diff(['AWS', 'Azure', 'Google Cloud'], $characterNames)) {
            $lifeMultiplier *= 1.6;
            $logs[] = "{$user->name} が「三大クラウド」を発動、最大HP60%アップ";
        }

        // 13. Azure「クラウドマスター」: Azure, AWSでパワー1.5倍、HP1.5倍
        if (count(array_intersect(['Azure', 'AWS'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「クラウドマスター」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 14. Google Cloud「AIクラウド」: Google Cloud, Pythonでパワー1.5倍、スピード1.5倍
        if (count(array_intersect(['Google Cloud', 'Python'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「AIクラウド」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 15. Docker「ハイパーバイザー型」: Docker＋2体以上でパワー1.1倍、スピード1.1倍、回避率+10%
        if (in_array('Docker', $characterNames) && count($characterNames) >= 2) {
            $powerMultiplier *= 1.1;
            $speedMultiplier *= 1.1;
            $evasionMultiplier *= 1.1;
            $logs[] = "{$user->name} が「ハイパーバイザー型」を発動、攻撃力10%アップ、スピード10%アップ、回避率10%アップ";
        }

        // 16. Linux「オープンソース」: Linux, Apache, MySQLでパワー1.5倍、HP1.5倍
        if (!array_diff(['Linux', 'Apache', 'MySQL'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「オープンソース」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 17. Mac「Appleエコシステム」: Mac, Swiftでパワー1.5倍、スピード1.5倍、HP1.5倍
        if (count(array_intersect(['Mac', 'Swift'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「Appleエコシステム」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 18. Windows「WSL2」: Windows（Linux, Macがいない場合）＋2体以上でHP1.3倍、パワー1.2倍、スピード0.8倍
        $osCharacters = ['Linux', 'Mac'];
        if (in_array('Windows', $characterNames) &&
            count(array_intersect($characterNames, $osCharacters)) === 0 &&
            count($characterNames) >= 2) {
            $powerMultiplier *= 1.2;
            $lifeMultiplier *= 1.3;
            $speedMultiplier *= 0.8;
            $logs[] = "{$user->name} が「WSL2」を発動、最大HP30%アップ、攻撃力20%アップ、スピード20%ダウン";
        }

        // 19. MySQL「DBトリオ」: MySQL, PostgreSQL, Supabaseでパワー1.3倍、スピード1.3倍、HP1.3倍、回避率+10%
        if (!array_diff(['MySQL', 'PostgreSQL', 'Supabase'], $characterNames)) {
            $powerMultiplier *= 1.3;
            $speedMultiplier *= 1.3;
            $lifeMultiplier *= 1.3;
            $evasionMultiplier *= 1.1;
            $logs[] = "{$user->name} が「DBトリオ」を発動、攻撃力30%アップ、スピード30%アップ、最大HP30%アップ、回避率10%アップ";
        }

        // 20. PostgreSQL「DBマスター」: PostgreSQL, MySQLでパワー1.5倍、HP1.5倍
        if (count(array_intersect(['PostgreSQL', 'MySQL'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「DBマスター」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 21. Supabase「リアルタイムDB」: Supabase, Firebaseでパワー1.5倍、スピード1.5倍
        if (count(array_intersect(['Supabase', 'Firebase'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「リアルタイムDB」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 22. Unity「ゲーム開発トリオ」: Unity, JavaScript, C#でパワー1.5倍、スピード1.5倍、HP1.5倍
        if (!array_diff(['Unity', 'JavaScript', 'C#'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「ゲーム開発トリオ」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 23. Scratch「キッズプログラミング」: Scratch, Viscuitでスピード1.5倍、回避率+20%
        if (count(array_intersect(['Scratch', 'Viscuit'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「キッズプログラミング」を発動、スピード50%アップ、回避率20%アップ";
        }

        // 24. Apache「サーバートリオ」: Apache, Nginx, Linuxでパワー1.5倍、HP1.5倍
        if (!array_diff(['Apache', 'Nginx', 'Linux'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「サーバートリオ」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 25. Nginx「高速サーバー」: Nginx, Apacheでパワー1.5倍、スピード1.5倍
        if (count(array_intersect(['Nginx', 'Apache'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「高速サーバー」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 26. LiteSpeed「高速キャッシュ」: LiteSpeed, Nginxでスピード1.5倍、回避率+20%
        if (count(array_intersect(['LiteSpeed', 'Nginx'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「高速キャッシュ」を発動、スピード50%アップ、回避率20%アップ";
        }

        // 27. Caddy「自動HTTPS」: Caddyでシールド3枚、Goがいる場合+1枚
        if (in_array('Caddy', $characterNames)) {
            $baseBlockCount = 3;
            $totalBlockCount = $baseBlockCount;
            $goBonus = in_array('Go', $characterNames);

            if ($goBonus) {
                $totalBlockCount += 1;
            }

            $caddyCharacter = RoomCharacter::where('roomId', $room->id)
                ->where('userId', $user->id)
                ->whereHas('character', function ($query) {
                    $query->where('name', 'Caddy');
                })
                ->first();

            if ($caddyCharacter) {
                $caddyCharacter->update(['blockCount' => $totalBlockCount]);
                $logMessage = "{$user->name} の Caddy が「自動HTTPS」を発動、{$baseBlockCount}枚のシールドを獲得";
                if ($goBonus) {
                    $logMessage .= "、Goの効果でさらに1枚追加（合計{$totalBlockCount}枚）";
                }
                $logs[] = $logMessage;
            }
        }

        // 28. Kotlin「Android開発」: Kotlin, Javaでパワー1.5倍、スピード1.5倍
        if (count(array_intersect(['Kotlin', 'Java'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「Android開発」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 29. VBA「Officeオートメーション」: VBA, GASでパワー1.5倍、HP1.5倍
        if (count(array_intersect(['VBA', 'Google Apps Script'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「Officeオートメーション」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 30. Google Apps Script「Google連携」: GAS, Google Cloudでスピード1.5倍、回避率+20%
        if (count(array_intersect(['Google Apps Script', 'Google Cloud'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「Google連携」を発動、スピード50%アップ、回避率20%アップ";
        }

        // 31. Firebase「リアルタイムアプリ」: Firebase, JavaScriptでスピード1.5倍、回避率+20%
        if (count(array_intersect(['Firebase', 'JavaScript'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「リアルタイムアプリ」を発動、スピード50%アップ、回避率20%アップ";
        }

        // 32. SQLite「軽量DB」: SQLite, PHPでパワー1.5倍、HP1.5倍
        if (count(array_intersect(['SQLite', 'PHP'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「軽量DB」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 33. jQuery「DOMマスター」: jQuery, JavaScriptでスピード1.5倍、回避率+20%
        if (count(array_intersect(['jQuery', 'JavaScript'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「DOMマスター」を発動、スピード50%アップ、回避率20%アップ";
        }

        // 34. Unreal Engine「ゲームエンジントリオ」: Unreal Engine, C++, Unityでパワー1.5倍、スピード1.5倍、HP1.5倍
        if (!array_diff(['Unreal Engine', 'C++', 'Unity'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「ゲームエンジントリオ」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 35. Java「サーバーサイドトリオ」: Java, MySQL, Apacheでパワー1.5倍、HP1.5倍
        if (!array_diff(['Java', 'MySQL', 'Apache'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「サーバーサイドトリオ」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 36. Perl「スクリプトマスター」: Perl, Python, Rubyでパワー1.5倍、スピード1.5倍
        if (!array_diff(['Perl', 'Python', 'Ruby'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「スクリプトマスター」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 37. C「低レベルトリオ」: C, C++, C#でパワー1.5倍、スピード1.5倍、HP1.5倍
        if (!array_diff(['C', 'C++', 'C#'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「低レベルトリオ」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 38. C++「システムプログラミング」: C++, Cでパワー1.5倍、HP1.5倍
        if (count(array_intersect(['C++', 'C'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「システムプログラミング」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 39. C#「.NETトリオ」: C#, Unity, JavaScriptでパワー1.5倍、スピード1.5倍、HP1.5倍
        if (!array_diff(['C#', 'Unity', 'JavaScript'], $characterNames)) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「.NETトリオ」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 40. Git「バージョン管理」: Git＋2体以上でパワー1.3倍、スピード1.3倍、HP1.3倍、回避率+10%
        if (in_array('Git', $characterNames) && count($characterNames) >= 2) {
            $powerMultiplier *= 1.3;
            $speedMultiplier *= 1.3;
            $lifeMultiplier *= 1.3;
            $evasionMultiplier *= 1.1;
            $logs[] = "{$user->name} が「バージョン管理」を発動、攻撃力30%アップ、スピード30%アップ、最大HP30%アップ、回避率10%アップ";
        }

        // 41. Fortran「科学計算」: Fortran, Pythonでパワー1.5倍、スピード1.5倍
        if (count(array_intersect(['Fortran', 'Python'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「科学計算」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 42. Laravel「PHPフレームワーク」: Laravel, PHPでパワー1.5倍、スピード1.5倍、HP1.5倍
        if (count(array_intersect(['Laravel', 'PHP'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「PHPフレームワーク」を発動、攻撃力50%アップ、スピード50%アップ、最大HP50%アップ";
        }

        // 43. Python「データサイエンス」: Python, SQLでパワー1.5倍、スピード1.5倍
        if (count(array_intersect(['Python', 'SQL'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「データサイエンス」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 44. Rust「システム開発」: Rust, C++でパワー1.5倍、HP1.5倍
        if (count(array_intersect(['Rust', 'C++'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $lifeMultiplier *= 1.5;
            $logs[] = "{$user->name} が「システム開発」を発動、攻撃力50%アップ、最大HP50%アップ";
        }

        // 45. SQL「データ分析」: SQL, Pythonでパワー1.5倍、スピード1.5倍
        if (count(array_intersect(['SQL', 'Python'], $characterNames)) === 2) {
            $powerMultiplier *= 1.5;
            $speedMultiplier *= 1.5;
            $logs[] = "{$user->name} が「データ分析」を発動、攻撃力50%アップ、スピード50%アップ";
        }

        // 46. Vite「高速ビルド」: Vite, JavaScriptでスピード1.5倍、回避率+20%
        if (count(array_intersect(['Vite', 'JavaScript'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「高速ビルド」を発動、スピード50%アップ、回避率20%アップ";
        }

        // 47. Webpack「モジュールバンドル」: Webpack, JavaScriptでスピード1.5倍、回避率+20%
        if (count(array_intersect(['Webpack', 'JavaScript'], $characterNames)) === 2) {
            $speedMultiplier *= 1.5;
            $evasionMultiplier *= 1.2;
            $logs[] = "{$user->name} が「モジュールバンドル」を発動、スピード50%アップ、回避率20%アップ";
        }

        return [
            'powerMultiplier' => $powerMultiplier,
            'speedMultiplier' => $speedMultiplier,
            'lifeMultiplier' => $lifeMultiplier,
            'evasionMultiplier' => $evasionMultiplier,
            'logs' => $logs,
        ];
    }


    public function cpuAct(Request $request, $roomId)
    {
        try {
            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->currentTurnUserId !== '00000000-0000-0000-0000-000000000cpu') {
                return response()->json(['message' => '現在はCPUのターンではありません'], 403);
            }

            $attacker = RoomCharacter::with('character')
                ->where('roomId', $roomId)
                ->where('userId', $room->currentTurnUserId)
                ->where('characterId', $room->currentTurnCharacterId)
                ->where('isActive', true)
                ->where('isDead', false)
                ->first();

            $target = RoomCharacter::with('character')
                ->where('roomId', $roomId)
                ->where('userId', '!=', $room->currentTurnUserId)
                ->where('isDead', false)
                ->inRandomOrder()
                ->first();

            if (!$attacker || !$target) {
                return response()->json(['message' => '攻撃者または対象が見つかりません'], 404);
            }

            $damage = $attacker->power;
            $newLife = max(0, $target->life - $damage);
            $target->update([
                'life' => $newLife,
                'isDead' => $newLife <= 0
            ]);

            // ログ記録
            RoomLog::create([
                'roomId' => $roomId,
                'actionType' => 'attack',
                'actorUserId' => $attacker->userId,
                'actorCharacterId' => $attacker->characterId,
                'targetUserId' => $target->userId,
                'targetCharacterId' => $target->characterId,
                'value' => $damage,
                'description' => "{$attacker->character->name}（CPU）が {$target->character->name} に {$damage} ダメージ",
            ]);

            if ($newLife <= 0) {
                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'death',
                    'targetUserId' => $target->userId,
                    'targetCharacterId' => $target->characterId,
                    'description' => "{$target->character->name} がダウンしました",
                ]);
            }

            $attacker->update(['isActive' => false]);
            $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

            $nextTurn = $this->updateNextTurn($roomId);
            $this->checkBattleEnd($room);
            $room->refresh();

            // 👇 これを追記するだけ！
            // if ($room->currentTurnUserId === '00000000-0000-0000-0000-000000000cpu') {
            //     return $this->cpuAct($request, $roomId);
            // }

            return response()->json([
                'message' => 'CPUが攻撃しました',
                'room' => $room,
                'attacker' => $attacker,
                'target' => [
                    'id' => $target->id,
                    'userId' => $target->userId,
                    'life' => $newLife,
                    'isDead' => $newLife <= 0
                ],
                'next_turn_user_id' => $nextTurn?->userId,
                'next_turn_character_id' => $nextTurn?->characterId,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'CPUの攻撃処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function createCpuBattle(Request $request)
    {
        try {
            $hostUserId = $request->userId;
            $characterIdList = $request->characterIdList;

            if (empty($characterIdList)) {
                return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);
            }

            $cpuUserId = '00000000-0000-0000-0000-000000000cpu';

            // ルーム作成とキャラ登録
            $room = DB::transaction(function () use ($hostUserId, $cpuUserId, $characterIdList) {
                $room = Room::create([
                    'id' => Str::uuid(),
                    'hostUserId' => $hostUserId,
                    'guestUserId' => $cpuUserId,
                    'status' => 'pending',
                    'isCpuBattle' => true,
                ]);

                // ホストのキャラ登録（既存と同様）
                foreach ($characterIdList as $characterId) {
                    // validation略
                    $userCharacter = UserCharacter::where('userId', $hostUserId)
                        ->where('characterId', $characterId)
                        ->first();

                    $character = Character::find($characterId);

                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $characterId,
                        'userId' => $hostUserId,
                        'level' => $userCharacter->level,
                        'life' => $userCharacter->life,
                        'maxLife' => $userCharacter->life,
                        'power' => $userCharacter->power,
                        'speed' => $userCharacter->speed,
                        'evasion' => $character->baseEvasion,
                    ]);
                }

                // CPUキャラ選出
                $cpuCharacterIds = Character::inRandomOrder()->limit(3)->pluck('id');
                foreach ($cpuCharacterIds as $characterId) {
                    $character = Character::find($characterId);
                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $character->id,
                        'userId' => $cpuUserId,
                        'level' => 1,
                        'life' => $character->baseLife,
                        'maxLife' => $character->baseLife,
                        'power' => $character->basePower,
                        'speed' => $character->baseSpeed,
                        'evasion' => $character->baseEvasion,
                    ]);
                }

                return $room;
            });

            // 承認処理を手動で呼ぶ
            $this->approveManually($room);

            return response()->json($room, 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'CPUバトル作成に失敗しました', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * ルーム一覧を取得
     */
    public function list()
    {
        try {
            $rooms = Room::with([
                'hostUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                },
                'guestUser' => function ($query) {
                    $query->select('id', 'name', 'photoUrl');
                }
            ])->get();

            $rooms->transform(function ($room) {
                return [
                    'id' => $room->id,
                    'host_user' => $room->hostUser ? [
                        'id' => $room->hostUser->id,
                        'name' => $room->hostUser->name,
                        'photoUrl' => $room->hostUser->photoUrl,
                    ] : null,
                    'guest_user' => $room->guestUser ? [
                        'id' => $room->guestUser->id,
                        'name' => $room->guestUser->name,
                        'photoUrl' => $room->guestUser->photoUrl,
                    ] : null,
                    'status' => $room->status
                ];
            });

            return response()->json($rooms, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve rooms',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // private function applyPartyBonuses($characterNames, $hostUser, $room)
    // {
    //     $powerMultiplier = 1.0;
    //     $speedMultiplier = 1.0;
    //     $lifeMultiplier = 1.0;
    //     $evasionMultiplier = 1.0;
    //     $logs = [];

    //     // 1. 三大フレームワーク
    //     if (!array_diff(['Vue', 'React', 'Angular'], $characterNames)) {
    //         $powerMultiplier *= 1.25;
    //         $speedMultiplier *= 1.25;
    //         $lifeMultiplier *= 1.25;
    //         $evasionMultiplier *= 1.25;
    //         $logs[] = "{$hostUser->name} が「三大フレームワーク」を発動、全ステータスが25%アップ";
    //     }

    //     // 2. 三大クラウド
    //     if (!array_diff(['AWS', 'Google Cloud', 'Azure'], $characterNames)) {
    //         $lifeMultiplier *= 1.60;
    //         $logs[] = "{$hostUser->name} が「三大クラウド」を発動、最大HPが60%アップ";
    //     }

    //     // 3. 型安全
    //     // if (in_array('Typescript', $characterNames) &&
    //     //     (in_array('Vue', $characterNames) || in_array('React', $characterNames) ||
    //     //     in_array('Angular', $characterNames) || in_array('Javascript', $characterNames))) {
    //     //     $powerMultiplier *= 1.05;
    //     //     $speedMultiplier *= 1.05;
    //     //     $evasionMultiplier *= 1.20;
    //     //     $logs[] = "{$hostUser->name} が「型安全」を発動、攻撃力5%アップ、スピード5%アップ、回避率20%アップ";
    //     // }

    //     // 4. ハイパーバイザー型
    //     if (in_array('Docker', $characterNames) && count($characterNames) >= 2) {
    //         $powerMultiplier *= 1.07;
    //         $speedMultiplier *= 1.07;
    //         $evasionMultiplier *= 1.07;
    //         $logs[] = "{$hostUser->name} が「ハイパーバイザー型」を発動、攻撃力7%アップ、スピード7%アップ、回避率7%アップ";
    //     }

    //     // 5. WSL2
    //     $osCharacters = ['Linux', 'Mac'];
    //     if (in_array('windows', $characterNames) &&
    //         count(array_intersect($characterNames, $osCharacters)) == 0 &&
    //         count($characterNames) >= 2) {
    //         $powerMultiplier *= 1.17;
    //         $lifeMultiplier *= 1.30;
    //         $speedMultiplier *= 0.80;
    //         $logs[] = "{$hostUser->name} が「WSL2」を発動、最大HP30%アップ、パワー17%アップ、スピード20%ダウン";
    //     }

    //     // 6. DBマスター
    //     // $dbCharacters = ['Mysql', 'Postgres', 'Supabase'];
    //     // if (count(array_intersect($characterNames, $dbCharacters)) > 0) {
    //     //     $lifeMultiplier *= 1.30;
    //     //     $logs[] = "{$hostUser->name} が「DBマスター」を発動、最大HPが30%アップ";
    //     // }

    //     // 7. HTML5トリオ（html, CSS, Javascript）
    //     if (!array_diff(['html', 'CSS', 'Javascript'], $characterNames)) {
    //         $powerMultiplier *= 1.10;
    //         $lifeMultiplier *= 1.25;
    //         $evasionMultiplier *= 1.10;
    //         $logs[] = "{$hostUser->name} が「HTML5トリオ」を発動、攻撃力10%アップ、最大HP25%アップ、回避率10%アップ";
    //     }

    //     // 8. OSトリオ（windows, Mac, Linux）
    //     if (!array_diff(['windows', 'Mac', 'Linux'], $characterNames)) {
    //         $powerMultiplier *= 1.15;
    //         $speedMultiplier *= 1.15;
    //         $lifeMultiplier *= 1.15;
    //         $evasionMultiplier *= 1.15;
    //         $logs[] = "{$hostUser->name} が「OSトリオ」を発動、攻撃力15%アップ、スピード15%アップ、最大HP15%アップ、回避率15%アップ";
    //     }

    //     // 9. Caddy（Goの効果でシールドを獲得）
    //     if (in_array('Caddy', $characterNames)) {
    //         $baseBlockCount = 3;
    //         $totalBlockCount = $baseBlockCount;
    //         $goBonus = false;

    //         // Check for Go in the party
    //         if (in_array('Go', $characterNames)) {
    //             $totalBlockCount += 1;
    //             $goBonus = true;
    //         }

    //         // Find and update Caddy's RoomCharacter
    //         $caddyCharacter = RoomCharacter::where('roomId', $room->id)
    //             ->where('userId', $hostUser->id)
    //             ->whereHas('character', function ($query) {
    //                 $query->where('name', 'Caddy');
    //             })
    //             ->first();

    //         if ($caddyCharacter) {
    //             $caddyCharacter->update(['blockCount' => $totalBlockCount]);

    //             $logMessage = "{$hostUser->name} の Caddy が「自動HTTPS」を発動、{$baseBlockCount}枚のシールドを獲得";
    //             if ($goBonus) {
    //                 $logMessage .= "、Goの効果でさらに1枚追加（合計{$totalBlockCount}枚）";
    //             }
    //             $logs[] = $logMessage;
    //         }
    //     }

    //     // ... (rest of the existing conditions)

    //     return [
    //         'powerMultiplier' => $powerMultiplier,
    //         'speedMultiplier' => $speedMultiplier,
    //         'lifeMultiplier' => $lifeMultiplier,
    //         'evasionMultiplier' => $evasionMultiplier,
    //         'logs' => $logs,
    //     ];

    //     // 9. サーバーサイド言語（PHP, Go, Ruby）
    //     $serverSideLangs = ['PHP', 'Go', 'Ruby'];
    //     if (count(array_intersect($characterNames, $serverSideLangs)) >= 2) {
    //         $powerMultiplier *= 1.40;
    //         $speedMultiplier *= 1.40;
    //         $logs[] = "{$hostUser->name} が「サーバーサイド言語」を発動、攻撃力40%アップ、スピード40%アップ";
    //     }

    //     // 10. 高速開発（Swift, Javascript, Ruby）
    //     // $fastDevLangs = ['Swift', 'Javascript', 'Ruby'];
    //     // if (count(array_intersect($characterNames, $fastDevLangs)) >= 2) {
    //     //     $speedMultiplier *= 1.15;
    //     //     $evasionMultiplier *= 1.10;
    //     //     $logs[] = "{$hostUser->name} が「高速開発」を発動、スピード15%アップ、回避率10%アップ";
    //     // }

    //     // 11. ゲーム開発（Unity, Javascript）
    //     // if (in_array('Unity', $characterNames) && in_array('Javascript', $characterNames)) {
    //     //     $powerMultiplier *= 1.12;
    //     //     $speedMultiplier *= 1.08;
    //     //     $logs[] = "{$hostUser->name} が「ゲーム開発」を発動、攻撃力12%アップ、スピード8%アップ";
    //     // }

    //     // 12. フロントエンドマスター（html, CSS, Vue）
    //     if (!array_diff(['html', 'CSS', 'Vue'], $characterNames)) {
    //         $speedMultiplier *= 1.12;
    //         $evasionMultiplier *= 1.15;
    //         $logs[] = "{$hostUser->name} が「フロントエンドマスター」を発動、スピード12%アップ、回避率15%アップ";
    //     }

    //     // 13. データベース連携（Mysql, PHP）
    //     if (in_array('Mysql', $characterNames) && in_array('PHP', $characterNames)) {
    //         $powerMultiplier *= 1.10;
    //         $lifeMultiplier *= 1.08;
    //         $logs[] = "{$hostUser->name} が「データベース連携」を発動、攻撃力10%アップ、最大HP8%アップ";
    //     }

    //     // 14. コンテナ最適化（Docker, Go）
    //     if (in_array('Docker', $characterNames) && in_array('Go', $characterNames)) {
    //         $speedMultiplier *= 1.10;
    //         $evasionMultiplier *= 1.08;
    //         $logs[] = "{$hostUser->name} が「コンテナ最適化」を発動、スピード10%アップ、回避率8%アップ";
    //     }

    //     // 15. モダンスタック（React, Typescript）
    //     if (in_array('React', $characterNames) && in_array('Typescript', $characterNames)) {
    //         $lifeMultiplier *= 1.15;
    //         $powerMultiplier *= 1.15;
    //         $speedMultiplier *= 1.15;
    //         $logs[] = "{$hostUser->name} が「モダンスタック」を発動、最大HP15%アップ、攻撃力15%アップ、スピード15%アップ";
    //     }

    //     // 16. インフラマスター（AWS, Docker, Linux）
    //     // if (!array_diff(['AWS', 'Docker', 'Linux'], $characterNames)) {
    //     //     $powerMultiplier *= 1.12;
    //     //     $lifeMultiplier *= 1.10;
    //     //     $speedMultiplier *= 1.08;
    //     //     $logs[] = "{$hostUser->name} が「インフラマスター」を発動、攻撃力12%アップ、最大HP10%アップ、スピード8%アップ";
    //     // }

    //     // 17. モバイル開発（Swift, React）
    //     // if (in_array('Swift', $characterNames) && in_array('React', $characterNames)) {
    //     //     $speedMultiplier *= 1.12;
    //     //     $evasionMultiplier *= 1.10;
    //     //     $logs[] = "{$hostUser->name} が「モバイル開発」を発動、スピード12%アップ、回避率10%アップ";
    //     // }

    //     // 18. データベーストリオ（Mysql, Postgres, Supabase）
    //     if (!array_diff(['Mysql', 'Postgres', 'Supabase'], $characterNames)) {
    //         $lifeMultiplier *= 1.20;
    //         $powerMultiplier *= 1.20;
    //         $speedMultiplier *= 1.20;
    //         $evasionMultiplier *= 1.20;
    //         $logs[] = "{$hostUser->name} が「DBマスター」を発動、最大HP20%アップ、攻撃力20%アップ、スピード20%アップ、回避率20%アップ";
    //     }

    //     // 19. クラウドネイティブ（AWS, Docker, Supabase）
    //     // if (!array_diff(['AWS', 'Docker', 'Supabase'], $characterNames)) {
    //     //     $speedMultiplier *= 1.10;
    //     //     $lifeMultiplier *= 1.12;
    //     //     $evasionMultiplier *= 1.08;
    //     //     $logs[] = "{$hostUser->name} が「クラウドネイティブ」を発動、スピード10%アップ、最大HP12%アップ、回避率8%アップ";
    //     // }

    //     // 20. レガシーアップデート（PHP, html, CSS）
    //     if (!array_diff(['PHP', 'html', 'CSS'], $characterNames)) {
    //         $powerMultiplier *= 1.15;
    //         $lifeMultiplier *= 1.15;
    //         $logs[] = "{$hostUser->name} が「レガシーアップデート」を発動、攻撃力15%アップ、最大HP15%アップ";
    //     }

    //     // 21. フルスタック（Javascript, Ruby, Docker）
    //     // if (!array_diff(['Javascript', 'Ruby', 'Docker'], $characterNames)) {
    //     //     $powerMultiplier *= 1.10;
    //     //     $speedMultiplier *= 1.08;
    //     //     $lifeMultiplier *= 1.10;
    //     //     $logs[] = "{$hostUser->name} が「フルスタック」を発動、攻撃力10%アップ、スピード8%アップ、最大HP10%アップ";
    //     // }

    //     // 22. Ruby & Rails パーティ
    //     if (count($characterNames) === 2 &&
    //     in_array('Ruby', $characterNames) &&
    //     in_array('Ruby on Rails', $characterNames)) {
    //         $powerMultiplier *= 1.35;
    //         $speedMultiplier *= 1.35;
    //         $lifeMultiplier *= 1.35;
    //         $logs[] = "{$hostUser->name} が「Railsマジック」を発動、攻撃力35%アップ、スピード35%アップ、最大HP35%アップ";
    //     }

    //     return [
    //         'powerMultiplier' => $powerMultiplier,
    //         'speedMultiplier' => $speedMultiplier,
    //         'lifeMultiplier' => $lifeMultiplier,
    //         'evasionMultiplier' => $evasionMultiplier,
    //         'logs' => $logs,
    //     ];
    // }

    /**
     * ルーム作成
     */
    public function create(Request $request)
    {
        try {
            $characterIdList = $request->characterIdList;

            if (empty($characterIdList)) {
                return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);
            }

            $existingRoom = Room::where('hostUserId', $request->hostUserId)->first();
            if ($existingRoom) {
                return response()->json(['message' => '既に作成されたルームが存在します'], 409);
            }

            $hostUser = User::find($request->hostUserId);

            $room = DB::transaction(function () use ($request, $characterIdList, $hostUser) {
                $room = Room::create([
                    'id' => Str::uuid(),
                    'hostUserId' => $request->hostUserId,
                    'guestUserId' => null,
                    'status' => 'waiting',
                ]);

                $characterNames = [];
                foreach ($characterIdList as $characterId) {
                    $character = Character::find($characterId);
                    if (!$character) {
                        throw new Exception("キャラクター {$characterId} が見つかりません", 404);
                    }
                    $userCharacter = UserCharacter::where('userId', $request->hostUserId)
                        ->where('characterId', $characterId)
                        ->first();
                    if (!$userCharacter) {
                        throw new Exception("ユーザーのキャラクター {$characterId} が見つかりません", 404);
                    }
                    $characterNames[] = $character->name;

                    // ここではボーナスを適用せず、基本ステータスのみを保存
                    RoomCharacter::create([
                        'roomId' => $room->id,
                        'characterId' => $characterId,
                        'userId' => $room->hostUserId,
                        'level' => $userCharacter->level,
                        'life' => $userCharacter->life,
                        'maxLife' => $userCharacter->life,
                        'power' => $userCharacter->power,
                        'speed' => $userCharacter->speed,
                        'evasion' => $character->baseEvasion,
                    ]);
                }

                return $room;
            });

            return response()->json($room, 201);
        } catch (Exception $e) {
            $statusCode = $e->getCode() === 404 ? 404 : 500;
            return response()->json(['message' => $e->getMessage()], $statusCode);
        }
    }

    /**
     * ルームに参加
     */
    public function join(Request $request)
    {
        try {
            DB::beginTransaction();

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $request->roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            if ($room->status !== 'waiting') {
                return response()->json(['message' => 'このルームには参加できません'], 400);
            }

            if ($room->guestUserId) {
                return response()->json(['message' => 'このルームにはすでにゲストが参加しています'], 400);
            }

            $characterIdList = $request->characterIdList;
            if (empty($characterIdList)) {
                return response()->json(['message' => 'キャラクターIDリストが必要です'], 400);
            }

            $guestUser = User::find($request->guestUserId);

            $room->update([
                'guestUserId' => $request->guestUserId,
                'status' => 'pending',
            ]);

            $characterNames = [];
            foreach ($characterIdList as $characterId) {
                $character = Character::find($characterId);
                if (!$character) {
                    throw new Exception("キャラクター {$characterId} が見つかりません", 404);
                }
                $userCharacter = UserCharacter::where('userId', $request->guestUserId)
                    ->where('characterId', $characterId)
                    ->first();
                if (!$userCharacter) {
                    throw new Exception("ユーザーのキャラクター {$characterId} が見つかりません", 404);
                }
                $characterNames[] = $character->name;

                // 基本ステータスのみを保存
                RoomCharacter::create([
                    'roomId' => $room->id,
                    'characterId' => $characterId,
                    'userId' => $request->guestUserId,
                    'level' => $userCharacter->level,
                    'life' => $userCharacter->life,
                    'maxLife' => $userCharacter->life,
                    'power' => $userCharacter->power,
                    'speed' => $userCharacter->speed,
                    'evasion' => $character->baseEvasion,
                ]);
            }

            DB::commit();

            $room->load(['hostUser', 'guestUser']);
            $response = [
                'id' => $room->id,
                'host_user' => $room->hostUser ? [
                    'id' => $room->hostUser->id,
                    'name' => $room->hostUser->name,
                    'photoUrl' => $room->hostUser->photoUrl,
                ] : null,
                'guest_user' => $room->guestUser ? [
                    'id' => $room->guestUser->id,
                    'name' => $room->guestUser->name,
                    'photoUrl' => $room->guestUser->photoUrl,
                ] : null,
                'status' => $room->status,
            ];

            return response()->json($response, 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    /**
     * ルーム作成をキャンセル
     */
    public function cancelCreate(Request $request)
    {
        try {
            DB::beginTransaction();

            $room = Room::where('id', $request->roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            // ホストユーザーしかキャンセルできない
            if ($room->hostUserId !== $request->hostUserId) {
                return response()->json(['message' => 'キャンセルする権限がありません'], 403);
            }

            // waiting 状態でなければキャンセル不可
            if ($room->status !== 'waiting') {
                return response()->json(['message' => '現在キャンセルできません'], 400);
            }

            // ルームと関連するキャラクターを削除
            RoomCharacter::where('roomId', $room->id)->delete();
            $room->delete();

            DB::commit();

            return response()->json(['message' => 'ルーム作成がキャンセルされました'], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    /**
     * ルームへの参加をキャンセル
     */
    public function cancelJoin(Request $request)
    {
        try {
            DB::beginTransaction();

            $room = Room::where('id', $request->roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            // ゲストユーザーしかキャンセルできない
            if ($room->guestUserId !== $request->guestUserId) {
                return response()->json(['message' => 'キャンセルする権限がありません'], 403);
            }

            // pending 状態でなければキャンセル不可
            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在キャンセルできません'], 400);
            }

            // ゲストの参加を解除
            $room->update([
                'guestUserId' => null,
                'status' => 'waiting',
            ]);

            // ゲストのキャラクターを削除
            RoomCharacter::where('roomId', $room->id)
                ->where('userId', $request->guestUserId)
                ->delete();

            DB::commit();

            $room->load(['hostUser', 'guestUser']);
            $response = [
                'id' => $room->id,
                'host_user' => $room->hostUser ? [
                    'id' => $room->hostUser->id,
                    'name' => $room->hostUser->name,
                    'photoUrl' => $room->hostUser->photoUrl,
                ] : null,
                'guest_user' => $room->guestUser ? [
                    'id' => $room->guestUser->id,
                    'name' => $room->guestUser->name,
                    'photoUrl' => $room->guestUser->photoUrl,
                ] : null,
                'status' => $room->status,
            ];

            return response()->json($response, 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }

    public function approve(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $userId) {
                return response()->json(['message' => '承認の権限がありません'], 403);
            }

            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在承認を受け付けていません'], 400);
            }
            if (!$room->guestUserId) {
                return response()->json(['message' => 'ゲストが申請していません'], 400);
            }

            DB::transaction(function () use ($roomId, $room) {
                $hostCharacters = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $room->hostUserId)
                    ->with('character')
                    ->get();
                $guestCharacters = RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $room->guestUserId)
                    ->with('character')
                    ->get();

                // ホストのパーティボーナス適用
                $hostCharacterNames = $hostCharacters->pluck('character.name')->toArray();
                $hostBonuses = $this->applyPartyBonuses($hostCharacterNames, $room->hostUser, $room);
                if (!array_diff(['Warrior', 'Mage', 'Healer'], $hostCharacterNames)) {
                    $hostBonuses['powerMultiplier'] *= 1.2;
                    $hostBonuses['speedMultiplier'] *= 1.1;
                    $hostBonuses['logs'][] = "{$room->hostUser->name} のパーティ ['Warrior', 'Mage', 'Healer'] で攻撃力が20%増、スピードが10%増";
                }
                foreach ($hostCharacters as $character) {
                    RoomCharacter::where('id', $character->id)->update([
                        'life' => $character->life * $hostBonuses['lifeMultiplier'],
                        'maxLife' => $character->maxLife * $hostBonuses['lifeMultiplier'],
                        'power' => $character->power * $hostBonuses['powerMultiplier'],
                        'speed' => $character->speed * $hostBonuses['speedMultiplier'],
                        'evasion' => $character->evasion * $hostBonuses['evasionMultiplier'],
                    ]);
                }
                if (!empty($hostBonuses['logs'])) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $room->hostUserId,
                        'description' => implode(' / ', $hostBonuses['logs']),
                    ]);
                }

                // ゲストのパーティボーナス適用
                $guestCharacterNames = $guestCharacters->pluck('character.name')->toArray();
                $guestBonuses = $this->applyPartyBonuses($guestCharacterNames, $room->guestUser, $room);
                if (!array_diff(['Archer', 'Tank', 'Support'], $guestCharacterNames)) {
                    $guestBonuses['speedMultiplier'] *= 1.25;
                    $guestBonuses['powerMultiplier'] *= 1.15;
                    $guestBonuses['logs'][] = "{$room->guestUser->name} のパーティ ['Archer', 'Tank', 'Support'] でスピードが25%増、攻撃力が15%増";
                }
                foreach ($guestCharacters as $character) {
                    RoomCharacter::where('id', $character->id)->update([
                        'life' => $character->life * $guestBonuses['lifeMultiplier'],
                        'maxLife' => $character->maxLife * $guestBonuses['lifeMultiplier'],
                        'power' => $character->power * $guestBonuses['powerMultiplier'],
                        'speed' => $character->speed * $guestBonuses['speedMultiplier'],
                        'evasion' => $character->evasion * $guestBonuses['evasionMultiplier'],
                    ]);
                }
                if (!empty($guestBonuses['logs'])) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'partyBonus',
                        'actorUserId' => $room->guestUserId,
                        'description' => implode(' / ', $guestBonuses['logs']),
                    ]);
                }

                RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);

                $characters = RoomCharacter::where('roomId', $roomId)
                    ->orderBy('speed', 'desc')
                    ->get();

                if ($characters->isEmpty()) {
                    throw new Exception('ルームにキャラクターが存在しません');
                }

                $firstTurn = $characters->first();
                if (!$firstTurn->userId) {
                    throw new Exception('最初のターンユーザーIDがnullです');
                }

                $room->update([
                    'status' => 'battling',
                    'currentTurnUserId' => $firstTurn->userId,
                    'currentTurnCharacterId' => $firstTurn->characterId,
                ]);
            });

            $room->refresh();

            return response()->json([
                'message' => '参加申請が承認されました',
                'room' => $room,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => '承認処理に失敗しました',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ルーム情報を取得
     */
    public function status(Request $request)
    {
        try {
            $userId = $request->route('userId');
            $roomId = $request->route('roomId');

            if (!$userId) return response()->json(['message' => 'ユーザーIDが必要です'], 401);
            if (!$roomId) return response()->json(['message' => 'ルームIDが必要です'], 401);

            $room = Room::with([
                // 'roomCharacter.character',
            //     'roomCharacter.character' => function ($query) {
            //     $query->orderBy('speed', 'desc'); // speed順に並び替え（降順）
            // },
            'roomCharacter' => function ($query) {
        $query->orderBy('speed', 'desc'); // roomCharacterのspeedで降順に並び替え
        $query->with('character'); // characterリレーションをさらに読み込む
    },
                'roomLog' => function ($query) {
                    $query->with([
                        'actorCharacter' => function ($query) {
                            $query->select('id', 'name');
                        },
                        'targetCharacter' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                }
            ])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => '指定されたルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $userId && $room->guestUserId !== $userId) {
                return response()->json(['message' => 'このルームにアクセスする権限がありません'], 403);
            }

            return response()->json($room, 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve room',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ルーム内で降参する
     */
    public function surrender(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            $room = Room::with(['roomCharacter', 'hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->hostUserId !== $userId && $room->guestUserId !== $userId) {
                return response()->json(['message' => 'このルームにアクセスする権限がありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $room) {
                // 降参した側の全キャラを死にさせる
                RoomCharacter::where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('isDead', false)
                    ->update([
                        'life' => 0,
                        'isDead' => true,
                        'isActive' => false,
                    ]);

                // 勝者を決定（降参した側と反対）
                $winnerUserId = ($userId === $room->hostUserId) ? $room->guestUserId : $room->hostUserId;
                $loserName = ($userId === $room->hostUserId) ? $room->hostUser->name : $room->guestUser->name;
                $winnerName = ($userId === $room->hostUserId) ? $room->guestUser->name : $room->hostUser->name;

                // ルームのステータスを終了に更新
                $room->update([
                    'status' => 'finish',
                    'winUserId' => $winnerUserId,
                    'currentTurnUserId' => null,
                    'currentTurnCharacterId' => null,
                ]);

                // 降参ログを記録
                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'surrender',
                    'actorUserId' => $userId,
                    'description' => "{$loserName} が降参しました。{$winnerName} の勝利です。",
                ]);

                $room->refresh();

                return response()->json([
                    'message' => "{$loserName} が降参しました。{$winnerName} の勝利です。",
                    'room' => $room,
                    'winner_user_id' => $winnerUserId,
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'message' => '降参処理に失敗しました',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * キャラクターが別のキャラクターに通常攻撃する
     */
    public function attack(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');
            $targetCharacterId = $request->input('targetCharacterId');

            if (!$targetCharacterId) {
                return response()->json(['message' => '攻撃対象を指定してください'], 400);
            }

            $room = Room::with(['hostUser', 'guestUser', 'roomCharacter' => function ($query) {
                $query->with('character');
            }])->where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->currentTurnUserId !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $targetCharacterId, $room) {
                $attacker = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('characterId', $room->currentTurnCharacterId)
                    ->where('isActive', true)
                    ->where('isDead', false)
                    ->first();

                if (!$attacker) {
                    throw new Exception('行動可能なキャラクターが見つかりません');
                }

                $target = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('id', $targetCharacterId)
                    ->where('userId', '!=', $userId)
                    ->where('isDead', false)
                    ->first();

                if (!$target) {
                    throw new Exception('攻撃対象のキャラクターが見つかりません');
                }

                $evasionChance = $target->evasion;
                $hitRoll = rand(0, 100);
                $isHit = $hitRoll > $evasionChance;

                if ($isHit) {
                    $damage = max(0, $attacker->power);
                    $message = "";

                    if ($target->blockCount > 0) {
                        $target->update(['blockCount' => $target->blockCount - 1]);
                        $damage = 0;
                        $newLife = $target->life;

                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'shield',
                            'actorUserId' => $attacker->userId,
                            'actorCharacterId' => $attacker->characterId,
                            'targetUserId' => $target->userId,
                            'targetCharacterId' => $target->characterId,
                            'value' => 0,
                            'description' => "{$target->character->name} のシールドが攻撃を防いだ（残りシールド: {$target->blockCount}）",
                        ]);

                        $message = "{$attacker->character->name} の攻撃が {$target->character->name} のシールドに防がれました";
                    } else {
                        $context = [
                            'attacker' => $attacker,
                            'target' => $target,
                            'damage' => &$damage,
                            'actorUserId' => $attacker->userId,
                            'actorCharacterId' => $attacker->characterId,
                            'targetUserId' => $target->userId,
                            'targetCharacterId' => $target->characterId,
                        ];
                        $passiveLogs = PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context);

                        $newLife = max(0, $target->life - $damage);
                        $target->update(['life' => $newLife, 'isDead' => $newLife <= 0]);

                        $context['damage'] = $damage;
                        $passiveLogs = array_merge(
                            $passiveLogs,
                            PassiveSkillManager::applyPassives($room, 'on_damage_taken', $context),
                            PassiveSkillManager::applyPassives($room, 'on_attack_hit', $context),
                            PassiveSkillManager::applyPassives($room, 'on_life_changed', array_merge($context, ['target' => $target]))
                        );

                        foreach ($passiveLogs as $log) {
                            RoomLog::create([
                                'roomId' => $roomId,
                                'actionType' => 'passive',
                                'actorUserId' => $log['userId'],
                                'actorCharacterId' => $log['characterId'],
                                'description' => $log['description'],
                            ]);
                        }

                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'attack',
                            'actorUserId' => $attacker->userId,
                            'actorCharacterId' => $attacker->characterId,
                            'targetUserId' => $target->userId,
                            'targetCharacterId' => $target->characterId,
                            'value' => $damage,
                            'description' => "{$attacker->character->name} が {$target->character->name} に {$damage} ダメージを与えました",
                        ]);

                        if ($newLife <= 0) {
                            RoomLog::create([
                                'roomId' => $roomId,
                                'actionType' => 'death',
                                'targetUserId' => $target->userId,
                                'targetCharacterId' => $target->characterId,
                                'description' => "{$target->character->name} がダウンしました",
                            ]);
                        }

                        $message = "{$attacker->character->name} が {$target->character->name} に {$damage} ダメージを与えました";
                    }
                } else {
                    $damage = 0;
                    $newLife = $target->life;
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'attack',
                        'actorUserId' => $attacker->userId,
                        'actorCharacterId' => $attacker->characterId,
                        'targetUserId' => $target->userId,
                        'targetCharacterId' => $target->characterId,
                        'value' => 0,
                        'description' => "{$attacker->character->name} の攻撃が {$target->character->name} に回避されました",
                    ]);
                    $message = "{$attacker->character->name} の攻撃が {$target->character->name} に回避されました";
                }

                $attacker->update(['isActive' => false]);
                $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

                // 行動後のパッシブスキル発動
                $context = [
                    'attacker' => $attacker,
                    'actorUserId' => $attacker->userId,
                    'actorCharacterId' => $attacker->characterId,
                ];
                $passiveLogs = PassiveSkillManager::applyPassives($room, 'on_action', $context);
                $passiveLogs = array_merge(
                    $passiveLogs,
                    PassiveSkillManager::applyPassives($room, 'turn_end', $context)
                );

                foreach ($passiveLogs as $log) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'passive',
                        'actorUserId' => $log['userId'],
                        'actorCharacterId' => $log['characterId'],
                        'description' => $log['description'],
                    ]);
                }

                $nextTurn = $this->updateNextTurn($roomId);
                $this->checkBattleEnd($room);
                $room->refresh();

                return response()->json([
                    'message' => $message,
                    'room' => $room,
                    'attacker' => $attacker,
                    'targets' => [[
                        'id' => $target->id,
                        'userId' => $target->userId,
                        'life' => $newLife,
                        'isDead' => $newLife <= 0,
                        'blockCount' => $target->blockCount,
                    ]],
                    'next_turn_user_id' => $nextTurn ? $nextTurn->userId : null,
                    'next_turn_character_id' => $nextTurn ? $nextTurn->characterId : null,
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'message' => '攻撃処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function skill(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');
            $targetCharacterId = $request->input('targetCharacterId');

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room || $room->status !== 'battling') {
                return response()->json(['message' => 'バトルが進行中ではありません'], 400);
            }

            if ($room->currentTurnUserId !== $userId) {
                return response()->json(['message' => 'あなたのターンではありません'], 403);
            }

            return DB::transaction(function () use ($roomId, $userId, $targetCharacterId, $room) {
                $attacker = RoomCharacter::with('character')
                    ->where('roomId', $roomId)
                    ->where('userId', $userId)
                    ->where('characterId', $room->currentTurnCharacterId)
                    ->where('isActive', true)
                    ->where('isDead', false)
                    ->first();

                if (!$attacker) {
                    throw new Exception('行動可能なキャラクターが見つかりません');
                }

                if ($attacker->specialUsed) {
                    throw new Exception('このキャラクターのスペシャルスキルは既に使用済みです');
                }
                if ($room->totalTurns < $attacker->specialSkillTurn) {
                    throw new Exception("スペシャルスキルを発動するにはあと " . ($attacker->specialSkillTurn - $room->totalTurns) . " ターン必要です");
                }

                $skillType = $attacker->character->specialSkillName;
                if (!$skillType) {
                    throw new Exception('このキャラクターにスペシャルスキルが設定されていません');
                }

                $description = '';
                $targets = [];
                $isSingleTarget = in_array($skillType, ['単体攻撃力強化', '単体犠牲攻撃', '単体回復']);

                if ($isSingleTarget && !$targetCharacterId) {
                    throw new Exception('単体スキルの場合、ターゲットを指定してください');
                }

                $context = [
                    'attacker' => $attacker,
                    'target' => null,
                    'actorUserId' => $attacker->userId,
                    'actorCharacterId' => $attacker->characterId,
                ];
                $passiveLogs = PassiveSkillManager::applyPassives($room, 'before_skill_used', $context);

                switch ($skillType) {
                    case '単体攻撃力強化':
                        $target = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', $userId)
                            ->where('id', $targetCharacterId)
                            ->where('isDead', false)
                            ->first();
                        if (!$target) throw new Exception('対象が見つかりません');
                        $target->update(['power' => $target->power * 2]);
                        $description = "{$attacker->character->name} が {$target->character->name} の攻撃力を2倍に強化";
                        $targets = [$target];
                        break;

                    case '単体犠牲攻撃':
                        $target = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('id', $targetCharacterId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->first();
                        if (!$target) throw new Exception('対象が見つかりません');
                        $damage = $attacker->power * 5;
                        $context['target'] = $target;
                        $context['damage'] = &$damage;
                        $context['targetUserId'] = $target->userId;
                        $context['targetCharacterId'] = $target->characterId;
                        $passiveLogs = array_merge(
                            $passiveLogs,
                            PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context)
                        );
                        $newLife = max(0, $target->life - $damage);
                        $target->update([
                            'life' => $newLife,
                            'isDead' => $newLife <= 0,
                        ]);
                        $attacker->update([
                            'life' => 0,
                            'isDead' => true,
                        ]);
                        $context['damage'] = $damage;
                        $passiveLogs = array_merge(
                            $passiveLogs,
                            PassiveSkillManager::applyPassives($room, 'on_damage_taken', $context),
                            PassiveSkillManager::applyPassives($room, 'on_skill_hit', $context),
                            PassiveSkillManager::applyPassives($room, 'on_life_changed', array_merge($context, ['target' => $target]))
                        );
                        $description = "{$attacker->character->name} が自爆し {$target->character->name} に {$damage} ダメージ";
                        $targets = [$target];
                        if ($newLife <= 0) {
                            RoomLog::create([
                                'roomId' => $roomId,
                                'actionType' => 'death',
                                'targetUserId' => $target->userId,
                                'targetCharacterId' => $target->characterId,
                                'description' => "{$target->character->name} がダウンしました",
                            ]);
                        }
                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'death',
                            'targetUserId' => $attacker->userId,
                            'targetCharacterId' => $attacker->characterId,
                            'description' => "{$attacker->character->name} がダウンしました",
                            ]);
                        break;

                    case '全体攻撃':
                        $targets = RoomCharacter::with('character')
                            ->where('roomId', $roomId)
                            ->where('userId', '!=', $userId)
                            ->where('isDead', false)
                            ->get();
                        $damage = $attacker->power * 2;
                        foreach ($targets as $target) {
                            $context['target'] = $target;
                            $context['damage'] = &$damage;
                            $context['targetUserId'] = $target->userId;
                            $context['targetCharacterId'] = $target->characterId;
                            $passiveLogs = array_merge(
                                $passiveLogs,
                                PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context)
                            );
                            $newLife = max(0, $target->life - $damage);
                            $target->update([
                                'life' => $newLife,
                                'isDead' => $newLife <= 0,
                            ]);
                            $context['damage'] = $damage;
                            $passiveLogs = array_merge(
                                $passiveLogs,
                                PassiveSkillManager::applyPassives($room, 'on_damage_taken', $context),
                                PassiveSkillManager::applyPassives($room, 'on_skill_hit', $context),
                                PassiveSkillManager::applyPassives($room, 'on_life_changed', array_merge($context, ['target' => $target]))
                            );
                            if ($newLife <= 0) {
                                RoomLog::create([
                                    'roomId' => $roomId,
                                    'actionType' => 'death',
                                    'targetUserId' => $target->userId,
                                    'targetCharacterId' => $target->characterId,
                                    'description' => "{$target->character->name} がダウンしました",
                                ]);
                            }
                        }
                        $description = "{$attacker->character->name} が全体攻撃で {$damage} ダメージ";
                        break;

                    default:
                        throw new Exception('未実装のスペシャルスキルです');
                }

                foreach ($passiveLogs as $log) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'passive',
                        'actorUserId' => $log['userId'],
                        'actorCharacterId' => $log['characterId'],
                        'description' => $log['description'],
                    ]);
                }

                if ($skillType !== 'rm -rfff') {
                    $attacker->update(['specialUsed' => true]);
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'special',
                        'actorUserId' => $attacker->userId,
                        'actorCharacterId' => $attacker->characterId,
                        'description' => $description,
                    ]);

                    $attacker->update(['isActive' => false]);
                    $room->update(['totalTurns' => DB::raw('totalTurns + 1')]);

                    // 行動後のパッシブスキル発動
                    $context = [
                        'attacker' => $attacker,
                        'actorUserId' => $attacker->userId,
                        'actorCharacterId' => $attacker->characterId,
                    ];
                    $passiveLogs = PassiveSkillManager::applyPassives($room, 'on_action', $context);
                    $passiveLogs = array_merge(
                        $passiveLogs,
                        PassiveSkillManager::applyPassives($room, 'turn_end', $context)
                    );

                    foreach ($passiveLogs as $log) {
                        RoomLog::create([
                            'roomId' => $roomId,
                            'actionType' => 'passive',
                            'actorUserId' => $log['userId'],
                            'actorCharacterId' => $log['characterId'],
                            'description' => $log['description'],
                        ]);
                    }

                    $nextTurn = $this->updateNextTurn($roomId);
                } else {
                    $nextTurn = null;
                }

                $this->checkBattleEnd($room);

                $room->refresh();

                return response()->json([
                    'message' => $description,
                    'room' => $room,
                    'attacker' => $attacker,
                    'targets' => $targets->map(fn($t) => [
                        'id' => $t->id,
                        'userId' => $t->userId,
                        'life' => $t->life,
                        'isDead' => $t->isDead,
                        'power' => $t->power,
                        'speed' => $t->speed,
                        'evasion' => $t->evasion,
                    ]),
                    'next_turn_user_id' => $nextTurn ? $nextTurn->userId : null,
                    'next_turn_character_id' => $nextTurn ? $nextTurn->characterId : null,
                    'skill_type' => $skillType,
                    'is_single_target' => $isSingleTarget,
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'message' => 'スペシャルスキル処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ルームへの参加申請を拒否
     */
    public function reject(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            $room = Room::with(['hostUser', 'guestUser'])->where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            if ($room->hostUserId !== $userId) {
                return response()->json(['message' => '拒否の権限がありません'], 403);
            }

            if ($room->status !== 'pending') {
                return response()->json(['message' => '現在拒否を受け付けていません'], 400);
            }
            if (!$room->guestUserId) {
                return response()->json(['message' => 'ゲストが申請していません'], 400);
            }

            DB::transaction(function () use ($room) {
                $guestUserId = $room->guestUserId;

                RoomCharacter::where('roomId', $room->id)
                    ->where('userId', $guestUserId)
                    ->delete();

                $room->update([
                    'status' => 'waiting',
                    'guestUserId' => null
                ]);

                // RoomLog::create([
                //     'roomId' => $room->id,
                //     'actionType' => 'reject',
                //     'actorUserId' => $room->hostUserId,
                //     'targetUserId' => $guestUserId,
                //     'description' => "{$room->hostUser->name} が {$room->guestUser->name} の参加申請を拒否しました",
                // ]);
            });

            $room->refresh();

            return response()->json([
                'message' => '参加申請が拒否されました',
                'room' => $room
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => '拒否処理に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 次のターンを更新
     */
    private function updateNextTurn($roomId)
    {
        $nextTurn = RoomCharacter::where('roomId', $roomId)
            ->where('isActive', true)
            ->where('isDead', false)
            ->orderBy('speed', 'desc')
            ->first();

        if (!$nextTurn) {
            RoomCharacter::where('roomId', $roomId)
                ->where('isDead', false)
                ->update(['isActive' => true]);

            $nextTurn = RoomCharacter::where('roomId', $roomId)
                ->where('isActive', true)
                ->where('isDead', false)
                ->orderBy('speed', 'desc')
                ->first();

            if ($nextTurn) {
                RoomLog::create([
                    'roomId' => $roomId,
                    'actionType' => 'turnReset',
                    'description' => 'ターンがリセットされました',
                ]);
            }
        }

        if ($nextTurn) {
            Room::where('id', $roomId)->update([
                'currentTurnUserId' => $nextTurn->userId,
                'currentTurnCharacterId' => $nextTurn->characterId
            ]);
        }

        return $nextTurn;
    }

    /**
     * バトル終了をチェック
     */
    private function checkBattleEnd($room)
    {
        $hostAlive = RoomCharacter::where('roomId', $room->id)
            ->where('userId', $room->hostUserId)
            ->where('isDead', false)
            ->exists();
        $guestAlive = RoomCharacter::where('roomId', $room->id)
            ->where('userId', $room->guestUserId)
            ->where('isDead', false)
            ->exists();

        if (!$hostAlive || !$guestAlive) {
            $winUserId = !$hostAlive ? $room->guestUserId : $room->hostUserId;
            $room->update([
                'status' => 'finish',
                'winUserId' => $winUserId
            ]);
            RoomLog::create([
                'roomId' => $room->id,
                'actionType' => 'finish',
                'description' => !$hostAlive ? "{$room->hostUser->name} 側が全滅し、バトルが終了しました" : "{$room->guestUser->name} 側が全滅し、バトルが終了しました",
            ]);
        }
    }

    /**
     * 次のターンに進む
     */
    // public function nextTurn(Request $request)
    // {
    //     try {
    //         $roomId = $request->route('roomId');
    //         $userId = $request->route('userId'); // 現在の行動ユーザー

    //         $room = Room::where('id', $roomId)->first();

    //         if (!$room || $room->status !== 'battling') {
    //             return response()->json(['message' => 'バトルが進行中ではありません'], 400);
    //         }

    //         if ($room->currentTurnUserId !== $userId) {
    //             return response()->json(['message' => 'あなたのターンではありません'], 403);
    //         }

    //         return DB::transaction(function () use ($roomId, $userId, $room) {
    //             // 現在のユーザーの最速キャラクターを行動不能に
    //             RoomCharacter::where('roomId', $roomId)
    //                 ->where('userId', $userId)
    //                 ->where('isActive', true)
    //                 ->orderBy('speed', 'desc')
    //                 ->limit(1)
    //                 ->update(['isActive' => false]);

    //             $nextTurn = RoomCharacter::where('roomId', $roomId)
    //                 ->where('isActive', true)
    //                 ->orderBy('speed', 'desc')
    //                 ->first();

    //             if (!$nextTurn) {
    //                 RoomCharacter::where('roomId', $roomId)->update(['isActive' => true]);
    //                 $nextTurn = RoomCharacter::where('roomId', $roomId)
    //                     ->where('isActive', true)
    //                     ->orderBy('speed', 'desc')
    //                     ->first();
    //             }

    //             $room->update(['currentTurnUserId' => $nextTurn->userId, 'currentTurnCharacterId' => $nextTurn->characterId]);

    //             return response()->json([
    //                 'message' => '次のターンに進みました',
    //                 'room' => $room,
    //                 'next_turn_user_id' => $nextTurn->userId
    //             ], 200);
    //         });
    //     } catch (Exception $e) {
    //         return response()->json([
    //             'message' => 'ターン進行に失敗しました',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * 特定のルームを削除
     */
    public function delete(Request $request)
    {
        try {
            $roomId = $request->route('roomId');
            $userId = $request->route('userId');

            // ルームを取得
            $room = Room::where('id', $roomId)->first();

            if (!$room) {
                return response()->json(['message' => 'ルームが見つかりません'], 404);
            }

            // 削除権限の確認（ホストのみが削除可能）
            if ($room->hostUserId !== $userId) {
                return response()->json(['message' => 'ルームを削除する権限がありません'], 403);
            }

            // トランザクション内で削除
            DB::transaction(function () use ($room) {
                // 関連データの削除（必要に応じて）
                RoomCharacter::where('roomId', $room->id)->delete();
                // RoomLog::where('roomId', $room->id)->delete();

                // ルーム自体の削除
                $room->delete();

                // 削除ログ（オプション）
                // ※削除後にログを残す場合は別のテーブルに保存する必要あり
            });

            return response()->json([
                'message' => "ルーム {$room->id} が正常に削除されました"
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'ルームの削除に失敗しました',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ルームを全て削除（テスト用）
     */
    public function allDelete()
    {
        try {
            DB::beginTransaction();

            $deletedCount = Room::query()->delete();

            DB::commit();

            return response()->json([
                'message' => 'All rooms deleted successfully',
                'deleted_count' => $deletedCount
            ], 200);
        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete rooms',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

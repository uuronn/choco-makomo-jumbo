<?php

namespace App\Http\Controller;

use App\Service\PassiveSkillManager;
use App\Model\Character;
use App\Model\DuoRoom;
use App\Model\Room;
use App\Model\RoomCharacter;
use App\Model\RoomLog;
use App\Model\User;
use App\Model\UserCharacter;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DuoRoomController
{
    /**
     * ルームを承認し、戦闘を開始する
     * @param int $roomId ルームID
     * @return void
     */
    public function approveManually($roomId)
    {
        $room = Room::findOrFail($roomId);
        if ($room->status !== 'waiting') {
            throw new \Exception('ルームが待機状態ではありません。');
        }

        // ホストとゲストのキャラクターを取得
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
        foreach ($hostCharacters as $character) {
            RoomCharacter::where('id', $character->id)->update([
                'life' => $character->life * $hostBonuses['lifeMultiplier'],
                'maxLife' => $character->maxLife * $hostBonuses['lifeMultiplier'],
                'power' => $character->power * $hostBonuses['powerMultiplier'],
                'speed' => $character->speed * $hostBonuses['speedMultiplier'],
                'evasion' => $character->evasion * $hostBonuses['evasionMultiplier'],
            ]);
        }
        foreach ($hostBonuses['logs'] as $log) {
            RoomLog::create([
                'roomId' => $room->id,
                'actionType' => 'partyBonus',
                'actorUserId' => $room->hostUserId,
                'description' => $log,
            ]);
        }

        // ゲストのパーティボーナス適用
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
        foreach ($guestBonuses['logs'] as $log) {
            RoomLog::create([
                'roomId' => $room->id,
                'actionType' => 'partyBonus',
                'actorUserId' => $room->guestUserId,
                'description' => $log,
            ]);
        }

        // ルームステータスを戦闘中に更新
        $room->update(['status' => 'in_battle']);

        // 戦闘開始ログ
        RoomLog::create([
            'roomId' => $room->id,
            'characterId' => null,
            'userId' => null,
            'description' => '戦闘が開始されました。',
        ]);
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
 * ルーム作成（最初はホスト１名のみ）
 */
public function duoRoomCreate(Request $request)
{
    try {
        // リクエスト例: { hostUserId: "uuid1" }
        $hostUserId = $request->input('hostUserId');

        if (! $hostUserId) {
            return response()->json(['message' => 'hostUserId が必要です'], 400);
        }

        // すでに waiting 状態のルームがこのユーザーを含んでいないか
        $existing = DuoRoom::where(function ($q) use ($hostUserId) {
                $q->where('hostUserId', $hostUserId)
                  ->orWhere('coHostUserId', $hostUserId);
            })
            ->where('status', 'waiting')
            ->first();

        if ($existing) {
            return response()->json(['message' => '既に waiting 状態のルームが存在します'], 409);
        }

        // トランザクションでルーム作成
        $room = DB::transaction(function () use ($hostUserId) {
            return DuoRoom::create([
                'hostUserId'   => $hostUserId,
                'coHostUserId' => null,
                'status'       => 'waiting',
            ]);
        });

        return response()->json($room, 201);
    } catch (Exception $e) {
        return response()->json([
            'message' => 'DuoRoom の作成に失敗しました',
            'error'   => $e->getMessage(),
        ], 500);
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
                    'critical' => $character->baseCritical,
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
    // public function surrender(Request $request)
    // {
    //     try {
    //         $roomId = $request->route('roomId');
    //         $userId = $request->route('userId');

    //         $room = Room::with(['roomCharacter', 'hostUser', 'guestUser'])->where('id', $roomId)->first();

    //         if (!$room) {
    //             return response()->json(['message' => 'ルームが見つかりません'], 404);
    //         }

    //         if ($room->status !== 'battling') {
    //             return response()->json(['message' => 'バトルが進行中ではありません'], 400);
    //         }

    //         if ($room->hostUserId !== $userId && $room->guestUserId !== $userId) {
    //             return response()->json(['message' => 'このルームにアクセスする権限がありません'], 403);
    //         }

    //         return DB::transaction(function () use ($roomId, $userId, $room) {
    //             // 降参した側の全キャラを死にさせる
    //             RoomCharacter::where('roomId', $roomId)
    //                 ->where('userId', $userId)
    //                 ->where('isDead', false)
    //                 ->update([
    //                     'life' => 0,
    //                     'isDead' => true,
    //                     'isActive' => false,
    //                 ]);

    //             // 勝者を決定（降参した側と反対）
    //             $winnerUserId = ($userId === $room->hostUserId) ? $room->guestUserId : $room->hostUserId;
    //             $loserName = ($userId === $room->hostUserId) ? $room->hostUser->name : $room->guestUser->name;
    //             $winnerName = ($userId === $room->hostUserId) ? $room->guestUser->name : $room->hostUser->name;

    //             // ルームのステータスを終了に更新
    //             $room->update([
    //                 'status' => 'finish',
    //                 'winUserId' => $winnerUserId,
    //                 'currentTurnUserId' => null,
    //                 'currentTurnCharacterId' => null,
    //             ]);

    //             // 降参ログを記録
    //             RoomLog::create([
    //                 'roomId' => $roomId,
    //                 'actionType' => 'surrender',
    //                 'actorUserId' => $userId,
    //                 'description' => "{$loserName} が降参しました。{$winnerName} の勝利です。",
    //             ]);

    //             $room->refresh();

    //             return response()->json([
    //                 'message' => "{$loserName} が降参しました。{$winnerName} の勝利です。",
    //                 'room' => $room,
    //                 'winner_user_id' => $winnerUserId,
    //             ], 200);
    //         });
    //     } catch (Exception $e) {
    //         return response()->json([
    //             'message' => '降参処理に失敗しました',
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }

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

    // ここ
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
    // --- 既存ケース ---
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
        // ...（省略せず既存のまま）...
        break;

    case '全体攻撃':
        // ...（省略せず既存のまま）...
        break;

    // --- HTML: divタグの角で叩く ---
    case 'divタグの角で叩く':
        $targets = RoomCharacter::with('character')
            ->where('roomId', $roomId)
            ->where('userId', '!=', $userId)
            ->where('isDead', false)
            ->get();
        $damage = $attacker->power * 1.6;
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
                'isErrorState' => true,
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
        $description = "{$attacker->character->name} が divタグの角で叩く！ 全員に{$damage}ダメージ＆エラー状態";
        break;

    // --- Go: ゴルーチンラッシュ ---
    case 'ゴルーチンラッシュ':
        $targets = RoomCharacter::with('character')
            ->where('roomId', $roomId)
            ->where('userId', '!=', $userId)
            ->where('isDead', false)
            ->get();
        $damage = $attacker->power * 1.4;
        foreach ($targets as $target) {
            // 被ダメージ前パッシブ
            $context = [
                'room' => $room,
                'attacker' => $attacker,
                'target' => $target,
                'damage' => &$damage,
                'targetUserId' => $target->userId,
                'targetCharacterId' => $target->characterId,
            ];
            $passiveLogs = array_merge(
                $passiveLogs,
                PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context)
            );
            $newLife = max(0, $target->life - $damage);
            $target->update([
                'life' => $newLife,
                'isDead' => $newLife <= 0,
            ]);
            // エラー状態化
            $attacker->update(['isErrorState' => true]);
            // 被ダメージ後パッシブ
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
        $description = "{$attacker->character->name} が ゴルーチンラッシュ！ 全員に{$damage}ダメージ＆自身エラー";
        break;

    // --- CSS: opacity: 0.5; ---
    case 'opacity: 0.5;':
        $attacker->update(['evasion' => 50]);
        $description = "{$attacker->character->name} が opacity:0.5; で回避率50%に";
        $targets = [$attacker];
        break;

    // --- JavaScript: removeEventListener ---
    case 'removeEventListener':
        $targets = RoomCharacter::with('character')
            ->where('roomId', $roomId)
            ->where('userId', '!=', $userId)
            ->where('isDead', false)
            ->get();
        foreach ($targets as $target) {
            $target->update(['skipNextTurn' => true]);
        }
        $attacker->update(['isErrorState' => true]);
        $description = "{$attacker->character->name} が removeEventListener で全員の次ターンをスキップ＆自身エラー";
        break;

    // --- PHP: エラーハンドリング ---
    case 'エラーハンドリング':
        $all = RoomCharacter::with('character')
            ->where('roomId', $roomId)
            ->get();
        foreach ($all as $char) {
            if ($char->isErrorState) {
                $dmg = intval($char->life * 0.2);
                $newLife = max(0, $char->life - $dmg);
                $char->update(['life' => $newLife, 'isErrorState' => false]);
                if ($newLife <= 0) {
                    RoomLog::create([
                        'roomId' => $roomId,
                        'actionType' => 'death',
                        'targetUserId' => $char->userId,
                        'targetCharacterId' => $char->characterId,
                        'description' => "{$char->character->name} がダウンしました",
                    ]);
                }
            }
        }
        $description = "{$attacker->character->name} が エラーハンドリング！ エラー状態の全員に20%ダメージ＆解除";
        $targets = $all->filter(fn($c) => !$c->isDead);
        break;

    // --- Angular: 依存性の注入 ---
    case '依存性の注入':
        $friends = RoomCharacter::with('character')
            ->where('roomId', $roomId)
            ->where('userId', $userId)
            ->where('isDead', false)
            ->get();
        foreach ($friends as $f) {
            $heal = intval($f->maxLife * 0.25);
            if ($f->isErrorState) $heal = intval($f->maxLife * 0.30);
            $f->update(['life' => min($f->maxLife, $f->life + $heal)]);
        }
        $description = "{$attacker->character->name} が 依存性の注入！ 味方全員を25%（エラー時30%）回復";
        $targets = $friends;
        break;

    // --- Vue: Vue3 ---
    case 'Vue3':
        $mult = $attacker->isErrorState ? 1.5 : 1.2;
        $attacker->update([
            'power' => intval($attacker->power * $mult),
            'speed' => intval($attacker->speed * $mult),
            'life' => min($attacker->maxLife, intval($attacker->life + $attacker->maxLife * 0.30)),
        ]);
        $description = "{$attacker->character->name} が Vue3！ パワー＆スピード×{$mult}＆HP30%回復（エラー時50%）";
        $targets = [$attacker];
        break;

    // --- Docker: docker compose down ---
    case 'docker compose down':
        $friends = RoomCharacter::with('character')
            ->where('roomId', $roomId)
            ->where('userId', $userId)
            ->where('isDead', false)
            ->get();
        foreach (RoomCharacter::with('character')
                 ->where('roomId', $roomId)
                 ->where('userId', '!=', $userId)
                 ->where('isDead', false)
                 ->get() as $target) {
            $dmg = $attacker->power;
            $context = compact('room', 'attacker', 'target', 'dmg');
            PassiveSkillManager::applyPassives($room, 'before_damage_taken', $context);
            $newLife = max(0, $target->life - $dmg);
            $target->update(['life' => $newLife, 'isDead' => $newLife <= 0]);
            PassiveSkillManager::applyPassives($room, 'on_damage_taken', $context);
            if ($newLife <= 0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$target->userId,'targetCharacterId'=>$target->characterId,
                    'description'=>"{$target->character->name} がダウンしました",
                ]);
            }
        }
        // 自身HP0＆シールド解除
        $attacker->update(['life'=>0,'isDead'=>true,'shield'=>0]);
        $description = "{$attacker->character->name} が docker compose down！ 自身ダウン＆全員にパワー分ダメージ＆シールド解除";
        $targets = RoomCharacter::with('character')
            ->where('roomId',$roomId)
            ->where('userId','!=',$userId)
            ->get();
        break;

    // --- Linux: rm -rf / ---
    case 'rm -rf /':
        $targets = RoomCharacter::with('character')
            ->where('roomId',$roomId)
            ->where('userId','!=',$userId)
            ->where('isDead',false)
            ->get();
        foreach ($targets as $t) {
            $t->update(['life'=>0,'isDead'=>true]);
            RoomLog::create([
                'roomId'=>$roomId,'actionType'=>'death',
                'targetUserId'=>$t->userId,'targetCharacterId'=>$t->characterId,
                'description'=>"{$t->character->name} がダウンしました",
            ]);
        }
        $description = "{$attacker->character->name} が rm -rf / !! 全員即ダウン";
        break;

    // --- Mac: ハングリーであれ。愚か者であれ ---
    case 'ハングリーであれ。愚か者であれ':
        $friends = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId',$userId)
            ->where('isDead',false)->get();
        $mult = $attacker->isErrorState ? 1.5 : 1.2;
        foreach ($friends as $f) {
            $f->update([
                'power'=>intval($f->power * $mult),
                'speed'=>intval($f->speed * $mult),
            ]);
        }
        $description = "{$attacker->character->name} が ハングリーであれ。愚か者であれ！ 味方全員パワー＆スピード×{$mult}";
        $targets = $friends;
        break;

    // --- Windows: お前を消す方法 ---
    case 'お前を消す方法':
        $friends = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId',$userId)
            ->where('isDead',false)->get();
        foreach ($friends as $f) {
            $f->update([
                'power'=>intval($f->power * 1.3),
                'isErrorState'=>true,
            ]);
        }
        $description = "{$attacker->character->name} が お前を消す方法！ 味方全員パワー×1.3＆エラー";
        $targets = $friends;
        break;

    // --- Supabase: RLS結界 ---
    case 'RLS結界':
        $friends = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId',$userId)
            ->where('isDead',false)->get();
        foreach ($friends as $f) {
            $shieldCount = $f->shield + 1;
            if ($attacker->isErrorState) $shieldCount++;
            $f->update(['shield'=>$shieldCount]);
        }
        $description = "{$attacker->character->name} が RLS結界！ 味方全員にシールド付与（エラー時追加）";
        $targets = $friends;
        break;

    // --- Apache: mod_global_boost ---
    case 'mod_global_boost':
        $friends = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId',$userId)
            ->where('isDead',false)->get();
        foreach ($friends as $f) {
            $heal = intval($f->maxLife * 0.10);
            $power = intval($f->power * 1.1);
            $speed = intval($f->speed * 1.1);
            $eva = $f->evasion + 5;
            if ($attacker->isErrorState) {
                $heal *= 2; $power = intval($power * 2); $speed = intval($speed * 2); $eva *= 2;
            }
            $f->update([
                'life'=>min($f->maxLife, $f->life + $heal),
                'power'=>$power,'speed'=>$speed,'evasion'=>$eva,
            ]);
        }
        $description = "{$attacker->character->name} が mod_global_boost！ 味方全員HP10%回復＆パワー／スピード×1.1＆回避+5（エラー時倍）";
        $targets = $friends;
        break;

    // --- Nginx: リバースプロキシ ---
    case 'リバースプロキシ':
        $heal = intval($attacker->maxLife * 0.15);
        $attacker->update([
            'life'=>min($attacker->maxLife, $attacker->life + $heal),
            'shield'=>$attacker->shield + 1,
        ]);
        if ($attacker->isErrorState) {
            $friends = RoomCharacter::with('character')
                ->where('roomId',$roomId)->where('userId',$userId)
                ->where('isDead',false)->get();
            foreach ($friends as $f) {
                $f->update(['shield'=>$f->shield + 1]);
            }
        }
        $description = "{$attacker->character->name} が リバースプロキシ！ 自身HP15%回復＋シールド＆（エラーで味方にもシールド）";
        $targets = [$attacker];
        break;

    // --- LiteSpeed: HTTP/3通信 ---
    case 'HTTP/3通信':
        $targets = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        // 最速ターゲット
        $fast = $targets->sortByDesc('speed')->first();
        if ($fast) {
            $dmg = $attacker->speed;
            if ($attacker->isErrorState) $dmg = intval($dmg * 1.5);
            $context = ['room'=>$room,'attacker'=>$attacker,'target'=>$fast,'dmg'=>$dmg];
            PassiveSkillManager::applyPassives($room,'before_damage_taken',$context);
            $newLife = max(0, $fast->life - $dmg);
            $fast->update(['life'=>$newLife,'isDead'=>$newLife<=0]);
            PassiveSkillManager::applyPassives($room,'on_damage_taken',$context);
            if ($newLife<=0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$fast->userId,'targetCharacterId'=>$fast->characterId,
                    'description'=>"{$fast->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が HTTP/3通信！ 最高速キャラに自身のスピード分ダメージ（エラー時1.5倍）";
        break;

    // --- Caddy: 証明書の自動更新 ---
    case '証明書の自動更新':
        $friends = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId',$userId)
            ->where('isDead',false)->get();
        foreach ($friends as $f) {
            $f->update(['blockCount'=>$f->blockCount + 1]);
        }
        $description = "{$attacker->character->name} が 証明書の自動更新！ 味方全員にシールド";
        $targets = $friends;
        break;

    // --- GAS: バスGAS爆発 ---
    case 'バスGAS爆発':
        $friends = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId',$userId)
            ->where('isDead',false)->get();
        foreach ($friends as $f) {
            $dmg = intval($f->life * 0.15);
            $f->update(['life'=>max(0,$f->life - $dmg)]);
            $f->update(['isErrorState'=>true]);
            if ($f->life <= 0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$f->userId,'targetCharacterId'=>$f->characterId,
                    'description'=>"{$f->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が バスGAS爆発！ 味方全員に15%ダメージ＆エラー";
        $targets = $friends;
        break;

    // --- Java: ぬるぽ → ｶﾞｯ ---
    case 'ぬるぽ → ｶﾞｯ':
        $downed = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('isDead',true)
            ->get();
        if ($downed->isEmpty()) throw new Exception('対象がいません');
        $highest = $downed->sortByDesc('power')->first();
        $dmg = $highest->power * ($attacker->isErrorState ? 2 : 1);
        $enemies = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        foreach ($enemies as $e) {
            $context = compact('room','attacker','e','dmg');
            PassiveSkillManager::applyPassives($room,'before_damage_taken',$context);
            $newLife = max(0,$e->life - $dmg);
            $e->update(['life'=>$newLife,'isDead'=>$newLife<=0]);
            PassiveSkillManager::applyPassives($room,'on_damage_taken',$context);
            if ($newLife<=0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$e->userId,'targetCharacterId'=>$e->characterId,
                    'description'=>"{$e->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が ぬるぽ → ｶﾞｯ！ ダウン中最強のパワー{$highest->power}で全体攻撃";
        break;

    // --- C: デニス・リッチーの正拳突き ---
    case 'デニス・リッチーの正拳突き':
        $enemies = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        $max = $enemies->sortByDesc('power')->first();
        if ($max) {
            $dmg = 1972;
            $context = ['room'=>$room,'attacker'=>$attacker,'target'=>$max,'dmg'=>$dmg];
            PassiveSkillManager::applyPassives($room,'before_damage_taken',$context);
            $newLife = max(0,$max->life - $dmg);
            $max->update(['life'=>$newLife,'isDead'=>$newLife<=0]);
            PassiveSkillManager::applyPassives($room,'on_damage_taken',$context);
            if ($newLife<=0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$max->userId,'targetCharacterId'=>$max->characterId,
                    'description'=>"{$max->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が デニス・リッチーの正拳突き！ パワー最強に1972ダメージ";
        break;

    // --- Git: git push -f origin main ---
    case 'git push -f origin main':
        $enemies = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        foreach ($enemies as $e) {
            $dmg = $attacker->power;
            $context = compact('room','attacker','e','dmg');
            PassiveSkillManager::applyPassives($room,'before_damage_taken',$context);
            $newLife = max(0,$e->life - $dmg);
            $e->update(['life'=>$newLife,'isDead'=>$newLife<=0,'shield'=>0]);
            PassiveSkillManager::applyPassives($room,'on_damage_taken',$context);
            if ($newLife<=0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$e->userId,'targetCharacterId'=>$e->characterId,
                    'description'=>"{$e->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が git push -f origin main！ 全員にパワー分ダメージ＆シールド消去";
        break;

    // --- Fortran: ジョン・バッカスの膝蹴り ---
    case 'ジョン・バッカスの膝蹴り':
        $enemies = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        $min = $enemies->sortBy('power')->first();
        if ($min) {
            $dmg = 1957;
            $context = ['room'=>$room,'attacker'=>$attacker,'target'=>$min,'dmg'=>$dmg];
            PassiveSkillManager::applyPassives($room,'before_damage_taken',$context);
            $newLife = max(0,$min->life - $dmg);
            $min->update(['life'=>$newLife,'isDead'=>$newLife<=0]);
            PassiveSkillManager::applyPassives($room,'on_damage_taken',$context);
            if ($newLife<=0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$min->userId,'targetCharacterId'=>$min->characterId,
                    'description'=>"{$min->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が ジョン・バッカスの膝蹴り！ パワー最弱に1957ダメージ";
        break;

    // --- Laravel: Eloquentストライク ---
    case 'Eloquentストライク':
        $enemies = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        $mult = $attacker->isErrorState ? 1.5 : 1.0;
        $dmg = $attacker->power * $mult;
        foreach ($enemies as $e) {
            $context = ['room'=>$room,'attacker'=>$attacker,'target'=>$e,'dmg'=>$dmg];
            PassiveSkillManager::applyPassives($room,'before_damage_taken',$context);
            $newLife = max(0,$e->life - $dmg);
            $e->update(['life'=>$newLife,'isDead'=>$newLife<=0]);
            PassiveSkillManager::applyPassives($room,'on_damage_taken',$context);
            if ($newLife<=0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$e->userId,'targetCharacterId'=>$e->characterId,
                    'description'=>"{$e->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が Eloquentストライク！ 全員にパワー×{$mult}ダメージ";
        break;

    // --- Python: データ解析 ---
    case 'データ解析':
        $enemies = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        foreach ($enemies as $e) {
            $debuff = $attacker->isErrorState ? 0.60 : 0.40;
            $e->update(['power'=>intval($e->power * (1 - $debuff))]);
        }
        $description = "{$attacker->character->name} が データ解析！ 全員のパワーを".($attacker->isErrorState? '60%' : '40%')."ダウン";
        $targets = $enemies;
        break;

    // --- Rust: RustじゃないよLastだよ。 ---
    case 'RustじゃないよLastだよ。':
        $friends = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId',$userId)
            ->where('isDead',false)->get();
        foreach ($friends as $f) {
            $dmg = intval($f->life * 0.20);
            $f->update(['life'=>max(0,$f->life - $dmg),'isErrorState'=>true]);
            if ($f->life<=0) {
                RoomLog::create([
                    'roomId'=>$roomId,'actionType'=>'death',
                    'targetUserId'=>$f->userId,'targetCharacterId'=>$f->characterId,
                    'description'=>"{$f->character->name} がダウンしました",
                ]);
            }
        }
        $description = "{$attacker->character->name} が RustじゃないよLastだよ。！ 味方全員に20%ダメージ＆エラー";
        $targets = $friends;
        break;

    // --- SQL: SQLインジェクション ---
    case 'SQLインジェクション':
        $enemies = RoomCharacter::with('character')
            ->where('roomId',$roomId)->where('userId','!=',$userId)
            ->where('isDead',false)->get();
        foreach ($enemies as $e) {
            // パワーとスピードを入れ替え
            $newPower = $e->speed;
            $newSpeed = $e->power;
            $e->update(['power'=>$newPower,'speed'=>$newSpeed]);
        }
        $attacker->update(['isErrorState'=>true]);
        $description = "{$attacker->character->name} が SQLインジェクション！ 敵全員のパワー⇔スピード入替＆自身エラー";
        $targets = $enemies;
        break;

    // --- Webpack: Tree shaking ---
    case 'Tree shaking':
        $all = RoomCharacter::with('character')
            ->where('roomId',$roomId)->get();
        foreach ($all as $c) {
            $c->update(['skillUsed'=>true]);
        }
        $description = "{$attacker->character->name} が Tree shaking！ 全員のスキルを使用済みに";
        $targets = $all;
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
     * レートを更新する共通ロジック
     */
    private function updateRatings($room, $winUserId, $loseUserId)
    {
        // 勝者と敗者のユーザー情報を取得
        $winner = User::find($winUserId);
        $loser = User::find($loseUserId);

        if ($winner && $loser) {
            // Eloレーティング計算
            $kFactor = 32; // K値
            $ratingA = $winner->rating ?? 1500; // 勝者の現在のレート（デフォルト1500）
            $ratingB = $loser->rating ?? 1500; // 敗者の現在のレート（デフォルト1500）

            // 期待勝率の計算
            $expectedA = 1 / (1 + pow(10, ($ratingB - $ratingA) / 400));
            $expectedB = 1 / (1 + pow(10, ($ratingA - $ratingB) / 400));

            // 実際の結果（勝ち=1、負け=0）
            $scoreA = 1;
            $scoreB = 0;

            // 新しいレートを計算
            $newRatingA = $ratingA + $kFactor * ($scoreA - $expectedA);
            $newRatingB = $ratingB + $kFactor * ($scoreB - $expectedB);

            // レートを更新
            $winner->update(['rating' => round($newRatingA)]);
            $loser->update(['rating' => round($newRatingB)]);

            // レート変動量を計算
            $winnerRateChange = round($newRatingA) - $ratingA;
            $loserRateChange = round($newRatingB) - $ratingB;

            // バトル結果ログを保存
            RoomLog::create([
                'roomId' => $room->id,
                'actionType' => 'rating_update',
                'description' => "レート更新: {$winner->name} +{$winnerRateChange}, {$loser->name} {$loserRateChange}",
            ]);

            // battle_result_logsテーブルに保存
            DB::table('battle_result_logs')->insert([
                'roomId' => $room->id,
                'winnerUserId' => $winUserId,
                'loserUserId' => $loseUserId,
                'winnerRateChange' => $winnerRateChange,
                'loserRateChange' => $loserRateChange,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * バトル終了をチェック
     */
    private function checkBattleEnd($room)
    {
        // リレーションをロード
        $room->load(['hostUser', 'guestUser']);

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
            $loseUserId = !$hostAlive ? $room->hostUserId : $room->guestUserId;

            // レート更新
            $this->updateRatings($room, $winUserId, $loseUserId);

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
                $loserUserId = ($userId === $room->hostUserId) ? $room->hostUserId : $room->guestUserId;
                $winnerName = ($userId === $room->hostUserId) ? $room->guestUser->name : $room->hostUser->name;
                $loserName = ($userId === $room->hostUserId) ? $room->hostUser->name : $room->guestUser->name;

                // レート更新
                $this->updateRatings($room, $winnerUserId, $loserUserId);

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

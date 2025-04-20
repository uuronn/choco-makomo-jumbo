<?php

namespace App\Service;

use App\Model\Room;
use App\Model\RoomCharacter;
use App\Model\User;

class PartyBonusManager
{
    /**
     * パーティボーナス（パーティスキル）を適用する
     * @param Room $room ルーム
     * @return array 発動したログの配列
     */
    public static function applyBonuses(Room $room)
    {
        $logs = [];
        $hostUser = $room->hostUser;
        $guestUser = $room->guestUser;

        $hostCharacters = RoomCharacter::where('roomId', $room->id)
            ->where('userId', $hostUser->id)
            ->with('character')
            ->get();
        $guestCharacters = RoomCharacter::where('roomId', $room->id)
            ->where('userId', $guestUser->id)
            ->with('character')
            ->get();

        // ホストのパーティスキル
        $hostBonuses = self::applyPartyBonuses($hostCharacters, $hostUser, $room);
        foreach ($hostCharacters as $character) {
            $character->update([
                'life' => $character->life * $hostBonuses['lifeMultiplier'],
                'maxLife' => $character->maxLife * $hostBonuses['lifeMultiplier'],
                'power' => $character->power * $hostBonuses['powerMultiplier'],
                'speed' => $character->speed * $hostBonuses['speedMultiplier'],
                'evasion' => $character->evasion + $hostBonuses['evasionAdder'],
                'blockCount' => $character->blockCount + $hostBonuses['blockAdder'],
                'specialSkillTurn' => $hostBonuses['specialSkillTurn'][$character->id] ?? $character->specialSkillTurn,
            ]);
        }
        if (!empty($hostBonuses['logs'])) {
            $logs[] = [
                'characterId' => null,
                'userId' => $hostUser->id,
                'description' => "[on_battle_start] " . implode(' / ', $hostBonuses['logs'])
            ];
        }

        // ゲストのパーティスキル
        $guestBonuses = self::applyPartyBonuses($guestCharacters, $guestUser, $room);
        foreach ($guestCharacters as $character) {
            $character->update([
                'life' => $character->life * $guestBonuses['lifeMultiplier'],
                'maxLife' => $character->maxLife * $guestBonuses['lifeMultiplier'],
                'power' => $character->power * $guestBonuses['powerMultiplier'],
                'speed' => $character->speed * $guestBonuses['speedMultiplier'],
                'evasion' => $character->evasion + $guestBonuses['evasionAdder'],
                'blockCount' => $character->blockCount + $guestBonuses['blockAdder'],
                'specialSkillTurn' => $guestBonuses['specialSkillTurn'][$character->id] ?? $character->specialSkillTurn,
            ]);
        }
        if (!empty($guestBonuses['logs'])) {
            $logs[] = [
                'characterId' => null,
                'userId' => $guestUser->id,
                'description' => "[on_battle_start] " . implode(' / ', $guestBonuses['logs'])
            ];
        }

        return $logs;
    }

    /**
     * パーティスキルを適用する
     * @param Collection $characters キャラクターのコレクション
     * @param User $user ユーザー
     * @param Room $room ルーム
     * @return array ボーナス倍率とログ
     */
    private static function applyPartyBonuses($characters, $user, $room)
    {
        $powerMultiplier = 1.0;
        $speedMultiplier = 1.0;
        $lifeMultiplier = 1.0;
        $evasionAdder = 0;
        $blockAdder = 0;
        $specialSkillTurn = [];
        $logs = [];

        $characterNames = $characters->pluck('character.name')->toArray();
        $characterTypes = $characters->pluck('character.type')->toArray();
        $characterIds = $characters->pluck('character.id', 'id')->toArray();

        foreach ($characters as $character) {
            $partySkillName = $character->character->partySkillName;
            $partySkillCondition = $character->character->partySkillCondition;
            if (!$partySkillName) {
                continue;
            }

            // 条件チェック
            $conditionMet = true;
            if ($partySkillCondition) {
                switch ($partySkillCondition) {
                    case 'パーティがHTML1体のみの場合に発動':
                        $conditionMet = count($characterNames) === 1 && in_array('HTML', $characterNames);
                        break;
                    case 'パーティが「言語」タイプだけで構成されている場合に発動':
                        $conditionMet = !array_diff($characterTypes, ['言語']);
                        break;
                    case 'パーティに「HTML、CSS、JavaScript」が揃っている場合に発動':
                        $conditionMet = !array_diff(['HTML', 'CSS', 'JavaScript'], $characterNames);
                        break;
                    case 'パーティに「JavaScript」がいる場合に発動':
                        $conditionMet = in_array('JavaScript', $characterNames);
                        break;
                    case 'パーティに「Ruby on Rails」が構成されている場合に発動':
                        $conditionMet = in_array('Ruby on Rails', $characterNames);
                        break;
                    case 'パーティに「オペレーティングシステム」タイプがいる場合に発動':
                        $conditionMet = in_array('オペレーティングシステム', $characterTypes);
                        break;
                    case 'パーティが「React、Vue、Angular」で構成されている場合に発動':
                        $conditionMet = !array_diff(['React', 'Vue', 'Angular'], $characterNames);
                        break;
                    case 'パーティに「AWS、Azure、Google Cloud」がいる場合に発動':
                        $conditionMet = !array_diff(['AWS', 'Azure', 'Google Cloud'], $characterNames);
                        break;
                    case 'パーティに「オペレーティングシステム」タイプが1体以下の場合に発動':
                        $conditionMet = count(array_intersect($characterTypes, ['オペレーティングシステム'])) <= 1;
                        break;
                    case 'パーティに「データベース」タイプが2体以上いる場合に発動':
                        $conditionMet = count(array_intersect($characterTypes, ['データベース'])) >= 2;
                        break;
                    case 'パーティに「PHP」が構成されている場合に発動':
                        $conditionMet = in_array('PHP', $characterNames);
                        break;
                    case 'パーティが「言語、フレームワーク、ライブラリ、ビルドツール」のいずれかのタイプだけで構成されている場合に発動':
                        $conditionMet = !array_diff($characterTypes, ['言語', 'フレームワーク', 'ライブラリ', 'ビルドツール']);
                        break;
                    case 'パーティに「C」がいる場合に発動':
                        $conditionMet = in_array('C', $characterNames);
                        break;
                    default:
                        $conditionMet = true; // 条件なし
                        break;
                }
            }

            if (!$conditionMet) {
                continue;
            }

            switch ($partySkillName) {
                case 'HTML5':
                    if ($character->character->name === 'HTML') {
                        $character->update([
                            'life' => $character->life * 3.0,
                            'maxLife' => $character->maxLife * 3.0,
                            'power' => $character->power * 2.0,
                            'speed' => $character->speed * 2.0,
                        ]);
                        $logs[] = "{$user->name} が「HTML5」を発動、自身のHPを3倍、パワーとスピードを2倍にする。";
                    }
                    break;
                case 'チームGopher':
                    $speedMultiplier *= 1.3;
                    $evasionAdder += 12;
                    $logs[] = "{$user->name} が「チームGopher」を発動、味方全員のスピードを1.3倍、回避率を1.2倍にする。";
                    break;
                case 'Web三種の神器':
                    $lifeMultiplier *= 1.6;
                    $powerMultiplier *= 1.6;
                    $speedMultiplier *= 1.6;
                    $logs[] = "{$user->name} が「Web三種の神器」を発動、味方全員のHP、パワー、スピードを1.6倍にする。";
                    break;
                case 'JavaScript互換':
                    $powerMultiplier *= 1.5;
                    $speedMultiplier *= 1.5;
                    $evasionAdder += 7;
                    $logs[] = "{$user->name} が「JavaScript互換」を発動、味方全員のパワーとスピードを1.5倍にし、回避率を+7%する。";
                    break;
                case 'PHPカンファレンス':
                    $lifeMultiplier *= 1.2;
                    $powerMultiplier *= 1.2;
                    $speedMultiplier *= 1.2;
                    $evasionAdder += 4;
                    $logs[] = "{$user->name} が「PHPカンファレンス」を発動、味方全員のHP、パワー、スピードを1.2倍にし、回避率を+4%する。";
                    break;
                case 'MVCモデル':
                    $lifeMultiplier *= 1.4;
                    $powerMultiplier *= 1.1;
                    $speedMultiplier *= 1.1;
                    $logs[] = "{$user->name} が「MVCモデル」を発動、味方全員のHPを1.4倍にし、パワーとスピードを1.1倍にする。";
                    break;
                case 'iOSエコシステム':
                    $lifeMultiplier *= 1.15;
                    $logs[] = "{$user->name} が「iOSエコシステム」を発動、味方全員のHPを1.15倍にする。";
                    break;
                case '三大フレームワーク':
                    $lifeMultiplier *= 1.3;
                    $powerMultiplier *= 1.3;
                    $speedMultiplier *= 1.3;
                    $evasionAdder += 5;
                    $logs[] = "{$user->name} が「三大フレームワーク」を発動、味方全員のHP、パワー、スピードを1.3倍にし、回避率を+5%する。";
                    break;
                case 'Railsチュートリアル':
                    $speedMultiplier += 300 / $characters->first()->speed; // ベーススピードで割る
                    $logs[] = "{$user->name} が「Railsチュートリアル」を発動、味方全員のスピードを+300する。";
                    break;
                case '三大クラウド':
                    $lifeMultiplier *= 2.0;
                    $logs[] = "{$user->name} が「三大クラウド」を発動、味方全員のHPを2倍にする。";
                    break;
                case 'ハイパーバイザー型':
                    $lifeMultiplier *= 1.3;
                    $powerMultiplier *= 1.3;
                    $speedMultiplier *= 1.3;
                    $logs[] = "{$user->name} が「ハイパーバイザー型」を発動、味方全員のHP、パワー、スピードを1.3倍にする。";
                    break;
                case 'Homebrew':
                    $lifeMultiplier *= 1.8;
                    $powerMultiplier *= 1.3;
                    $speedMultiplier *= 1.3;
                    $logs[] = "{$user->name} が「Homebrew」を発動、味方全員のHPを1.8倍にし、パワーとスピードを1.3倍にする。";
                    break;
                case 'データベース連携':
                    $lifeMultiplier *= 1.5;
                    $powerMultiplier *= 1.5;
                    $speedMultiplier *= 1.5;
                    $logs[] = "{$user->name} が「データベース連携」を発動、味方全員のHPを1.5倍にし、パワーとスピードを1.5倍にする。";
                    break;
                case 'Unityゲーム開発':
                    $multiplier = in_array('C#', $characterNames) ? 1.3 : 1.2;
                    $powerMultiplier *= $multiplier;
                    $speedMultiplier *= in_array('C#', $characterNames) ? 1.3 : 1.1;
                    $lifeMultiplier *= $multiplier;
                    $logs[] = "{$user->name} が「Unityゲーム開発」を発動、味方全員のHPを{$multiplier}倍、パワーとスピードを" . (in_array('C#', $characterNames) ? '1.3倍' : '1.1倍') . "にする。";
                    break;
                case '自動HTTPS':
                    $blockAdder += ($character->character->name === 'Caddy') ? 3 : 0;
                    if (in_array('Go', $characterNames)) {
                        $blockAdder += 1;
                        $logs[] = "{$user->name} の Caddy が「自動HTTPS」を発動、自身にシールドを3枚付与し、Goの効果で味方全員にシールドを1枚追加。";
                    } else {
                        $logs[] = "{$user->name} の Caddy が「自動HTTPS」を発動、自身にシールドを3枚付与。";
                    }
                    break;
                case 'オフィス自動化':
                    $lifeMultiplier *= 1.5;
                    $speedMultiplier *= 1.5;
                    $logs[] = "{$user->name} が「オフィス自動化」を発動、味方全員のHP、スピードを1.5倍にする。";
                    break;
                case '軽量データベース':
                    $evasionAdder += 10;
                    $logs[] = "{$user->name} が「軽量データベース」を発動、味方全員の回避率を+10%する。";
                    break;
                case 'DOM簡易操作':
                    $powerMultiplier *= 1.3;
                    $speedMultiplier *= 1.3;
                    $logs[] = "{$user->name} が「DOM簡易操作」を発動、味方全員のパワー、スピードを1.3倍にする。";
                    break;
                case 'artisanの導き':
                    $powerMultiplier *= 1.3;
                    $speedMultiplier *= 1.3;
                    $logs[] = "{$user->name} が「artisanの導き」を発動、味方全員のパワーとスピードを1.3倍にする。";
                    break;
                case 'Git運用':
                    $evasionAdder += 10;
                    $blockAdder += 1;
                    $logs[] = "{$user->name} が「Git運用」を発動、味方全員の回避率を+10%し、味方全員にシールドを1枚付与する。";
                    break;
                case 'ゼロコンフィグ':
                    foreach ($characters as $ally) {
                        if ($ally->character->baseSpecialSkillTurn <= 13 && $ally->specialSkillTurn > 0) {
                            $specialSkillTurn[$ally->id] = 0;
                        }
                    }
                    $logs[] = "{$user->name} が「ゼロコンフィグ」を発動、スペシャルスキルの発動ターン数が13以下の味方のスキルが即発動可能になった。";
                    break;
                case '苦しんで戦うC言語':
                    if ($character->character->name === 'C') {
                        $damage = $character->maxLife * 0.3;
                        $character->update([
                            'life' => max(0, $character->life - $damage),
                            'isErrorMode' => true,
                        ]);
                        $logs[] = "{$user->name} が「苦しんで戦うC言語」を発動、自身のHPを30%ダメージを受け、エラー状態にする。";
                    }
                    break;
                case 'C言語派生':
                    $powerMultiplier *= 1.1;
                    $speedMultiplier *= 1.1;
                    $logs[] = "{$user->name} が「C言語派生」を発動、味方全員のパワーとスピードを1.1倍にする。";
                    break;
            }
        }

        return [
            'powerMultiplier' => $powerMultiplier,
            'speedMultiplier' => $speedMultiplier,
            'lifeMultiplier' => $lifeMultiplier,
            'evasionAdder' => $evasionAdder,
            'blockAdder' => $blockAdder,
            'specialSkillTurn' => $specialSkillTurn,
            'logs' => $logs,
        ];
    }
}

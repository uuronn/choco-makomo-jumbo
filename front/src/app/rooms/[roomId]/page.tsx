"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthProvider";
import Link from "next/link";
import Loading from "~/components/Loading";

type Room = {
  id: string;
  hostUserId: string;
  guestUserId: string;
  status: string;
  currentTurnUserId: string;
};

export default function RoomDetailPage() {
  const { user } = useAuth();
  const { roomId } = useParams();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!roomId || !user) return;

    // ルーム情報を取得
    const fetchRoom = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${roomId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.uid }),
          },
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "ルームの取得に失敗しました");
        }

        const data = await res.json();
        setRoom(data.room);

        // 自分のターンかどうかを確認
        setIsMyTurn(data.room.currentTurnUserId === user.uid);
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

    // ルームの状態をリアルタイム監視
    const interval = setInterval(fetchRoom, 3000); // 3秒ごとにチェック

    return () => clearInterval(interval);
  }, [roomId, user]);

  // バトル開始（ホストのみ実行可能）
  const startBattle = async () => {
    if (!user) return;

    if (!room || room.hostUserId !== user.uid) {
      alert("ホストのみがバトルを開始できます");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/start-battle`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room.id, userId: user.uid }),
      },
    );

    if (!res.ok) {
      alert("バトル開始に失敗しました");
      console.error(await res.json());
      return;
    }
  };

  // コマンドを送信する
  const sendCommand = async (command: "attack" | "defend") => {
    if (!room || !isMyTurn || !user) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/action`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room.id, userId: user.uid, command }),
      },
    );

    if (!res.ok) {
      alert("コマンドの送信に失敗しました");
      console.error(await res.json());
      return;
    }

    const data = await res.json();
    setBattleLog([...battleLog, data.message]);
    setIsMyTurn(false);
  };

  if (!user || loading) return <Loading message="認証中" />;
  if (!room) return <p>ルームが見つかりません</p>;

  console.info("room", room);

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">ルーム詳細</h1>

      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <p>
          <strong>ルームID:</strong> {room.id}
        </p>
        <p>
          <strong>ホスト:</strong> {room.hostUserId}
        </p>
        <p>
          <strong>ゲスト:</strong> {room.guestUserId || "未参加"}
        </p>
        <p>
          <strong>ステータス:</strong> {room.status}
        </p>
        <p>
          <strong>現在のターン:</strong>{" "}
          {room.currentTurnUserId === user.uid
            ? "あなたのターン"
            : "相手のターン"}
        </p>
      </div>

      {/* コマンド選択 */}
      {isMyTurn && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">コマンドを選択</h2>
          <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded-md m-2"
            onClick={() => sendCommand("attack")}
          >
            攻撃する
          </button>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded-md m-2"
            onClick={() => sendCommand("defend")}
          >
            防御する
          </button>
        </div>
      )}

      {/* バトルログ */}
      <div className="bg-gray-800 text-white p-4 rounded-md mt-6 w-full max-w-md">
        <h2 className="text-xl font-bold">バトルログ</h2>
        {battleLog.map((log, index) => (
          <p key={`${index + log}`}>{log}</p>
        ))}
      </div>

      <Link href="/" className="mt-4 text-blue-500">
        戻る
      </Link>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";
import Link from "next/link";
import Loading from "~/components/Loading";
import Pending from "~/components/Pending";
import { Room } from "~/type/room";

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
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/${user.uid}/${roomId}/status`,
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "ルームの取得に失敗しました");
        }

        const data = await res.json();
        setRoom(data);

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

  return room.status === "pending" && room.hostUserId == user.uid ? (
    <Pending room={room} />
  ) : room.status === "pending" && room.hostUserId !== user.uid ? (
    <></>
  ) : (
    <Loading message="承認待ち" />
  );
}

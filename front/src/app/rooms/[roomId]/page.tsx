"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserContext } from "../../../context/UserProvider";
import Loading from "~/components/Loading";
import Pending from "~/components/Pending";
import { Room } from "~/type/room";
import Battle from "~/components/Battle";

export default function RoomDetailPage() {
  const { user } = useUserContext();
  const { roomId } = useParams();

  const [room, setRoom] = useState<Room | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  const router = useRouter();

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
        const data = await res.json();
        console.log(data);

        if (
          data.message == "このルームにアクセスする権限がありません" ||
          data.message == "指定されたルームが見つかりません"
        ) {
          router.push("/rooms");
          return;
        }
        setRoom(data);
      } catch (e) {
        console.log(e);
      }
    };

    fetchRoom();

    // ルームの状態をリアルタイム監視
    const interval = setInterval(fetchRoom, 10000); // 3秒ごとにチェック

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

  if (!user) return <Loading message="認証中" />;
  if (room == null) return <Loading message="ルーム情報取得中" />;
  return room.status === "waiting" ? (
    <Loading message="マッチング中" />
  ) : room.status === "pending" && room.hostUserId == user.uid ? (
    <Pending room={room} setRoom={setRoom} />
  ) : room.status === "pending" && room.hostUserId !== user.uid ? (
    <Loading message="参加中" />
  ) : (
    <Battle room={room} />
  );
}

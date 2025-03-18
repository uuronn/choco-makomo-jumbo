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
    const interval = setInterval(fetchRoom, 2000); // 3秒ごとにチェック

    return () => clearInterval(interval);
  }, [roomId, user]);

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

export type Room = {
  id: string;
  hostUserId: string;
  guestUserId: string | null;
  status: string;
};

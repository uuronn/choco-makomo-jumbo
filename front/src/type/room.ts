export type Room = {
  id: string;
  hostUserId: string;
  guestUserId: string | null;
  status: string;
};

export type SelectingRoom = {
  id: string;
  host_user: {
    id: string;
    name: string;
    photoUrl: string;
  };
  guest_user: null | {
    id: string;
    name: string;
    photoUrl: string;
  };
  status: string;
};

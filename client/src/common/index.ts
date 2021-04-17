interface Message {
  type: string;
}

interface Report extends Message {
  fromRoommateId: string;
}

// Server System Messages: Things that the server sends to the client
export interface HandshakeMessage extends Message {
  type: "handshake";
  selfId: string;
}

export type ServerSystemMessage = HandshakeMessage;

// Client System Messages: Things that the client sends to the server
export interface HeartbeatReport extends Report {
  type: "heartbeat";
}

export type ClientSystemMessage = HeartbeatReport;

// Reports: Things that the client broadcasts to other clients
export interface PositionReport extends Report {
  type: "position";
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
}

export interface JoinReport extends Report {
  type: "join";
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
}

export interface LeaveReport extends Report {
  type: "leave";
}

export interface RTCOfferReport extends Report {
  type: "rtcOffer";
  toRoommateId: string;
  offer: any;
}

export enum Hats {
  Nothing = "Nothing",
  Tangie = "Tangie",
  Ears = "Ears",
}
export enum Mouths {
  Circle = "Circle",
  Fuji = "Fuji",
}

export interface DressReport extends Report {
  type: "dress";
  hat: Hats;
  mouth: Mouths;
}

export type RoomReport =
  | JoinReport
  | PositionReport
  | LeaveReport
  | RTCOfferReport
  | DressReport;
export type UpstreamMessage = RoomReport | ClientSystemMessage;
type UnionOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type UpstreamMessageDetails = UnionOmit<
  UpstreamMessage,
  "fromRoommateId"
>;
export type DownstreamMessage = RoomReport | ServerSystemMessage;

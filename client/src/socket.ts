import { usePosition, useRoommatePositions } from "./store";

interface PositionReport {
  type: "position";
  roommateId: string;
  x: number;
  y: number;
}

interface LeaveReport {
  type: "leave";
  roommateId: string;
}

type RoomReport = PositionReport | LeaveReport;

export function setupSocket() {
  // eslint-disable-next-line
  const socket = new WebSocket(`ws://${location.host}/socket`);

  socket.addEventListener("open", () => {
    const currentPosition = usePosition.getState();
    socket.send(JSON.stringify({ x: currentPosition.x, y: currentPosition.y }));
  });

  socket.addEventListener("message", (message) => {
    const report: RoomReport = JSON.parse(message.data);
    if (report.type === "position") {
      useRoommatePositions
        .getState()
        .roommateMove(report.roommateId, report.x, report.y);
    } else if (report.type === "leave") {
      useRoommatePositions.getState().roommateLeave(report.roommateId);
    }
  });

  usePosition.subscribe(({ x, y }) => socket.send(JSON.stringify({ x, y })));
}

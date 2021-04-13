import { usePosition, useRoommatePositions } from "./store";

interface PositionReport {
  type: "position";
  roommateId: string;
  x: number;
  y: number;
  mouseX: number;
  mouseY: number;
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
    socket.send(
      JSON.stringify({
        x: currentPosition.x,
        y: currentPosition.y,
        mouseX: currentPosition.mouseX,
        mouseY: currentPosition.mouseY,
      })
    );
  });

  socket.addEventListener("message", (message) => {
    const report: RoomReport = JSON.parse(message.data);
    if (report.type === "position") {
      useRoommatePositions
        .getState()
        .roommateMove(
          report.roommateId,
          report.x,
          report.y,
          report.mouseX,
          report.mouseY
        );
    } else if (report.type === "leave") {
      useRoommatePositions.getState().roommateLeave(report.roommateId);
    }
  });

  usePosition.subscribe(({ x, y, mouseX, mouseY }) =>
    socket.send(JSON.stringify({ x, y, mouseX, mouseY }))
  );
}

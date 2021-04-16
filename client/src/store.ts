import { types } from "mobx-state-tree";
import { computed } from "mobx";

const Self = types
  .model({
    selfId: types.maybe(types.string),
  })
  .actions((state) => ({
    becomeSelf(selfId: string) {
      state.selfId = selfId;
    },
    loseSelf() {
      state.selfId = undefined;
    },
  }));
export const self = Self.create();

const Position = types
  .model({
    x: 0,
    y: 0,
  })
  .actions((state) => ({
    move(x: number, y: number) {
      state.x = x;
      state.y = y;
    },
  }));
export const selfPosition = Position.create();

const ViewportPosition = types
  .model({
    viewportX: 0,
    viewportY: 0,
  })
  .actions((state) => ({
    move(viewportX: number, viewportY: number) {
      state.viewportX = viewportX;
      state.viewportY = viewportY;
    },
  }));
export const viewportMouse = ViewportPosition.create();

const AudioProperties = types
  .model({
    loudness: 0,
  })
  .actions((state) => ({
    setLoudness(loudness: number) {
      state.loudness = loudness;
    },
  }));

export const selfAudio = AudioProperties.create();

const RoommateStatus = types.model({
  pos: Position,
  mouse: Position,
  audio: AudioProperties,
});

const RoommateStatuses = types
  .model({
    statuses: types.map(RoommateStatus),
  })
  .actions((state) => ({
    roommateMove(
      roommateId: string,
      x: number,
      y: number,
      mouseX: number,
      mouseY: number
    ) {
      if (!state.statuses.has(roommateId)) {
        state.statuses.set(roommateId, {
          pos: Position.create(),
          mouse: Position.create(),
          audio: AudioProperties.create(),
        });
      }

      const roommateStatus = state.statuses.get(roommateId)!;
      roommateStatus.pos.move(x, y);
      roommateStatus.mouse.move(mouseX, mouseY);
    },
    roommateSpeak(roommateId: string, loudness: number) {
      if (!state.statuses.has(roommateId)) {
        state.statuses.set(roommateId, {
          pos: Position.create(),
          mouse: Position.create(),
          audio: AudioProperties.create(),
        });
      }

      const roommateStatus = state.statuses.get(roommateId)!;
      roommateStatus.audio.setLoudness(loudness);
    },
    roommateLeave(roommateId: string) {
      state.statuses.delete(roommateId);
    },
  }));
export const roommateStatuses = RoommateStatuses.create();

const Size = types
  .model({
    width: 0,
    height: 0,
  })
  .actions((state) => ({
    resize(width: number, height: number) {
      state.width = width;
      state.height = height;
    },
  }));
export const room = Size.create({
  width: 2000,
  height: 2000,
});

export const windowSize = Size.create({
  width: window.innerWidth,
  height: window.innerHeight,
});

export const camera = computed(() => {
  const xOff = windowSize.width / 2;
  const yOff = windowSize.height / 2;

  const targetCameraX =
    selfPosition.x - xOff < 0
      ? xOff
      : selfPosition.x + xOff > room.width
      ? room.width - xOff
      : selfPosition.x;

  const targetCameraY =
    selfPosition.y - yOff < 0
      ? yOff
      : selfPosition.y + yOff > room.height
      ? room.height - yOff
      : selfPosition.y;

  return {
    cameraMinX: targetCameraX - xOff,
    cameraMinY: targetCameraY - yOff,
    cameraWidth: windowSize.width,
    cameraHeight: windowSize.height,
  };
});

export const worldMouse = computed(() => {
  const { cameraMinX, cameraMinY } = camera.get();
  return {
    mouseX: cameraMinX + viewportMouse.viewportX,
    mouseY: cameraMinY + viewportMouse.viewportY,
  };
});

export enum Hats {
  Nothing = "Nothing",
  Tangie = "Tangie",
  Ears = "Ears",
}
export enum Mouths {
  Circle = "Circle",
  Fuji = "Fuji",
}

const Dress = types
  .model({
    hat: types.enumeration<Hats>(Object.values(Hats)),
    mouth: types.enumeration<Mouths>(Object.values(Mouths)),
  })
  .actions((state) => ({
    changeHat(hat: typeof state.hat) {
      state.hat = hat;
    },
    changeMouth(mouth: typeof state.mouth) {
      state.mouth = mouth;
    },
  }));
export const selfDress = Dress.create({
  hat: Hats.Nothing,
  mouth: Mouths.Fuji,
});

import create from "zustand";
import { combine } from "zustand/middleware";
import type { State, SetState } from "zustand/vanilla";
import produce from "immer";

function bindDispatch<TState extends State, TProducerArgs extends any[]>(
  set: SetState<TState>,
  producer: (base: TState, ...args: TProducerArgs) => void
) {
  return function (...args: TProducerArgs) {
    set((currentState: TState) =>
      produce(currentState, (draftState: TState) => {
        producer(draftState, ...args);
      })
    );
  };
}

export const useSelf = create(
  combine({ selfId: undefined } as { selfId?: string }, (set) => ({
    becomeSelf: (selfId: string) => set({ selfId }),
    loseSelf: () =>
      bindDispatch(set, (state) => {
        state.selfId = undefined;
      }),
  }))
);

export const usePosition = create(
  combine(
    {
      x: 0,
      y: 0,
      mouseX: 0,
      mouseY: 0,
    },
    (set) => ({
      move: (x: number, y: number) => set({ x, y }),
      moveMouse: bindDispatch(set, (state, mouseX: number, mouseY: number) => {
        state.mouseX = mouseX;
        state.mouseY = mouseY;
      }),
    })
  )
);

export const useRoommatePositions = create(
  combine(
    { positions: {} } as {
      positions: {
        [roommateId: string]: {
          x: number;
          y: number;
          mouseX: number;
          mouseY: number;
        };
      };
    },
    (set) => ({
      roommateMove: bindDispatch(
        set,
        (
          state,
          roommateId: string,
          x: number,
          y: number,
          mouseX: number,
          mouseY: number
        ) => (state.positions[roommateId] = { x, y, mouseX, mouseY })
      ),
      roommateLeave: bindDispatch(set, (state, roommateId: string) => {
        delete state.positions[roommateId];
      }),
    })
  )
);

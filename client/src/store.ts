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

export const usePosition = create(
  combine(
    {
      x: 0,
      y: 0,
    },
    (set) => ({
      move: (x: number, y: number) => set({ x, y }),
    })
  )
);

export const useRoommatePositions = create(
  combine(
    { positions: {} } as {
      positions: { [roommateId: string]: { x: number; y: number } };
    },
    (set) => ({
      roommateMove: bindDispatch(
        set,
        (state, roommateId: string, x: number, y: number) =>
          (state.positions[roommateId] = { x, y })
      ),
      roommateLeave: bindDispatch(set, (state, roommateId: string) => {
        delete state.positions[roommateId];
      }),
    })
  )
);

(window as any).usePosition = usePosition;
(window as any).useRoommatePositions = useRoommatePositions;

import { observer } from "mobx-react-lite";
import { Hats, Mouths, selfDress } from "./store";
import { FPSCounter } from "./FPSCounter";

import styles from "./HUD.module.css";

function advanceSelection<T>(
  options: { [id: string]: T },
  current: T,
  by: 1 | -1
): T {
  const optionKeys = Object.values(options);
  const currentIndex = optionKeys.indexOf(current);
  return optionKeys[(currentIndex + 1) % optionKeys.length];
}

export const HUD = observer(() => {
  return (
    <div className={styles.hudRoot}>
      <FPSCounter />
      <div className={styles.customizers}>
        <div className={styles.customizer}>
          <button
            onClick={() =>
              selfDress.changeHat(advanceSelection(Hats, selfDress.hat, -1))
            }
          >
            {"<"}
          </button>
          <span className={styles.currentOption}>{selfDress.hat}</span>
          <button
            onClick={() =>
              selfDress.changeHat(advanceSelection(Hats, selfDress.hat, 1))
            }
          >
            {">"}
          </button>
        </div>
        <div className={styles.customizer}>
          <button
            onClick={() =>
              selfDress.changeMouth(
                advanceSelection(Mouths, selfDress.mouth, -1)
              )
            }
          >
            {"<"}
          </button>
          <span className={styles.currentOption}>{selfDress.mouth}</span>
          <button
            onClick={() =>
              selfDress.changeMouth(
                advanceSelection(Mouths, selfDress.mouth, 1)
              )
            }
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
});

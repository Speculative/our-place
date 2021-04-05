import { Room } from "./Room";
import { FPSCounter } from "./FPSCounter";
import "./index.css";

function App() {
  return (
    <div className="rootStyles">
      <Room />
      <FPSCounter />
    </div>
  );
}

export default App;

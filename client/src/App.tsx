/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css, Global } from "@emotion/react/macro";

const rootStyles = css`
  width: 100%;
  height: 100%;
  background: #000000;
  color: white;
`;

const globalStyles = css`
  html,
  body,
  #root {
    height: 100vh;
    width: 100vw;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
`;

function App() {
  return (
    <div css={rootStyles}>
      <Global styles={globalStyles} />
      Hi
    </div>
  );
}

export default App;

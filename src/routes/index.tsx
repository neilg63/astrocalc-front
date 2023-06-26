import { Title } from "solid-start";
import ControlPane from "~/components/ControlPane";

export default function Home() {
  return (
    <>
      <Title>Hello World</Title>

    <div class="page-wrapper">
      <header class="page-header">
        <h1 class="compact">AstroCalc</h1>
      </header>
      
      <main>
        <ControlPane />
      </main>
      <footer>
          <p>
        © 2023: Multifaceted Web Services
        </p>
      </footer>
      </div>
    </>
  );
}

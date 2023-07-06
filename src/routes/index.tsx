import { createEffect, createSignal } from "solid-js";
import { Title } from "solid-start";
import ControlPane from "~/components/ControlPane";

export default function Home() {
  const [devBy, setDevBy] = createSignal("Multifaceted Web Services");
  createEffect(() => { 
    if (window instanceof Window) {
      const {hostname} = window.location;
      if (typeof hostname === "string") {
        if (/(findingyou|localhost)/.test(hostname)) {
          setDevBy("FindingYou");
        }
      }
    }

  });
  return (
    <>
      <Title>AstroCalc</Title>
    <div class="page-wrapper">
      <header class="page-header">
        <h1 class="compact">AstroCalc</h1>
      </header>
      
      <main>
        <ControlPane />
      </main>
      <footer>
          <p>
            <span class="copyright-year">© 2023: </span><span class="developed-by">{ devBy() }</span>
        </p>
      </footer>
      </div>
    </>
  );
}

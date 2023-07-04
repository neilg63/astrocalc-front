// @refresh reload
import { Suspense, createEffect, createSignal } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import "uno.css"
import "./root.scss";
import { fromLocal, toLocal } from "./lib/localstore";
import { notEmptyString } from "./api/utils";
import { Button, Icon, IconButton } from "@suid/material";

interface DisplayOpts {
  dark: boolean;
  size: string;
}

export default function Root() {
  const [wrapperClasses, setWrapperClasses] = createSignal("light-mode size-m");
  const extractDisplayOptions = (darkDefault = false): DisplayOpts => {
    const stored = fromLocal("display", 3600);
    const dark = !stored.expired ? stored.data.dark === true : darkDefault;
    const size = !stored.expired && notEmptyString(stored.data.size) ? stored.data.size : "m";
    return { size, dark };
  }
  const applyDisplayClasses = (opts: DisplayOpts): void => {
    const { dark, size } = opts;
    const cls = [dark ? "dark-mode" : "light-mode"];
    cls.push(["size", size].join("-"));
    setWrapperClasses(cls.join(" "));
  }

  const setDisplayClasses = (darkDefault = false) => {
    const opts = extractDisplayOptions(darkDefault);
    applyDisplayClasses(opts)
  }
  const iconToggleType = (wrapperClasses: string) => {
    return wrapperClasses.includes("dark") ? "light_mode" : "dark_mode";
  }

  const toggleLightMode = () => {
    const opts = extractDisplayOptions();
    const dark = opts.dark !== true;
  toLocal('display', { ...opts, dark });
    setDisplayClasses();
  }

  createEffect(() => {
    let applyDarkDefault = false;
    if (window instanceof Window) {
      const mediaPref = window.matchMedia("(prefers-color-scheme:dark)");
      if (mediaPref.matches) {
        applyDarkDefault = true;
      }
    }
    setDisplayClasses(applyDarkDefault);
    
  });
  return (
    <Html lang="en" class={wrapperClasses()}>
      <Head>
        <Title>AstroCalc</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link
      href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
      rel="stylesheet"
        />
        <Link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            <nav class="display-options">
              <IconButton onClick={() => toggleLightMode()}><Icon>{iconToggleType(wrapperClasses())}</Icon></IconButton>
            </nav>
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}

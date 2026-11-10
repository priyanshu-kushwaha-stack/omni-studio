// The one react-dom/server call the kit tests use; the engine has no @types/react-dom and needs no new package for it.
declare module "react-dom/server" {
  import type { ReactElement } from "react";
  export function renderToStaticMarkup(element: ReactElement): string;
}

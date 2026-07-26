"use client";

import type { ReactNode } from "react";
import { rootVars } from "./theme";
import { useDeplyxMotion } from "./useDeplyxMotion";

const ROOT_ID = "deplyx-root";

export function LandingRoot({ children }: { children: ReactNode }) {
  useDeplyxMotion(ROOT_ID);
  return (
    <div id={ROOT_ID} style={rootVars}>
      {children}
    </div>
  );
}

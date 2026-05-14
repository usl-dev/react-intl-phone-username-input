import * as React from "react";
import { useState } from "react";

let counter = 0;

function useIdPolyfill(): string {
  const [id] = useState<string>(() => `:r${(++counter).toString(36)}:`);
  return id;
}

// Resolved once at module load — never called conditionally inside a component.
// On React 18+: React.useId exists → use it (SSR-safe, deterministic).
// On React 17:  React.useId is undefined → fall back to counter-based polyfill.
export const useStableId: () => string =
  typeof (React as { useId?: () => string }).useId === "function"
    ? (React as { useId: () => string }).useId
    : useIdPolyfill;

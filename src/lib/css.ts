import type { CSSProperties } from "react";

export type CssVars<K extends string> = CSSProperties & Record<K, string>;

export function cssVar<K extends string>(key: K, value: string): CssVars<K> {
  return { [key]: value } as CssVars<K>;
}


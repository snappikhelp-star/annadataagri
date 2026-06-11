import { useContext } from "react";
import { LangContext } from "@/contexts/LangContext";
import { t, translations } from "@/lib/i18n";

export function useLang() {
  const ctx = useContext(LangContext);
  return {
    ...ctx,
    t: (key: keyof typeof translations.hi) => t(ctx.lang, key),
  };
}

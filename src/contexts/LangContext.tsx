import { createContext, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  simpleMode: boolean;
  setSimpleMode: (v: boolean) => void;
}

export const LangContext = createContext<LangContextType>({
  lang: "hi", setLang: () => {}, simpleMode: false, setSimpleMode: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem("annadata_lang") as Lang) || "hi"
  );
  const [simpleMode, setSimpleModeState] = useState<boolean>(() =>
    localStorage.getItem("annadata_simple") === "true"
  );

  function setLang(l: Lang) { setLangState(l); localStorage.setItem("annadata_lang", l); }
  function setSimpleMode(v: boolean) { setSimpleModeState(v); localStorage.setItem("annadata_simple", String(v)); }

  return (
    <LangContext.Provider value={{ lang, setLang, simpleMode, setSimpleMode }}>
      {children}
    </LangContext.Provider>
  );
}

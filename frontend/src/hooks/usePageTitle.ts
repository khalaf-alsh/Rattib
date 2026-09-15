import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Keep the browser tab title synchronized with the active page
// and the currently selected application language.
export function usePageTitle(titleKey: string) {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t(titleKey);
  }, [t, titleKey]);
}

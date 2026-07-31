import { useEffect } from "react";

/** Sets `document.title` whenever the given title changes. */
export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

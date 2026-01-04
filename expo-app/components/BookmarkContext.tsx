/**
 * Bookmark Context
 *
 * Provides a way to trigger bookmark list refresh from anywhere in the app.
 */

import { createContext, useCallback, useContext, useState } from "react";

interface BookmarkContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const BookmarkContext = createContext<BookmarkContextType>({
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export function useBookmarks() {
  return useContext(BookmarkContext);
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <BookmarkContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </BookmarkContext.Provider>
  );
}

// components/ReduxProvider.tsx
"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { usePathname } from "next/navigation";
import { store, persistor } from "@/store";

// Public, crawlable routes that must render their content server-side without
// waiting for redux-persist to rehydrate from the browser. Google's privacy
// policy link checker fetches these WITHOUT running JS, so they cannot sit
// behind PersistGate's "Loading..." gate or the page looks empty to the bot.
const PUBLIC_PATHS = ["/privacy-policy", "/terms", "/terms-of-service"];

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(`${p}/`)
  );

  return (
    <Provider store={store}>
      {isPublic ? (
        // No PersistGate: these pages don't use persisted state, so render
        // immediately (and server-side) instead of blocking on rehydration.
        children
      ) : (
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          {children}
        </PersistGate>
      )}
    </Provider>
  );
}
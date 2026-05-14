import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True after hydration on the client. Avoids setState-in-useEffect patterns
 * for "mounted" gates while satisfying the SSR/client boundary.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

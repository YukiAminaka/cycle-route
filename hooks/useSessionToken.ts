import { useState, useCallback } from "react";

/**
 * Generates and manages a unique session token for Mapbox Search API
 * Session tokens are used for billing purposes and should be renewed after each search
 */
export function useSessionToken() {
  const [id, setId] = useState<string>(() => crypto.randomUUID());

  const renew = useCallback(() => {
    setId(crypto.randomUUID());
  }, []);

  return { id, renew };
}

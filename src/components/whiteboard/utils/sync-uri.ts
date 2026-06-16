import { createClient } from "@/utils/supabase/client";

/**
 * Dynamically resolves the sync server URI with the current user session token.
 * E.g., ws://localhost:8787/boards/:boardId?token=JWT
 */
export async function getSyncUri(boardId: string): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token || "";
  const syncServerUrl = process.env.NEXT_PUBLIC_SYNC_SERVER_URL;
  let urlString = "";

  if (syncServerUrl) {
    let cleanUrl = syncServerUrl.endsWith("/")
      ? syncServerUrl.slice(0, -1)
      : syncServerUrl;

    // Convert http/https protocols to ws/wss protocols
    if (cleanUrl.startsWith("https://")) {
      cleanUrl = cleanUrl.replace("https://", "wss://");
    } else if (cleanUrl.startsWith("http://")) {
      cleanUrl = cleanUrl.replace("http://", "ws://");
    }

    if (cleanUrl.startsWith("ws://") || cleanUrl.startsWith("wss://")) {
      urlString = `${cleanUrl}/boards/${boardId}?token=${token}`;
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      urlString = `${protocol}//${cleanUrl}/boards/${boardId}?token=${token}`;
    }
  } else {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Fall back to port 8787 locally
    const host =
      window.location.hostname === "localhost"
        ? "localhost:8787"
        : `${window.location.hostname}:8787`;

    urlString = `${protocol}//${host}/boards/${boardId}?token=${token}`;
  }

  return urlString;
}

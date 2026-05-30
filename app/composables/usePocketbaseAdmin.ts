import PocketBase from "pocketbase";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export const usePocketbaseAdmin = () => {
  const config = useRuntimeConfig();
  const { pb } = usePocketbase();

  const baseUrl = pb.baseUrl.endsWith("/")
    ? pb.baseUrl.slice(0, -1)
    : pb.baseUrl;

  const getAdminToken = async (): Promise<string> => {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    const adminPb = new PocketBase(pb.baseUrl);
    const auth = await adminPb
      .collection("_superusers")
      .authWithPassword(
        config.public.pocketbaseAdminEmail as string,
        config.public.pocketbaseAdminPassword as string,
      );

    cachedToken = auth.token;
    tokenExpiresAt = Date.now() + 55 * 60 * 1000;
    return cachedToken;
  };

  const adminFetchRaw = async (
    path: string,
    options?: RequestInit,
  ): Promise<Response> => {
    const token = await getAdminToken();
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
  };

  const adminFetch = async <T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> => {
    const res = await adminFetchRaw(path, options);
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Admin API ${res.status}: ${text}`);
    }
    return (text ? JSON.parse(text) : undefined) as T;
  };

  return { adminFetch, adminFetchRaw, baseUrl };
};

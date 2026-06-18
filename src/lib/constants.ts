export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  WORKSPACES: "/workspaces",
  BOARD: "/board",
  AUTH_CALLBACK: "/auth/callback",
  SETTINGS: "/settings",
} as const;

export const ASSETS = {
  LOGO: "/logo.webp",
} as const;

export const DEFAULT_REDIRECTS = {
  AFTER_LOGIN: ROUTES.WORKSPACES,
  AFTER_SIGNUP: ROUTES.HOME,
  AUTH_FALLBACK: ROUTES.LOGIN,
} as const;

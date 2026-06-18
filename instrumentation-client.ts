import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host:
    process.env.NODE_ENV === "development"
      ? "https://us.i.posthog.com"
      : "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: false,
  capture_pageview: true,
  capture_pageleave: true,
  debug: false,
  autocapture: false,
  disable_session_recording: true,
  disable_surveys: true,
});

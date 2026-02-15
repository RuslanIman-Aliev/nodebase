import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://3448ec32f643dad75a66f5065ef19985@o4510795371839488.ingest.de.sentry.io/4510801936842832",
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,

  replaysOnErrorSampleRate: 1.0,
  
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

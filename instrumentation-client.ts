// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://bc93467ad1c7f96297e1a2e0e62c5307@o4509294838415360.ingest.us.sentry.io/4509295513829381',

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  
  sendDefaultPii: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  environment: process.env.NODE_ENV,

  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

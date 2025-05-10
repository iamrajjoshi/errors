// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://bc93467ad1c7f96297e1a2e0e62c5307@o4509294838415360.ingest.us.sentry.io/4509295513829381',

  tracesSampleRate: 1,
  sendDefaultPii: true,
  
  environment: process.env.NODE_ENV,
  
  debug: false,
});

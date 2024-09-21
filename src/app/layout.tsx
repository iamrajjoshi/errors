'use client';

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <title>Sentry Error Generator</title>
        <meta name="description" content="Generate and send test errors to your Sentry project" />
      </head>
      <body>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </body>
    </html>
  );
};

export default RootLayout;

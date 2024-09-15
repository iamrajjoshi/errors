import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import ErrorGenerator from './ErrorGenerator';

const SentryPage = () => {
  return (
    <Box minHeight="100vh" bg="background.dark" color="white">
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center">
            Sentry Error Generator
          </Heading>
          <Text fontSize="xl" textAlign="center">
            Generate and send test errors to your Sentry project
          </Text>
          <ErrorGenerator />
        </VStack>
      </Container>
    </Box>
  );
};

export default SentryPage;
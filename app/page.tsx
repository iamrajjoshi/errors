import React from 'react';
import { Box, Container, Heading, Text, VStack, Link, HStack } from '@chakra-ui/react';
import ErrorGenerator from './ErrorGenerator';

const SentryPage = () => {
    return (
        <Box
            minHeight="100vh"
            bg="background.dark"
            color="white"
            display="flex"
            flexDirection="column"
        >
            <Container maxW="container.md" py={10} flex="1">
                <VStack spacing={8} align="stretch">
                    <Heading as="h1" size="2xl" textAlign="center">
                        Sentry Error Generator
                    </Heading>
                    <Text fontSize="xl" textAlign="center">
                        Generate and send sample errors to your Sentry project.
                    </Text>
                    <ErrorGenerator />
                </VStack>
            </Container>

            <Box as="footer" py={6} mt="auto">
                <Container maxW="container.md">
                    <HStack justify="center">
                        <Text fontSize="xs" color="gray.500">
                            Commit:{' '}
                            <Link
                                href={`https://github.com/iamrajjoshi/errors/commit/${process.env.COMMIT_HASH}`}
                                isExternal
                                color="gray.300"
                                _hover={{ color: 'gray.200', textDecoration: 'underline' }}
                                fontFamily="mono"
                            >
                                {process.env.COMMIT_HASH || 'unknown'}
                            </Link>
                        </Text>
                    </HStack>
                </Container>
            </Box>
        </Box>
    );
};

export default SentryPage;

'use client';

import React, { useState, useRef } from 'react';
import { 
  Button, 
  Input, 
  VStack, 
  Text, 
  useToast, 
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
} from '@chakra-ui/react';
import * as Sentry from '@sentry/browser';

const ErrorGenerator = () => {
  const [dsn, setDsn] = useState('');
  const [errorCount, setErrorCount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dsnError, setDsnError] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const validateDsn = (value: string) => {
    if (!value) {
      setDsnError('DSN is required');
      return false;
    }
    if (!/^https:\/\/[a-zA-Z0-9]+@[a-zA-Z0-9]+\.ingest\.(us|de)\.sentry\.io\/[0-9]+$/.test(value)) {
      setDsnError('Invalid DSN format');
      return false;
    }
    setDsnError('');
    return true;
  };

  const handleDsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDsn(value);
    validateDsn(value);
  };

  const generateErrors = () => {
    if (!validateDsn(dsn)) return;

    const count = parseInt(errorCount, 10);
    if (isNaN(count) || count <= 0) {
      toast({
        title: 'Invalid error count',
        description: 'Please enter a positive number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Initialize Sentry with the user-provided DSN
    Sentry.init({
      dsn: dsn,
      release: "error-generator@1.0.0",
      environment: "test",
    });

    for (let i = 0; i < count; i++) {
      try {
        // Intentionally cause a ReferenceError
        nonExistentFunction();
      } catch (error) {
        if (error instanceof Error) {
          // Enhance the error with a custom stack trace
          error.stack = `ReferenceError: nonExistentFunction is not defined
    at SentryErrorGenerator.generateErrors (/src/components/SentryErrorGenerator.tsx:50:13)
    at HTMLUnknownElement.callCallback (/src/react-dom.development.js:3945:14)
    at Object.invokeGuardedCallbackDev (/src/react-dom.development.js:3994:16)
    at invokeGuardedCallback (/src/react-dom.development.js:4056:31)
    at HTMLUnknownElement.invokeEventListeners (/src/react-dom.development.js:5007:7)`;

          Sentry.captureException(error, {
            tags: { error_generator: "v1.0" },
            extra: {
              errorIndex: i,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              randomValue: Math.random()
            },
            user: {
              id: `test-user-${Math.floor(Math.random() * 1000)}`,
              email: `user${Math.floor(Math.random() * 1000)}@example.com`,
              username: `testuser${Math.floor(Math.random() * 1000)}`,
            },
          });
        }
      }
    }

    toast({
      title: 'Errors sent',
      description: `${count} ReferenceErrors have been sent to Sentry`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const onClose = () => setIsOpen(false);
  const onConfirm = () => {
    onClose();
    generateErrors();
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isInvalid={!!dsnError}>
        <FormLabel>Sentry DSN</FormLabel>
        <Input
          placeholder="Enter Sentry DSN"
          value={dsn}
          onChange={handleDsnChange}
        />
        <FormErrorMessage>{dsnError}</FormErrorMessage>
      </FormControl>
      <FormControl>
        <FormLabel>Number of Errors to Generate</FormLabel>
        <NumberInput min={1} value={errorCount} onChange={(value) => setErrorCount(value)}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <Box textAlign="right">
        <Button onClick={() => setIsOpen(true)} colorScheme="brand" width="auto">
          Generate Errors
        </Button>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Generate Errors
            </AlertDialogHeader>

            <AlertDialogBody>
              Warning: This action will generate real errors and use up your Sentry quota. 
              This may result in additional costs depending on your Sentry plan. 
              Are you sure you want to proceed?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onConfirm} ml={3}>
                Generate Errors
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default ErrorGenerator;
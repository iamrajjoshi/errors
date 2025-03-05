'use client';

import React, { useState, useRef } from 'react';
import {
  Button,
  Input,
  VStack,
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

import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/browser';
import { CaptureContext, User } from '@sentry/types';

const ErrorGenerator = () => {
  const [dsn, setDsn] = useState('');
  const [errorCount, setErrorCount] = useState('');
  const [errorsToGenerate, setErrorsToGenerate] = useState('1');
  const [fingerprintID, setFingerprintID] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dsnError, setDsnError] = useState('');
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const validateDsn = (value: string): boolean => {
    if (!value) {
      setDsnError('DSN is required');
      return false;
    }
    const dsnRegex =
      /^https:\/\/[a-zA-Z0-9]+@([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\/[0-9]+$/;
    if (!dsnRegex.test(value)) {
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

    const eventsPerError = parseInt(errorCount, 10);
    const numErrors = fingerprintID ? 1 : parseInt(errorsToGenerate, 10);

    if (isNaN(eventsPerError) || eventsPerError <= 0) {
      toast({
        title: 'Invalid event count',
        description: 'Please enter a positive number for events per error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!fingerprintID && (isNaN(numErrors) || numErrors <= 0)) {
      toast({
        title: 'Invalid error count',
        description: 'Please enter a positive number for number of errors',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    Sentry.init({
      dsn: dsn,
      environment: 'test',
    });

    for (let errorIndex = 0; errorIndex < numErrors; errorIndex++) {
      const errorFingerprint = fingerprintID ? [fingerprintID] : [uuidv4()];

      for (let eventIndex = 0; eventIndex < eventsPerError; eventIndex++) {
        const event_id = uuidv4();
        const user: User = {
          id: `test-user-${errorIndex}-${eventIndex}`,
          email: `test-user-${errorIndex}-${eventIndex}@example.com`,
          username: `testuser${errorIndex}-${eventIndex}`,
        };

        const captureContext: CaptureContext = {
          user,
          fingerprint: errorFingerprint,
          level: 'error',
        };

        Sentry.captureMessage(`Error generated with event_id: ${event_id}`, captureContext);
      }
    }

    Sentry.flush(20000).then(() => {
      toast({
        title: 'Errors sent',
        description: `${numErrors} errors with ${eventsPerError} events each have been sent to Sentry`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
        <Input placeholder="Enter Sentry DSN" value={dsn} onChange={handleDsnChange} />
        <FormErrorMessage>{dsnError}</FormErrorMessage>
      </FormControl>
      <FormControl>
        <FormLabel>Fingerprint ID (Optional - to add events to a specific issue)</FormLabel>
        <Input
          placeholder="Enter a fingerprint ID to group errors"
          value={fingerprintID}
          onChange={(e) => setFingerprintID(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Number of Events per Error</FormLabel>
        <NumberInput min={1} value={errorCount} onChange={(value) => setErrorCount(value)}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      {!fingerprintID && (
        <FormControl>
          <FormLabel>Number of Errors to Generate</FormLabel>
          <NumberInput
            min={1}
            value={errorsToGenerate}
            onChange={(value) => setErrorsToGenerate(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      )}
      <Box textAlign="right">
        <Button onClick={() => setIsOpen(true)} colorScheme="brand" width="auto">
          Generate Errors
        </Button>
      </Box>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Generate Errors
            </AlertDialogHeader>
            <AlertDialogBody>
              Warning: This action will generate real errors and use up your Sentry quota. This may
              result in additional costs depending on your Sentry plan. Are you sure you want to
              proceed?
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

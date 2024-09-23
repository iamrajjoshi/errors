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

    Sentry.init({
      dsn: dsn,
      environment: 'test',
    });

    const fingerprint = [uuidv4()];

    for (let i = 0; i < count; i++) {
      const event_id = uuidv4();
      const user: User = {
        id: `test-user-${i}`,
        email: `test-user-${i}@example.com`,
        username: `testuser${i}`,
      };

      const captureContext: CaptureContext = {
        user,
        fingerprint,
        level: 'error',
      };

      Sentry.captureMessage(`Error generated with event_id: ${event_id}`, captureContext);
    }

    Sentry.flush(20000).then(() => {
      toast({
        title: 'Errors sent',
        description: `${count} errors have been sent to Sentry`,
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
        <FormLabel>Number of Events to Generate</FormLabel>
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

'use client';

import React, { useState, useRef } from 'react';
import {
    Button,
    Input,
    VStack,
    HStack,
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
    Tag,
    TagLabel,
    TagCloseButton,
    Flex,
    IconButton,
    Divider,
    Select,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';

interface CustomTag {
    key: string;
    value: string;
}

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

const ErrorGenerator = () => {
    const [dsn, setDsn] = useState('');
    const [errorCount, setErrorCount] = useState('1');
    const [errorsToGenerate, setErrorsToGenerate] = useState('1');
    const [fingerprintID, setFingerprintID] = useState('');
    const [priority, setPriority] = useState<Priority>('HIGH');
    const [tags, setTags] = useState<CustomTag[]>([]);
    const [newTagKey, setNewTagKey] = useState('');
    const [newTagValue, setNewTagValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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

    const addTag = () => {
        if (!newTagKey.trim() || !newTagValue.trim()) {
            toast({
                title: 'Invalid tag',
                description: 'Both key and value are required for tags',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Check if key already exists
        if (tags.some((tag) => tag.key === newTagKey.trim())) {
            toast({
                title: 'Duplicate tag key',
                description: 'A tag with this key already exists',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setTags([...tags, { key: newTagKey.trim(), value: newTagValue.trim() }]);
        setNewTagKey('');
        setNewTagValue('');
    };

    const removeTag = (keyToRemove: string) => {
        setTags(tags.filter((tag) => tag.key !== keyToRemove));
    };

    const generateErrors = async () => {
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

        setIsLoading(true);

        try {
            const response = await fetch('/api/generate-errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dsn,
                    errorCount: eventsPerError,
                    errorsToGenerate: numErrors,
                    fingerprintID,
                    priority,
                    tags: tags.reduce((acc, tag) => ({ ...acc, [tag.key]: tag.value }), {}),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate errors');
            }

            toast({
                title: 'Errors sent',
                description:
                    data.message ||
                    `${numErrors} errors with ${eventsPerError} events each have been sent to Sentry`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to generate errors',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
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
                <Input placeholder="Enter your Sentry DSN" value={dsn} onChange={handleDsnChange} />
                <FormErrorMessage>{dsnError}</FormErrorMessage>
            </FormControl>
            <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </Select>
            </FormControl>
            <FormControl>
                <FormLabel>Fingerprint (Optional)</FormLabel>
                <Input
                    placeholder="Enter a fingerprint to group errors"
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

            <Divider />

            <FormControl>
                <FormLabel>Custom Tags (Optional)</FormLabel>
                <VStack align="stretch" spacing={3}>
                    <HStack>
                        <Input
                            placeholder="Tag key"
                            value={newTagKey}
                            onChange={(e) => setNewTagKey(e.target.value)}
                            flex={1}
                        />
                        <Input
                            placeholder="Tag value"
                            value={newTagValue}
                            onChange={(e) => setNewTagValue(e.target.value)}
                            flex={1}
                        />
                        <IconButton
                            aria-label="Add tag"
                            icon={<FaPlus />}
                            onClick={addTag}
                            colorScheme="green"
                            size="md"
                        />
                    </HStack>

                    {tags.length > 0 && (
                        <Flex wrap="wrap" gap={2}>
                            {tags.map((tag) => (
                                <Tag key={tag.key} size="md" variant="solid" colorScheme="blue">
                                    <TagLabel>
                                        {tag.key}: {tag.value}
                                    </TagLabel>
                                    <TagCloseButton onClick={() => removeTag(tag.key)} />
                                </Tag>
                            ))}
                        </Flex>
                    )}
                </VStack>
            </FormControl>

            <Box textAlign="right">
                <Button
                    onClick={() => setIsOpen(true)}
                    colorScheme="brand"
                    width="auto"
                    isLoading={isLoading}
                    loadingText="Generating..."
                >
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
                            Warning: This action will generate real errors and use up your Sentry
                            quota. This may result in additional costs depending on your Sentry
                            plan. Are you sure you want to proceed?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={onConfirm}
                                ml={3}
                                isLoading={isLoading}
                            >
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

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const runtime = 'edge';

interface GenerateErrorsRequest {
    dsn: string;
    errorCount?: number;
    errorsToGenerate?: number;
    fingerprintID?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    tags?: Record<string, string>;
}

export async function POST(request: NextRequest) {
    try {
        const requestData = (await request.json()) as GenerateErrorsRequest;

        const {
            dsn,
            errorCount = 1,
            errorsToGenerate = 1,
            fingerprintID,
            priority = 'HIGH',
            tags = {},
        } = requestData;

        if (!dsn) {
            return NextResponse.json({ error: 'DSN is required' }, { status: 400 });
        }

        // Map priority to Sentry levels
        const getSentryLevel = (priority: string): string => {
            switch (priority) {
                case 'HIGH':
                    return 'fatal';
                case 'MEDIUM':
                    return 'warning';
                case 'LOW':
                    return 'info';
                default:
                    return 'error';
            }
        };

        // Parse DSN to get Sentry project API endpoint
        let publicKey: string;
        let host: string;
        let projectId: string;

        try {
            // Expected format: https://{public_key}@{host}/{project_id}
            const dsnParts = dsn.split('@');
            if (dsnParts.length !== 2) {
                return NextResponse.json({ error: 'Invalid DSN format' }, { status: 400 });
            }

            publicKey = dsnParts[0].split('://')[1];
            const hostProject = dsnParts[1].split('/');
            if (hostProject.length < 2) {
                return NextResponse.json({ error: 'Invalid DSN format' }, { status: 400 });
            }

            host = hostProject[0];
            projectId = hostProject[1];
        } catch (e) {
            Sentry.captureException(e);
            if (e instanceof Error) {
                return NextResponse.json(
                    { error: `Invalid DSN format: ${e.message}` },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: 'Invalid DSN format' }, { status: 400 });
        }

        const results = [];
        const numErrors = fingerprintID ? 1 : errorsToGenerate;

        for (let errorIndex = 0; errorIndex < numErrors; errorIndex++) {
            const errorFingerprint = fingerprintID ? [fingerprintID] : [crypto.randomUUID()];

            for (let eventIndex = 0; eventIndex < errorCount; eventIndex++) {
                const eventId = crypto.randomUUID();

                // Merge default tags with custom tags, allowing custom tags to override defaults
                const defaultTags = {
                    generated_by: 'vercel-edge-function',
                    environment: 'test',
                };

                const mergedTags = {
                    ...defaultTags,
                    ...tags, // Custom tags will override defaults (including environment)
                };

                // Create a Sentry event payload
                const eventPayload = {
                    event_id: eventId,
                    timestamp: new Date().toISOString(),
                    platform: 'javascript',
                    level: getSentryLevel(priority),
                    logger: 'edge-function',
                    transaction: `test-transaction-${errorIndex}-${eventIndex}`,
                    server_name: 'vercel-edge-function',
                    fingerprint: errorFingerprint,
                    message: `Error generated with event_id: ${eventId} (Priority: ${priority})`,
                    user: {
                        id: `test-user-${errorIndex}-${eventIndex}`,
                        email: `test-user-${errorIndex}-${eventIndex}@example.com`,
                        username: `testuser${errorIndex}-${eventIndex}`,
                    },
                    tags: mergedTags,
                };

                try {
                    const sentryStoreUrl = `https://${host}/api/${projectId}/store/`;
                    const headers = {
                        'Content-Type': 'application/json',
                        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=edge-function/1.0, sentry_key=${publicKey}`,
                    };

                    const response = await fetch(sentryStoreUrl, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(eventPayload),
                    });

                    if (response.ok) {
                        results.push({ event_id: eventId, status: 'sent' });
                    } else {
                        const responseText = await response.text();
                        results.push({
                            event_id: eventId,
                            status: 'failed',
                            response: responseText,
                        });
                    }
                } catch (e) {
                    if (e instanceof Error) {
                        Sentry.captureException(e);
                        results.push({ event_id: eventId, status: 'failed', error: e.message });
                    } else {
                        Sentry.captureException(e);
                        results.push({ event_id: eventId, status: 'failed', error: String(e) });
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${numErrors} errors with ${errorCount} events each (Priority: ${priority})`,
            results: results,
        });
    } catch (e) {
        Sentry.captureException(e);
        if (e instanceof Error) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

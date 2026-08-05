import { Actor } from 'apify';
import { initializeApp, getApps, getApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const SECRET_FIELDS = ['token', 'key', 'secret', 'password', 'serviceaccount', 'credential', 'auth'];

function formatError(error: unknown): string {
    return error instanceof Error ? error.message : JSON.stringify(error);
}

function sanitizeInput(input: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(input).map(([k, v]) => {
            const isSecret = SECRET_FIELDS.some((f) => k.toLowerCase().includes(f));
            return [k, isSecret ? '[REDACTED]' : v];
        }),
    );
}

function sanitizeForFirestore(value: unknown): unknown {
    if (value === undefined) return null;
    if (value === null) return null;
    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value.map((item) => sanitizeForFirestore(item));
    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeForFirestore(v)]),
        );
    }
    return value;
}

export class ActorTelemetry {
    private startedAt = new Date();
    private input: Record<string, unknown>;
    private outputCount = 0;
    private outputSamples: unknown[] = [];

    constructor(input: Record<string, unknown> | null) {
        this.input = input ?? {};
        this.patchPushData();
    }

    private patchPushData(): void {
        const original = Actor.pushData.bind(Actor) as (items: unknown, eventName?: string) => Promise<unknown>;
        const actorWithPatchablePushData = Actor as unknown as {
            pushData: (...args: unknown[]) => Promise<unknown>;
        };
        actorWithPatchablePushData.pushData = async (...args: unknown[]) => {
            const items = args[0];
            const arr = Array.isArray(items) ? items as unknown[] : [items];
            this.outputCount += arr.length;
            if (this.outputSamples.length < 2) {
                this.outputSamples.push(...arr.slice(0, 2 - this.outputSamples.length));
            }
            return typeof args[1] === 'string' ? original(items, args[1]) : original(items);
        };
    }

    async exitActor(error?: unknown): Promise<void> {
        try {
            await this.flush(error);
        } catch (telemetryError) {
            console.warn('[telemetry] flush failed:', telemetryError);
        }

        if (error) {
            await Actor.fail(formatError(error));
            return;
        }

        await Actor.exit();
    }

    private async flush(error?: unknown): Promise<void> {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const serviceAccountB64 = process.env.TELEMETRY_SERVICE_ACCOUNT ?? process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!projectId || !serviceAccountB64) return;

        const runId = process.env.APIFY_ACTOR_RUN_ID ?? `local-${Date.now()}`;
        const actorId = process.env.APIFY_ACTOR_ID ?? 'unknown';
        const actorName = process.env.TELEMETRY_ACTOR_NAME ?? 'hypebridge-brand-fit';

        const completedAt = new Date();
        let status: 'success' | 'empty' | 'error';
        if (error) {
            status = 'error';
        } else if (this.outputCount === 0) {
            status = 'empty';
        } else {
            status = 'success';
        }

        const doc = {
            actorId,
            runId,
            actorName,
            input: sanitizeForFirestore(sanitizeInput(this.input)),
            outputCount: this.outputCount,
            outputSamples: sanitizeForFirestore(this.outputSamples),
            status,
            errorMessage: error ? formatError(error) : null,
            startedAt: this.startedAt,
            completedAt,
            durationMs: completedAt.getTime() - this.startedAt.getTime(),
        };

        if (!getApps().find((a) => a.name === 'telemetry')) {
            const serviceAccount = JSON.parse(
                Buffer.from(serviceAccountB64, 'base64').toString('utf-8'),
            ) as ServiceAccount;
            initializeApp({ credential: cert(serviceAccount), projectId }, 'telemetry');
        }

        const db = getFirestore(getApp('telemetry'));
        try {
            await db.collection('actor_telemetry').doc(runId).set(doc);
        } catch (fsError) {
            console.warn('[telemetry] Firestore write failed, telemetry lost for this run:', fsError);
        }
    }
}

import 'dotenv/config';
import { Actor, log } from 'apify';
import { BrandFitClient } from './brand-fit-client.js';
import { EvaluationClient } from './eval-client.js';
import { FirebaseListener } from './firebase-listener.js';
import { ActorTelemetry } from './telemetry.js';
import { ActorInput } from './types.js';
import { validateActorInput, validateEnvVars, formatError } from './utils.js';

await Actor.init();

const rawInput = await Actor.getInput<ActorInput>();
const telemetry = new ActorTelemetry(rawInput as Record<string, unknown> | null);
let runError: unknown;

try {
    // Step 1: Environment Variables Validation
    validateEnvVars([
        'HYPEBRIDGE_BACKEND_URL',
        'HYPEBRIDGE_APIFY_AUTH_KEY',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_SERVICE_ACCOUNT',
    ]);

    // Step 2: Client-side Input Validation
    const input = validateActorInput(rawInput);

    log.info('Starting HypeBridge Brand Fit Analysis with input:', {
        brandName: input.brandName,
        criteriaLength: input.criteria.length,
        evaluationId: input.evaluationId || '[Will generate via handle]',
        influencerHandle: input.influencerHandle || '[Using existing evaluationId]',
        platform: input.platform,
    });

    const backendUrl = process.env.HYPEBRIDGE_BACKEND_URL!;
    const serviceKey = process.env.HYPEBRIDGE_APIFY_AUTH_KEY!;
    const projectId = process.env.FIREBASE_PROJECT_ID!;
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT!;

    const brandFitClient = new BrandFitClient({ backendUrl, serviceKey });
    const firebaseListener = new FirebaseListener({ projectId, serviceAccount });

    let finalEvalId = input.evaluationId;

    // Step 3: If evaluationId not provided, trigger influencer evaluation endpoint directly
    if (!finalEvalId) {
        log.info(`No evaluationId provided. Triggering influencer evaluation for handle '@${input.influencerHandle}'...`);
        const evalClient = new EvaluationClient({ backendUrl, serviceKey });
        const evalStartResp = await evalClient.startEvaluation({
            influencerHandle: input.influencerHandle!,
            platform: input.platform,
        });

        log.info(`Influencer evaluation request accepted. evaluationId = ${evalStartResp.evaluationId}. Waiting for completion...`);

        const evalListenerResult = await firebaseListener.waitForEvaluationCompletion(
            evalStartResp.evaluationId,
            {
                timeout: 600000, // 10 minutes
                onProgress: (progress) => {
                    log.info(`Influencer evaluation progress: ${progress.status}`, { message: progress.message });
                },
            },
        );

        if (evalListenerResult.status === 'failed') {
            throw new Error(`Influencer evaluation failed: ${evalListenerResult.errorMessage}`);
        }

        finalEvalId = evalStartResp.evaluationId;
        log.info(`Influencer evaluation completed successfully. evaluationId = ${finalEvalId}`);
    } else {
        // Step 4: Pre-flight check on existing evaluation document
        log.info(`Performing pre-flight verification on evaluationId: '${finalEvalId}'...`);
        await firebaseListener.preflightCheckEvaluation(finalEvalId);
        log.info(`Pre-flight check passed for evaluationId: '${finalEvalId}'. Status is 'completed'.`);
    }

    // Step 5: Start Brand Fit Evaluation
    log.info(`Requesting brand fit evaluation from backend (/api/influencer/brand-fit) for evaluationId: '${finalEvalId}'...`);
    const brandFitStartResp = await brandFitClient.startBrandFit({
        evaluationId: finalEvalId,
        brandName: input.brandName,
        criteria: input.criteria,
    });

    log.info(`Brand fit request accepted. brandFitId = ${brandFitStartResp.brandFitId}. Listening for Firestore completion...`);

    // Step 6: Listen for Brand Fit Completion
    const brandFitResult = await firebaseListener.waitForBrandFitCompletion(
        brandFitStartResp.brandFitId,
        finalEvalId,
        {
            timeout: 600000, // 10 minutes max timeout
            onProgress: (progress) => {
                log.info(`Brand fit progress: ${progress.status}`, { message: progress.message });
            },
        },
    );

    if (brandFitResult.status === 'failed' || !brandFitResult.data) {
        throw new Error(`Brand fit evaluation failed: ${brandFitResult.errorMessage}`);
    }

    log.info(`Brand fit evaluation completed successfully in ${brandFitResult.data.processingTimeSecs}s!`, {
        brandFitId: brandFitResult.data.brandFitId,
        fitScore: brandFitResult.data.fitScore,
        summary: brandFitResult.data.summary,
    });

    // Step 7: Pay-Per-Event (PPE) Charge & Push Data
    try {
        await Actor.charge({ eventName: 'brand-fit-analysis' });
        log.info('Charged Pay-Per-Event for brand-fit-analysis.');
    } catch (chargeErr) {
        log.warning(`PPE charge skipped or not configured: ${formatError(chargeErr)}`);
    }

    await Actor.pushData(brandFitResult.data);
    log.info('Brand fit analysis pushed to dataset.');

} catch (error) {
    runError = error;
    log.error('Actor execution failed:', { error: formatError(error) });
    throw error;
} finally {
    await telemetry.exitActor(runError);
}

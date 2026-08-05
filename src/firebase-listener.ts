import { initializeApp, cert, ServiceAccount, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { BrandFitResult, CriterionEvaluation, FirebaseListenerResult, ProgressUpdate } from './types.js';
import { computeSummaryAndFitScore } from './utils.js';

export class FirebaseListener {
    private db: Firestore;
    private unsubscribe?: () => void;

    constructor(config: { projectId: string; serviceAccount: string }) {
        const serviceAccount = JSON.parse(
            Buffer.from(config.serviceAccount, 'base64').toString('utf-8'),
        ) as ServiceAccount;

        let app = getApps().find((a) => a.name === 'brand-fit-firebase');
        if (!app) {
            app = initializeApp({
                credential: cert(serviceAccount),
                projectId: config.projectId,
            }, 'brand-fit-firebase');
        }

        this.db = getFirestore(app);
    }

    /**
     * Pre-flight verification check on an existing evaluation ID.
     * Ensures document exists and status === 'completed'.
     */
    async preflightCheckEvaluation(evaluationId: string): Promise<void> {
        const docRef = this.db.collection('influencer_evaluations').doc(evaluationId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            throw new Error(`Pre-flight check failed: Evaluation document '${evaluationId}' not found in Firestore collection 'influencer_evaluations'.`);
        }

        const data = snapshot.data();
        const status = data?.status;

        if (status !== 'completed') {
            throw new Error(`Pre-flight check failed: Evaluation '${evaluationId}' has status '${status}' (expected 'completed').`);
        }
    }

    /**
     * Waits for an influencer evaluation doc to complete (when starting evaluation from handle)
     */
    async waitForEvaluationCompletion(
        evaluationId: string,
        options: {
            timeout: number;
            onProgress?: (progress: ProgressUpdate) => void;
        },
    ): Promise<FirebaseListenerResult<string>> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.cleanup();
                reject(new Error(`Timeout waiting for influencer evaluation doc '${evaluationId}' after ${options.timeout / 1000}s`));
            }, options.timeout);

            this.unsubscribe = this.db
                .collection('influencer_evaluations')
                .doc(evaluationId)
                .onSnapshot(
                    (snapshot) => {
                        if (!snapshot.exists) return;
                        const data = snapshot.data()!;

                        if (options.onProgress && data.status !== 'completed' && data.status !== 'failed') {
                            options.onProgress({ status: data.status, message: data.message });
                        }

                        if (data.status === 'completed') {
                            clearTimeout(timeoutId);
                            this.cleanup();
                            resolve({ status: 'completed', data: evaluationId });
                        } else if (data.status === 'failed') {
                            clearTimeout(timeoutId);
                            this.cleanup();
                            const errorInfo = data.error || {};
                            resolve({
                                status: 'failed',
                                errorMessage: errorInfo.message || data.message || 'Influencer evaluation failed',
                                httpStatus: errorInfo.httpStatus,
                            });
                        }
                    },
                    (error) => {
                        clearTimeout(timeoutId);
                        this.cleanup();
                        reject(new Error(`Firebase listener error for evaluation '${evaluationId}': ${error.message}`));
                    },
                );
        });
    }

    /**
     * Waits for brand fit evaluation to complete in Firestore collection brand_fit_evaluations
     */
    async waitForBrandFitCompletion(
        brandFitId: string,
        evaluationId: string,
        options: {
            timeout: number;
            onProgress?: (progress: ProgressUpdate) => void;
        },
    ): Promise<FirebaseListenerResult<BrandFitResult>> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.cleanup();
                reject(new Error(`Timeout waiting for brand fit evaluation doc '${brandFitId}' (evaluationId: ${evaluationId}) after ${options.timeout / 1000}s`));
            }, options.timeout);

            this.unsubscribe = this.db
                .collection('brand_fit_evaluations')
                .doc(brandFitId)
                .onSnapshot(
                    (snapshot) => {
                        if (!snapshot.exists) return;

                        const data = snapshot.data()!;

                        if (options.onProgress && data.status !== 'completed' && data.status !== 'failed') {
                            options.onProgress({ status: data.status, message: data.message });
                        }

                        if (data.status === 'completed') {
                            clearTimeout(timeoutId);
                            this.cleanup();

                            const evaluationArray: CriterionEvaluation[] = (data.evaluation || []).map((e: any) => ({
                                criterion: e.criterion || '',
                                fitLevel: e.fitLevel || 'unknown',
                                reasoning: e.reasoning || '',
                            }));

                            const { summary, fitScore } = computeSummaryAndFitScore(evaluationArray);

                            const result: BrandFitResult = {
                                brandFitId: data.brandFitId || brandFitId,
                                evaluationId: data.evaluationId || evaluationId,
                                influencerId: data.influencerId || '',
                                handle: data.handle || '',
                                platform: data.platform || 'instagram',
                                brandName: data.brandName || '',
                                evaluation: evaluationArray,
                                summary,
                                fitScore,
                                processingTimeSecs: data.processingTimeSecs || 0,
                                updatedAt: data.updatedAt ? new Date().toISOString() : new Date().toISOString(),
                            };

                            resolve({
                                status: 'completed',
                                data: result,
                            });
                        } else if (data.status === 'failed') {
                            clearTimeout(timeoutId);
                            this.cleanup();
                            const errorInfo = data.error || {};
                            resolve({
                                status: 'failed',
                                errorMessage: errorInfo.message || data.message || 'Brand fit evaluation failed',
                                httpStatus: errorInfo.httpStatus,
                            });
                        }
                    },
                    (error) => {
                        clearTimeout(timeoutId);
                        this.cleanup();
                        reject(new Error(`Firebase listener error for brandFitId '${brandFitId}' (evaluationId: ${evaluationId}): ${error.message}`));
                    },
                );
        });
    }

    cleanup() {
        if (this.unsubscribe) {
            try {
                this.unsubscribe();
            } finally {
                this.unsubscribe = undefined;
            }
        }
    }
}

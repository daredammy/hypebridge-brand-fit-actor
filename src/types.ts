export interface ActorInput {
    brandName: string;
    criteria: string;
    influencerHandle?: string;
    platform?: 'instagram' | 'tiktok';
    evaluationId?: string;
}

export type FitLevel = 'met_fully' | 'met_partially' | 'not_met' | 'unknown';

export interface CriterionEvaluation {
    criterion: string;
    fitLevel: FitLevel;
    reasoning?: string;
}

export interface SummaryStats {
    totalCriteria: number;
    metFully: number;
    metPartially: number;
    notMet: number;
    unknown: number;
}

export interface BrandFitResult {
    brandFitId: string;
    evaluationId: string;
    influencerId: string;
    handle: string;
    platform: string;
    brandName: string;
    evaluation: CriterionEvaluation[];
    summary: SummaryStats;
    fitScore: number;
    processingTimeSecs: number;
    updatedAt: string;
}

export interface BrandFitStartResponse {
    brandFitId: string;
    status: 'processing' | 'completed' | 'failed';
}

export interface EvaluationStartResponse {
    evaluationId: string;
    status: 'started' | 'cached';
}

export interface ProgressUpdate {
    status: string;
    message?: string;
}

export interface FirebaseListenerResult<T> {
    status: 'completed' | 'failed';
    data?: T;
    errorMessage?: string;
    httpStatus?: number;
}

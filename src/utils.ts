import { ActorInput, CriterionEvaluation, SummaryStats } from './types.js';

/**
 * Validates required environment variables
 */
export function validateEnvVars(vars: string[]): void {
    const missing = vars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

/**
 * Formats error objects into strings
 */
export function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

/**
 * Normalizes influencer handle by stripping leading @ and lowercasing
 */
export function normalizeHandle(handle: string): string {
    return handle.trim().replace(/^@/, '').toLowerCase();
}

/**
 * Validates actor inputs according to backend constraints and client rules
 */
export function validateActorInput(input: ActorInput | null): {
    brandName: string;
    criteria: string;
    evaluationId?: string;
    influencerHandle?: string;
    platform: 'instagram' | 'tiktok';
} {
    const rawBrand = input?.brandName ?? 'Nightly Traffic';
    const rawCriteria = input?.criteria ?? 'Must have lived in Dallas for >3 years.\nWent to High School or College in target city.\nIs younger than 35.\nHas more than 10K followers.\nHas an engaging voice and creates authentic content.';
    const rawHandle = input?.influencerHandle ?? (input?.evaluationId ? undefined : 'natgeo');

    // 1. Validate brandName (1-100 characters, non-whitespace)
    const brandName = rawBrand.trim();
    if (brandName.length < 1 || brandName.length > 100) {
        throw new Error(`Invalid input: brandName must be between 1 and 100 characters (got ${brandName.length}).`);
    }

    // 2. Validate criteria (10-10,000 characters, non-whitespace)
    const criteria = rawCriteria.trim();
    if (criteria.length < 10 || criteria.length > 10000) {
        throw new Error(`Invalid input: criteria must be between 10 and 10,000 characters (got ${criteria.length}).`);
    }

    // 3. Either evaluationId OR influencerHandle must be supplied
    const evaluationId = input?.evaluationId?.trim();
    const influencerHandle = rawHandle ? normalizeHandle(rawHandle) : undefined;

    if (!evaluationId && (!influencerHandle || influencerHandle.length === 0)) {
        throw new Error('Invalid input: Either evaluationId OR influencerHandle must be supplied.');
    }

    const platform: 'instagram' | 'tiktok' = input?.platform || 'instagram';

    return {
        brandName,
        criteria,
        evaluationId,
        influencerHandle,
        platform,
    };
}

/**
 * Computes fitScore percentage and summary stats client-side
 * Formula: (metFully + 0.5 * metPartially) / total * 100
 */
export function computeSummaryAndFitScore(evaluation: CriterionEvaluation[]): {
    summary: SummaryStats;
    fitScore: number;
} {
    const totalCriteria = evaluation.length;
    let metFully = 0;
    let metPartially = 0;
    let notMet = 0;
    let unknown = 0;

    for (const item of evaluation) {
        switch (item.fitLevel) {
        case 'met_fully':
            metFully++;
            break;
        case 'met_partially':
            metPartially++;
            break;
        case 'not_met':
            notMet++;
            break;
        default:
            unknown++;
            break;
        }
    }

    const summary: SummaryStats = {
        totalCriteria,
        metFully,
        metPartially,
        notMet,
        unknown,
    };

    let fitScore = 0;
    if (totalCriteria > 0) {
        const rawScore = ((metFully + 0.5 * metPartially) / totalCriteria) * 100;
        fitScore = Math.round(rawScore * 100) / 100;
    }

    return { summary, fitScore };
}

import { BrandFitResult } from './types.js';
import { normalizeHandle } from './utils.js';

export const DEFAULT_INPUT_CONFIG = {
    brandName: 'nightly traffic',
    influencerHandle: 'natgeo',
    platform: 'instagram',
    criteriaKeyword: 'must have lived in dallas',
};

export function isDefaultInput(input: {
    brandName: string;
    criteria: string;
    influencerHandle?: string;
    platform: 'instagram' | 'tiktok';
    evaluationId?: string;
}): boolean {
    if (input.evaluationId) {
        return false;
    }

    const brandMatch = input.brandName.trim().toLowerCase() === DEFAULT_INPUT_CONFIG.brandName;
    const handleMatch = input.influencerHandle
        ? normalizeHandle(input.influencerHandle) === DEFAULT_INPUT_CONFIG.influencerHandle
        : false;
    const platformMatch = input.platform === DEFAULT_INPUT_CONFIG.platform;
    const criteriaMatch = input.criteria.trim().toLowerCase().includes(DEFAULT_INPUT_CONFIG.criteriaKeyword);

    return brandMatch && handleMatch && platformMatch && criteriaMatch;
}

export function getCachedDefaultResult(): BrandFitResult {
    return {
        brandFitId: 'brand_fit_cached_natgeo_nightly_traffic',
        evaluationId: 'eval_cached_natgeo_instagram',
        influencerId: 'ig_natgeo_17841401234567890',
        handle: 'natgeo',
        platform: 'instagram',
        brandName: 'Nightly Traffic',
        evaluation: [
            {
                criterion: 'Must have lived in Dallas for >3 years.',
                fitLevel: 'not_met',
                reasoning: 'National Geographic (@natgeo) is a global media organization headquartered in Washington, D.C., with no history of Dallas residency.',
            },
            {
                criterion: 'Went to High School or College in target city.',
                fitLevel: 'not_met',
                reasoning: 'Account represents an international publication rather than an individual student from Dallas.',
            },
            {
                criterion: 'Is younger than 35.',
                fitLevel: 'not_met',
                reasoning: 'National Geographic was founded in 1888; individual age criteria do not apply to media organizations.',
            },
            {
                criterion: 'Has more than 10K followers.',
                fitLevel: 'met_fully',
                reasoning: 'Account holds over 280M Instagram followers, easily satisfying the 10K minimum follower threshold.',
            },
            {
                criterion: 'Has an engaging voice and creates authentic content.',
                fitLevel: 'met_fully',
                reasoning: 'Renowned for world-class visual storytelling, high engagement, and authentic documentary content across all posts.',
            },
        ],
        summary: {
            totalCriteria: 5,
            metFully: 2,
            metPartially: 0,
            notMet: 3,
            unknown: 0,
        },
        fitScore: 40,
        processingTimeSecs: 0.8,
        updatedAt: new Date().toISOString(),
    };
}

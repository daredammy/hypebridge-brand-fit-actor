import axios from 'axios';
import { log } from 'apify';
import { BrandFitStartResponse } from './types.js';

export class BrandFitClient {
    private backendUrl: string;
    private serviceKey: string;

    constructor(config: { backendUrl: string; serviceKey: string }) {
        this.backendUrl = config.backendUrl;
        this.serviceKey = config.serviceKey;
    }

    async startBrandFit(request: {
        evaluationId: string;
        brandName: string;
        criteria: string;
    }): Promise<BrandFitStartResponse> {
        try {
            const response = await axios.post(
                `${this.backendUrl}/api/influencer/brand-fit`,
                {
                    evaluationId: request.evaluationId,
                    brandName: request.brandName,
                    criteria: request.criteria,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Hypebridge-Service-Key': this.serviceKey,
                    },
                    timeout: 120000,
                },
            );

            if (response.status !== 202) {
                throw new Error(`Unexpected status code from brand-fit endpoint: ${response.status}`);
            }

            log.info('Backend brand-fit response:', { data: response.data });

            if (!response.data.data?.brandFitId) {
                throw new Error(`Backend did not return brandFitId. Response: ${JSON.stringify(response.data)}`);
            }

            return {
                brandFitId: response.data.data.brandFitId,
                status: response.data.data.status || 'processing',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data
                    ? `${error.message} - Response: ${JSON.stringify(error.response.data)}`
                    : error.message;
                throw new Error(`Brand fit evaluation request failed: ${errorMsg}`);
            }
            throw error;
        }
    }
}

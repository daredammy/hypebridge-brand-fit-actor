import axios from 'axios';
import { log } from 'apify';
import { EvaluationStartResponse } from './types.js';

export class EvaluationClient {
    private backendUrl: string;
    private serviceKey: string;

    constructor(config: { backendUrl: string; serviceKey: string }) {
        this.backendUrl = config.backendUrl;
        this.serviceKey = config.serviceKey;
    }

    async startEvaluation(request: {
        influencerHandle: string;
        platform?: string;
    }): Promise<EvaluationStartResponse> {
        try {
            const response = await axios.post(
                `${this.backendUrl}/api/influencer/evaluate`,
                {
                    influencerHandle: request.influencerHandle,
                    platform: request.platform || 'instagram',
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
                throw new Error(`Unexpected status code: ${response.status}`);
            }

            log.info('Backend evaluate response:', { data: response.data });

            if (!response.data.data?.evaluationId) {
                throw new Error(`Backend did not return evaluationId. Response: ${JSON.stringify(response.data)}`);
            }

            return {
                evaluationId: response.data.data.evaluationId,
                status: response.data.data.status || 'started',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMsg = error.response?.data
                    ? `${error.message} - Response: ${JSON.stringify(error.response.data)}`
                    : error.message;
                throw new Error(`Evaluation request failed: ${errorMsg}`);
            }
            throw error;
        }
    }
}

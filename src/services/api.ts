/**
 * BotSieve API Client
 * Typed API calls to the FastAPI backend
 */

export interface SentimentPoint {
    time: string;
    positive: number;
    negative: number;
    neutral: number;
    organic: number;
    fake: number;
}

export interface AttackAlert {
    id: string;
    timestamp: string;
    hashtag: string;
    confidence: number;
    type: 'bot_cluster' | 'copy_paste' | 'spike' | 'coordinated';
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SuspiciousAccount {
    handle: string;
    botScore: number;
    accountAge: number;
    followers: number;
    tweets: number;
}

export interface ClusterNode {
    id: string;
    label: string;
    size: number;
    botScore: number;
    x: number;
    y: number;
}

export interface ExplainabilityFactor {
    label: string;
    value: number;
    color: 'destructive' | 'warning' | 'success';
}

export interface SpikeData {
    spike_detected: boolean;
    spike_hours: number[];
    peak_hour: number | null;
    peak_count: number;
    spike_magnitude: number;
}

export interface AnalysisResult {
    hashtag: string;
    verdict: 'fake' | 'real';
    fakeness_score: number;
    bot_score: number;
    fake_percent: number;
    total_posts: number;
    suspicious_posts: number;
    total_accounts: number;
    fake_accounts: number;
    copy_paste_score: number;
    spike: SpikeData;
    sentiment_timeline: SentimentPoint[];
    alerts: AttackAlert[];
    suspicious_accounts: SuspiciousAccount[];
    clusters: ClusterNode[];
    explainability: ExplainabilityFactor[];
    // Source meta — tells if data is from live Twitter or synthetic fallback
    data_source: 'live' | 'synthetic';
    api_status: string | null;
}


const API_BASE = '/api';

export async function analyzeHashtag(hashtag: string): Promise<AnalysisResult> {
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashtag }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
}

export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/health`);
        return response.ok;
    } catch {
        return false;
    }
}

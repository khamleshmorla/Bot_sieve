import { useQuery } from '@tanstack/react-query';
import { analyzeHashtag, type AnalysisResult } from '@/services/api';

export const useAnalysis = (hashtag: string | null) => {
    return useQuery<AnalysisResult, Error>({
        queryKey: ['analysis', hashtag],
        queryFn: () => analyzeHashtag(hashtag!),
        enabled: !!hashtag,
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: 1,
    });
};

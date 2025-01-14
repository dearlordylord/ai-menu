import {
  COMPLETION_ENDPOINT,
  SuggestionServiceRequest,
  SuggestionServiceResponse
} from '@ai-menu/api-commons';
import { API_URL } from './env';
import { Schema as S } from 'effect';
import { useQuery } from '@tanstack/react-query';
import { hashCode } from '@ai-menu/utils';

export const COMPLETION_ENDPOINT_FULL = `${API_URL}${COMPLETION_ENDPOINT}`;

export const getCompletion = async (request: SuggestionServiceRequest): Promise<SuggestionServiceResponse> =>
  await fetch(COMPLETION_ENDPOINT_FULL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(S.encodeSync(SuggestionServiceRequest)(request))
  })
  .then(r => r.json())
  .then(S.decodeUnknownSync(SuggestionServiceResponse));

const COMPLETION_QUERY_KEY = ['completion'] as const;
export const useCompletion = (request: SuggestionServiceRequest) => useQuery({ queryKey: [
    ...COMPLETION_QUERY_KEY,
    // TODO better hash
    hashCode(JSON.stringify(S.encode(SuggestionServiceRequest)(request)))
  ], queryFn: () => getCompletion(request) });



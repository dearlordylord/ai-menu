import { FastifyInstance } from 'fastify';
import { Schema as S } from 'effect';
import { COMPLETION_ENDPOINT, SuggestionServiceRequest, SuggestionServiceResponse } from '@ai-menu/api-commons';
import { run } from '../bot';
import { pipe } from 'fp-ts/lib/function';
import { runTaskEither } from '@ai-menu/utils';

// TODO effect schema adapter for route types
export default async function (fastify: FastifyInstance) {
  fastify.post(COMPLETION_ENDPOINT, async function (request, reply) {
    const body = S.decodeUnknownSync(SuggestionServiceRequest)(request.body);
    const result = await pipe(body, run, runTaskEither)
    return result satisfies SuggestionServiceResponse;
  });
};

// TODO service for polling "has credits"

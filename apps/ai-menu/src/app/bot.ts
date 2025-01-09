import { PROMPT } from './prompt';
import { SuggestionServiceResponse, SuggestionServiceRequest } from '@ai-menu/api-commons';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import * as TE from 'fp-ts/lib/TaskEither';
import { flow, pipe } from 'fp-ts/lib/function';
import { toError } from 'fp-ts/lib/Either';
import { Schema as S } from 'effect';
import * as E from 'fp-ts/lib/Either';
import { Either } from 'fp-ts/lib/Either';
import { ParseError } from 'effect/ParseResult';

import OpenAI from 'openai';
import { OPENROUTER_API_KEY } from './env';
import { decodeJson, JsonDecodeError, tagError, TaggedError } from '@ai-menu/utils';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY
});

export const COMPLETION_ERROR_TAG = 'CompletionError' as const;
export type CompletionError = TaggedError<typeof COMPLETION_ERROR_TAG>;
export const CompletionError = (e: Error): CompletionError => tagError(e, COMPLETION_ERROR_TAG);
const completion = (request: Pick<SuggestionServiceRequest, 'companyDomain'>): TaskEither<CompletionError, string> =>
  pipe(
    TE.tryCatch(
      () => openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            "role": "user",
            "content": PROMPT(request)
          }
        ]
      }),
      flow(toError, CompletionError)
    ),
    TE.chainW((r) => {
      const message = r.choices[0].message;
      const refusal = message.refusal;
      if (refusal) {
        return TE.left(CompletionError(new Error(refusal)));
      }
      if (!message.content) {
        return TE.left(CompletionError(new Error('panic! No content in response, something went wrong')));
      }
      return TE.right(message.content);
    })
  );

export type ParseResponseError = JsonDecodeError | ParseError;

const parseResponse = (response: string): Either<ParseResponseError, SuggestionServiceResponse> =>
  pipe(
    response,
    decodeJson,
    E.chainW(S.decodeUnknownEither(SuggestionServiceResponse))
  )

export type RunError = CompletionError | ParseResponseError;
export const run = (request: SuggestionServiceRequest): TaskEither<Error, SuggestionServiceResponse> =>
  pipe(
    request,
    completion,
    TE.chainEitherKW(parseResponse),
  )

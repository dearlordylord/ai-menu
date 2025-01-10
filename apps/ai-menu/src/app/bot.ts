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
import { ChatCompletionMessageParam, ChatCompletionMessage } from 'openai/src/resources/chat/completions';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY
});

export const COMPLETION_ERROR_TAG = 'CompletionError' as const;
export type CompletionError = TaggedError<typeof COMPLETION_ERROR_TAG>;
export const CompletionError = (e: Error): CompletionError => tagError(e, COMPLETION_ERROR_TAG);
const completion = (request: Pick<SuggestionServiceRequest, 'companyDomain'>, history: Array<ChatCompletionMessageParam> = []): TaskEither<CompletionError, ChatCompletionMessage & {
  content: string
}> => {
  // TODO proper logs
  console.log('requesting completion for query' + request.companyDomain);
  return pipe(
    TE.tryCatch(
      () => openai.chat.completions.create({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            "role": "user",
            "content": PROMPT(request)
          },
          ...history
        ]
      }),
      flow(toError, CompletionError)
    ),
    TE.chainW((r) => {
      console.log(`got completion ${r.id}`);
      const message = r.choices[0].message;
      const refusal = message.refusal;
      if (refusal) {
        return TE.left(CompletionError(new Error(refusal)));
      }
      if (message.content === null) {
        return TE.left(CompletionError(new Error('panic! No content in response, something went wrong')));
      }
      return TE.right(message as typeof message & {
        content: string
      });
    })
  )
};

export type ParseResponseError = JsonDecodeError | ParseError;

const parseResponse = (response: string): Either<ParseResponseError, SuggestionServiceResponse> =>
  pipe(
    response,
    decodeJson,
    E.chainW(S.decodeUnknownEither(SuggestionServiceResponse))
  )

export type RetryError = TaggedError<'RetryError'>;
export const RetryError = (e: ChatCompletionMessageParam[]): RetryError => tagError(new Error(e.map(m => JSON.stringify(m, null, 2)).join('\n')), 'RetryError');

export type RunError = CompletionError | ParseResponseError | RetryError;
export const run = (request: SuggestionServiceRequest, retry: {
  tries: number,
  history: Array<ChatCompletionMessageParam>
} = {
  tries: 0,
  history: []
}): TaskEither<RunError, SuggestionServiceResponse> =>
{
  if (retry.tries > 3) {
    return TE.left(RetryError(retry.history));
  }
  return pipe(
    request,
    completion,
    TE.chainW(
      response => pipe(
        parseResponse(response.content),
        TE.fromEither,
        TE.orElseW(e => run(request, {
          ...retry,
          tries: retry.tries + 1,
          history: [...retry.history, response, {
            role: 'developer',
            // TODO check retry best practices
            content: `Parsing your response JSON failed with error: !!! ${e.message} !!!. Please correct it and try again.`
          }]
        }))
      )
    ),
  )
}

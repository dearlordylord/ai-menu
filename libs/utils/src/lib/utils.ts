import * as E from 'fp-ts/lib/Either';
import { Either } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { TaskEither } from 'fp-ts/lib/TaskEither';

export const assertNonEmptyOrNA = <S extends string | undefined | null>(
  s: S,
  e?: string
): Exclude<S, '' | null | undefined> => {
  if (isNonExistent(s) || s === '') throw new Error(e || 'Expected non-empty string');
  return s as Exclude<S, '' | null | undefined>;
};

export const isNonExistent = <T>(x: T | null | undefined | void): x is null | undefined | void => !isExistent(x);
export const assertNonExistent = <T>(x: T | null | undefined, e?: string): asserts x is null | undefined => {
  if (isNonExistent(x)) return;
  throw new Error(e || `Expected value to be undefined`);
};
export const isExistent = <T>(x: T | null | undefined | void): x is T => !isNil(x);
export const assertExistent = <T>(x: T | null | undefined, e?: string): asserts x is T => {
  if (isExistent(x)) return;
  throw new Error(e || `Expected value to be defined`);
};

export const isNil = <T>(x: T | null | undefined | void): x is null | undefined | void => x === null || x === undefined;

export type TaggedError<T extends string, E extends Error = Error> = E & { _tag: T };
// mutates the error object!
export const tagError = <T extends string, E extends Error = Error>(error: E, tag: T): TaggedError<T, E> => {
  const r = error as TaggedError<T, E>;
  r._tag = tag;
  return r;
};
// curried version to use as tagErrorC('tag')(error)
export const tagErrorC =
  <T extends string>(tag: T) =>
    <E = unknown>(error: E) =>
      tagError<T, E extends Error ? E : Error>(error as E extends Error ? E : Error, tag);

export type JsonDecodeError = TaggedError<'JsonDecodeError'>;
export const JsonDecodeError = (e: Error): JsonDecodeError => tagError(e, 'JsonDecodeError');

export const decodeJson = (response: string): Either<JsonDecodeError, unknown> => {
  try {
    return E.right(JSON.parse(response));
  } catch (e) {
    return pipe(
      e,
      E.toError,
      JsonDecodeError,
      E.left
    );
  }
};

export const runTaskEitherLazy = <E, A>(
  taskEither: TaskEither<E, A>,
  showError?: (e: E) => string
): (() => Promise<A>) =>
  pipe(
    taskEither,
    TE.fold(
      (e) => () => {
        console.error('runTaskEither error:', showError ? showError(e) : e);
        return Promise.reject(e);
      },
      (a) => () => Promise.resolve(a)
    )
  );
export const runTaskEither = <E, A>(taskEither: TaskEither<E, A>, showError?: (e: E) => string): Promise<A> =>
  runTaskEitherLazy(taskEither, showError)();

// java hash
export const hashCode = (s: string): number => {
  let hash = 0;
  for (let i = 0, len = s.length; i < len; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

import {
  Errors, string, type, Type, TypeOf, undefined, union,
} from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { getOrElseW } from 'fp-ts/lib/Either';
import { failure } from 'io-ts/lib/PathReporter';

export const decodeWith = <ApplicationType = any, EncodeTo = ApplicationType, DecodeFrom = unknown>(
  codec: Type<ApplicationType, EncodeTo, DecodeFrom>,
) => (input: DecodeFrom): ApplicationType => pipe(
    codec.decode(input),
    getOrElseW((errors: Errors) => {
      throw new Error(failure(errors).join('\n'));
    }),
  );

export const decodeResponseWith = <
  ApplicationType = any,
  EncodeTo = ApplicationType,
  DecodeFrom = unknown,
  >(
    codec: Type<ApplicationType, EncodeTo, DecodeFrom>,
  ) => (response: DecodeFrom): TypeOf<typeof codec> => decodeWith(codec)(response);

export const ErrorType = type({
  name: string,
  message: string,
  stack: union([string, undefined]),
});

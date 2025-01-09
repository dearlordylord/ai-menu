import { Schema as S } from 'effect';

export const CompanyDomain = S.NonEmptyString.pipe(
  S.brand('CompanyDomain')
);

export type CompanyDomain = S.Schema.Type<typeof CompanyDomain>;
export const castCompanyDomain = (s: string): CompanyDomain => S.decodeSync(CompanyDomain)(s);

export const SuggestionServiceRequest = S.Struct({
  companyDomain: CompanyDomain
});
export type SuggestionServiceRequest = S.Schema.Type<typeof SuggestionServiceRequest>;

const SuggestionResponseCommon = S.Struct({
  thoughts: S.NonEmptyString
});

export const OK = 'ok' as const;
export const SuggestionResponseSuccess = S.extend(
  SuggestionResponseCommon,
  S.Struct({
    status: S.Literal(OK),
    services: S.NonEmptyString,
    servicesHtml: S.NonEmptyString,
  })
);

export type SuggestionResponseSuccess = S.Schema.Type<typeof SuggestionResponseSuccess>;

export const MORE_PLEASE = 'morePlease' as const;
export const SuggestionServiceResponseMissingData = S.extend(
  SuggestionResponseCommon,
  S.Struct({
    status: S.Literal(MORE_PLEASE),
    specifics: S.NonEmptyString,
  })
);
export type SuggestionServiceResponseMissingData = S.Schema.Type<typeof SuggestionServiceResponseMissingData>;

export const SuggestionServiceResponse = S.Union(
  SuggestionResponseSuccess,
  SuggestionServiceResponseMissingData
);

export type SuggestionServiceResponse = S.Schema.Type<typeof SuggestionServiceResponse>;

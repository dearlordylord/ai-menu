import { useCompletion } from '../api';
import {
  castCompanyDomain,
  CompanyDomain,
  SuggestionServiceRequest,
  SuggestionServiceResponse
} from '@ai-menu/api-commons';
import { useForm } from '@tanstack/react-form';
import type { FieldApi } from '@tanstack/react-form';
import { Schema as S } from 'effect';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import { constNull } from 'fp-ts/lib/function';
import { useCallback, useState } from 'react';
import styled from '@emotion/styled';

const useResizeObserver = () => useCallback((node: HTMLDivElement | null) => {
  if (!node) return;
  const resizeObserver = new ResizeObserver(() => {
    sendHeightToParent();
  });
  resizeObserver.observe(node);
  return () => resizeObserver.disconnect();
}, []);

export const Widget = () => {
  const [currentFormData, setCurrentFormData] = useState<SuggestionServiceRequest | null>(null);
  const wrapperRef = useResizeObserver();
  return (
    <div ref={wrapperRef}>
      <CompletionForm onSubmit={setCurrentFormData} />
      {currentFormData && <CompletionResult request={currentFormData} />}
    </div>
  )
}

const sendHeightToParent = () => {
  window.parent.postMessage({
    type: 'heightUpdate',
    height: document.documentElement.scrollHeight
  }, "*");
};

const CompletionResult = ({ request }: { request: SuggestionServiceRequest }) => {
  const { data, isLoading, error } = useCompletion(request);
  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>
        {data.status === 'ok' && <div dangerouslySetInnerHTML={{
          // make sure all the data, including augmentations, is safe
          // current user input doesn't have to be safe; it's the same user, they don't hack themselves
          __html: data.servicesHtml
        }}></div>}
        {data.status === 'morePlease' && <div>{data.specifics}</div>}
      </div>}
    </div>
  )
}

const FieldInfo = ({ field }: { field: FieldApi<any, any, any, any> }) => {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

const MonadicalButton = styled.button`
// code repetition 1F9AF2C9-1D18-4E49-83CC-FBE5338318E3 with monadical.com
&.btn-info-inverse {
    font-size: 16px;
    color: #FFF;
    letter-spacing: 1px;
    line-height: 15px;
    border: 2px solid #0086b4;
    border-radius: 40px;
    box-shadow: 0 7px 20px -12px rgba(144, 144, 144, 0.8);
    background-color: #0086b4;
    transition: all 0.3s ease 0s;
    white-space: normal;
}

// code repetition 1F9AF2C9-1D18-4E49-83CC-FBE5338318E3 with monadical.com
&.btn-info-inverse:hover {
    color: #0086b4;
    background: #FFF;
    border: 2px solid #0086b4;
}
  &.btn {
    cursor: pointer;
  }
`;

const CompletionForm = ({onSubmit}: {onSubmit: (v: SuggestionServiceRequest) => void}) => {
  const form = useForm({
    defaultValues: {
      companyDomain: '',
    },
    onSubmit: async ({ value }) => {
      onSubmit(S.decodeSync(SuggestionServiceRequest)(value));
    },
    validators: {
      // TODO look for effect schema integration
      onSubmit: ({ value }) => {
        return pipe(
          value,
          S.decodeEither(SuggestionServiceRequest),
          E.foldW(
            (e) => {
              return e.message;
            },
            constNull
          )
        )
      },
    }
  })

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          <form.Field
            name="companyDomain"
            children={(field) => (
              <>
                <label htmlFor={field.name}>Company Domain (what you do):</label>
                <input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <MonadicalButton type="submit" disabled={!canSubmit} className="btn btn-info-inverse">
              {isSubmitting ? '...' : 'Submit'}
            </MonadicalButton>
          )}
        />
      </form>
    </div>
  )
}

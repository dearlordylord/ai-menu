import { assertNonEmptyOrNA } from '@ai-menu/utils';

export const OPENROUTER_API_KEY = assertNonEmptyOrNA(process.env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY is not set');


import { assertNonEmptyOrNA } from '@ai-menu/utils';

export const API_URL = assertNonEmptyOrNA(process.env.API_URL, 'API_URL is not set');

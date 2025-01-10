import { assertNonEmptyOrNA } from '@ai-menu/utils';

export const API_URL = assertNonEmptyOrNA(import.meta.env.VITE_API_URL, 'VITE_API_URL is not set');

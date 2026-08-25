import { EL8_ENVIRONMENT } from './environment.js';

const runtime = globalThis.EL8_RUNTIME_CONFIG || {};

export const BACKEND_CONFIG = Object.freeze({
  environment: EL8_ENVIRONMENT.name,
  supabaseUrl: runtime.supabaseUrl || 'https://jprdsidxwjkgiqqakwpr.supabase.co',
  supabasePublishableKey: runtime.supabasePublishableKey || 'sb_publishable_CkcqWpD6nkzRzBfuJV08TQ_t38C9j34',
  functionsBaseUrl: runtime.functionsBaseUrl || 'https://jprdsidxwjkgiqqakwpr.supabase.co/functions/v1',
  storageKey: runtime.storageKey || `${EL8_ENVIRONMENT.storageNamespace}:auth`,
  testDataNamespace: EL8_ENVIRONMENT.testDataNamespace
});

export function assertDevelopmentRuntime() {
  if (BACKEND_CONFIG.environment !== 'development') throw new Error('Development build loaded with the wrong environment configuration.');
  return BACKEND_CONFIG;
}

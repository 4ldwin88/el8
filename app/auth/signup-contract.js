// Canonical minimum account-creation contract.

export const SIGNUP_FIELDS = Object.freeze(['name','email','birthdate','country','timezone','password','passwordConfirmation']);
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HELP = 'Password must be at least 8 characters long and contain the required character types.';

export function validateSignup(input = {}) {
  const errors = {};
  for (const field of SIGNUP_FIELDS) if (!String(input[field] ?? '').trim()) errors[field] = 'Required';
  if (input.password && String(input.password).length < PASSWORD_MIN_LENGTH) errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  if (input.password && input.passwordConfirmation && input.password !== input.passwordConfirmation) errors.passwordConfirmation = 'Passwords must match.';
  return { valid: Object.keys(errors).length === 0, errors };
}

// Canonical account-creation contract.
// Keep signup low-friction: only fields required to create and safely route an account are mandatory.

export const REQUIRED_SIGNUP_FIELDS = Object.freeze(['name','email','birthdate','password','passwordConfirmation']);
export const OPTIONAL_SIGNUP_FIELDS = Object.freeze(['sex','country','timezone','measurementSystem']);
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HELP = 'Password must be at least 8 characters long and contain the required character types.';

export function validateSignup(input = {}) {
  const errors = {};
  for (const field of REQUIRED_SIGNUP_FIELDS) if (!String(input[field] ?? '').trim()) errors[field] = 'Required';
  if (input.sex && !['male','female','other','prefer_not_to_say'].includes(input.sex)) errors.sex = 'Choose a valid option.';
  if (input.measurementSystem && !['metric','imperial'].includes(input.measurementSystem)) errors.measurementSystem = 'Choose a valid measurement system.';
  if (input.password && String(input.password).length < PASSWORD_MIN_LENGTH) errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  if (input.password && input.passwordConfirmation && input.password !== input.passwordConfirmation) errors.passwordConfirmation = 'Passwords must match.';
  return { valid: Object.keys(errors).length === 0, errors };
}

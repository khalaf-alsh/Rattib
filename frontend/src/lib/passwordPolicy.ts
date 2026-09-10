export type PasswordRequirements = {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

// Keep password validation rules in one place so Register,
// Reset Password, and Account always use the same policy.
export function getPasswordRequirements(
  password: string,
): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const requirements = getPasswordRequirements(password);

  return Object.values(requirements).every(Boolean);
}

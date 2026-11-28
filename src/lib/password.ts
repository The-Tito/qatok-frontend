// Reglas de contraseña al crear cuenta. La API solo exige 8 caracteres y 72 bytes UTF-8
// (RegisterInput); mayúscula, minúscula y número son una exigencia de la interfaz.

export interface PasswordRule {
  id: 'length' | 'upper' | 'lower' | 'digit';
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { id: 'length', label: '8 caracteres', test: (p) => [...p].length >= 8 },
  { id: 'upper', label: 'Una mayúscula', test: (p) => /\p{Lu}/u.test(p) },
  { id: 'lower', label: 'Una minúscula', test: (p) => /\p{Ll}/u.test(p) },
  { id: 'digit', label: 'Un número', test: (p) => /\d/.test(p) },
];

/** Límite de la API (bcrypt): 72 bytes en UTF-8. */
export const PASSWORD_MAX_BYTES = 72;

export function passwordTooLong(password: string): boolean {
  return new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES;
}

export function passwordMeetsRules(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password)) && !passwordTooLong(password);
}

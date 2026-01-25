/**
 * ======================================================
 * Type Guard Utilities
 * ======================================================
 *
 * Purpose:
 * - Provide explicit type narrowing for TypeScript
 * - Satisfy strict ESLint rules (e.g. strict-boolean-expressions)
 * - Avoid unsafe `as` type assertions
 *
 * Guidelines:
 * - Always return `value is ...`
 * - No implicit boolean coercion
 * - Prefer reusable, generic helpers
 */

/**
 * Checks whether a value is null or undefined.
 *
 * @example
 * if (isNil(userId)) return;
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Checks whether a value is undefined (narrowing to never null).
 *
 * @example
 * if (isUndefined(config)) { ... }
 */
export function isUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}

/**
 * Checks whether a value is null.
 *
 * @example
 * if (isNull(result)) { ... }
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Checks whether a value is defined (not undefined).
 *
 * ⚠ Does NOT check for null.
 *
 * @example
 * if (isDefined(id)) {
 *   // id: T
 * }
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Checks whether a value is neither null nor undefined.
 *
 * @example
 * if (isNotNil(entity)) {
 *   // entity: T
 * }
 */
export function isNotNil<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Checks whether a value is a string.
 *
 * @example
 * if (isString(input)) {
 *   // input: string
 * }
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks whether a value is a non-empty string.
 *
 * @example
 * if (isNonEmptyString(name)) {
 *   // name: string
 * }
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Checks whether a value is a valid number (excludes NaN).
 *
 * @example
 * if (isNumber(age)) {
 *   // age: number
 * }
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Checks whether a value is a boolean.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks whether a value is an array.
 *
 * @example
 * if (isArray(data)) {
 *   // data: readonly unknown[]
 * }
 */
export function isArray<T = unknown>(value: unknown): value is readonly T[] {
  return Array.isArray(value);
}

/**
 * Checks whether a value is a non-empty array.
 *
 * @example
 * if (isNonEmptyArray(users)) {
 *   // users: readonly User[]
 * }
 */
export function isNonEmptyArray<T>(
  value: readonly T[] | null | undefined,
): value is readonly T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Checks whether a value is an empty array.
 *
 * @example
 * if (isEmptyArray(items)) {
 *   // items: []
 * }
 */
export function isEmptyArray<T>(
  value: readonly T[] | null | undefined,
): value is [] {
  return Array.isArray(value) && value.length === 0;
}

/**
 * Checks whether a value is a plain object
 * (excluding null and arrays).
 *
 * @example
 * if (isObject(payload)) {
 *   // payload: Record<string, unknown>
 * }
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks whether an object has a specific key.
 *
 * @example
 * if (hasKey(user, 'id')) {
 *   // user.id is accessible
 * }
 */
export function hasKey<K extends PropertyKey>(
  value: unknown,
  key: K,
): value is Record<K, unknown> {
  return isObject(value) && key in value;
}

/**
 * Checks whether a value is a valid Date instance (non-NaN timestamp).
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Checks whether a value is a UUID string (v1-v5, case-insensitive).
 */
export function isUuidString(value: unknown): value is string {
  return (
    isString(value) &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      value,
    )
  );
}

/**
 * Checks whether a string represents an integer (e.g. "-10", "42").
 */
export function isIntegerString(value: unknown): value is string {
  return isString(value) && /^-?\d+$/.test(value);
}

/**
 * Checks whether a string is numeric (integer or decimal).
 */
export function isNumericString(value: unknown): value is string {
  if (!isString(value)) {
    return false;
  }

  const normalized = value.trim();
  return normalized !== '' && /^-?\d*(?:\.\d+)?$/.test(normalized);
}

/**
 * Identity type guard, useful for Array.filter().
 *
 * Filters out falsy values (false, 0, '', null, undefined).
 *
 * @example
 * const ids = list.filter(truthy);
 */
export function truthy<T>(
  value: T | null | undefined | false | 0 | '',
): value is T {
  return Boolean(value);
}

/**
 * A utility function to handle try-catch operations for both synchronous and asynchronous functions.
 * It returns a tuple where the first element is the error (if any) and the second element is the result.
 * This approach avoids the need for traditional try-catch blocks and makes error handling more functional.
 *
 * @template T - The type of the successful result.
 * @template E - The type of the error (defaults to Error).
 *
 * @param operation - A function or promise that performs an operation which may throw an error.
 *
 * @returns A tuple:
 *   - On success: [null, result]
 *   - On failure: [error, null]
 *
 * @example
 * // Synchronous function
 * const [error, data] = tryCatch(() => JSON.parse('{"valid": "json"}'));
 * if (error) {
 *   // Handle error
 * } else {
 *   // Use data
 * }
 *
 * // Asynchronous function
 * const [error, data] = await tryCatch(fetch('https://api.example.com/data'));
 * if (error) {
 *   // Handle error
 * } else {
 *   // Use data
 * }
 */
type Success<T> = readonly [null, T];
type Failure<E> = readonly [E, null];
type ResultSync<T, E> = Success<T> | Failure<E>;
type ResultAsync<T, E> = Promise<ResultSync<T, E>>;
type Operation<T> = Promise<T> | (() => T) | (() => Promise<T>);

export function tryCatch<T, E = Error>(
  operation: Promise<T>,
): ResultAsync<T, E>;
export function tryCatch<T, E = Error>(
  operation: () => Promise<T>,
): ResultAsync<T, E>;
export function tryCatch<T, E = Error>(operation: () => T): ResultSync<T, E>;
export function tryCatch<T, E = Error>(
  operation: Operation<T>,
): ResultSync<T, E> | ResultAsync<T, E> {
  if (operation instanceof Promise) {
    return operation
      .then((data: T) => [null, data] as const)
      .catch((error: E) => [error, null] as const);
  }

  try {
    const result = operation();

    if (result instanceof Promise) {
      return result
        .then((data: T) => [null, data] as const)
        .catch((error: E) => [error, null] as const);
    }

    return [null, result] as const;
  } catch (error) {
    return [error as E, null] as const;
  }
}

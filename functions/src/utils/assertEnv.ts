/**
 * Ensure an environment variable is set, or throw a clear error.
 */
export function assertEnv(key: string, value: string | undefined): string {
  if (value == null) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
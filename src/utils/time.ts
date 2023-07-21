/**
 * Sleeps for a given number of miliseconds
 * @param timeout The number of miliseconds for which to sleep
 * @returns A promise which resolves after the timeout
 */
export function sleep(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

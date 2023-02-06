export function referentiallyCompareArrayItems(
  array1: unknown[],
  array2: unknown[]
): boolean {
  const [longestArray, shortestArray] =
    array1.length > array2.length ? [array1, array2] : [array2, array1];

  for (let i = 0; i < longestArray.length; i++)
    if (longestArray[i] !== shortestArray[i]) return false;

  return true;
}

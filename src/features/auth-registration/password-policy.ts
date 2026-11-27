const upper = /[A-Z]/;
const lower = /[a-z]/;
const digit = /\d/;
const symbol = /[^A-Za-z0-9]/;

export function isStrongPassword(value: string): boolean {
  if (value.length < 12) {
    return false;
  }
  let kinds = 0;
  if (upper.test(value)) kinds += 1;
  if (lower.test(value)) kinds += 1;
  if (digit.test(value)) kinds += 1;
  if (symbol.test(value)) kinds += 1;
  return kinds >= 3;
}
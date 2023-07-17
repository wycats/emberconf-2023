type Value<R> = R[keyof R];

export function mapEntries<R extends Record<keyof any, any>, U>(
  obj: R,
  fn: (value: Value<R>, key: keyof R, obj: R) => [keyof R, U]
): Record<keyof R, U> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => fn(value, key, obj))
  ) as Record<keyof R, U>;
}

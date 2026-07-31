/**
 * Merges conditional class names into a single string.
 * Filters out falsy values so you can safely chain conditions:
 *
 *   cn("base", isActive && "active", error ? "red" : null)
 */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(" ");

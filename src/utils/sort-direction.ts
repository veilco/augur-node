export type SortDirection = "desc" | "asc";

export function sortDirection(isSortDescending: boolean|null|undefined, defaultSortDirection: SortDirection): SortDirection {
  if (isSortDescending !== null && isSortDescending !== undefined) {
    if (isSortDescending) {
      return "desc";
    } else {
      return "asc";
    }
  }
  return defaultSortDirection;
}

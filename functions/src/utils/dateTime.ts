import * as dayjs from "dayjs";

/**
 *
 * @returns current date time
 */
export const getNow = (): Date => {
  return dayjs().toDate();
};

export function formatDate(
  d: string | { _seconds: number; _nanoseconds: number }
): string {
  if (typeof d === "string") {
    return dayjs(d).format();
  }
  return dayjs(new Date(d?._seconds * 1000)).format();
}

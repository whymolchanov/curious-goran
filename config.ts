export interface Config {
  timeUnit: "days" | "hours";
  /**
   * If there is no value for particular status,
   * Curious Goran will write them as 0.
   * If you need empty spaces in place of obsolence
   * of particular statuses set here false.
   * */
  setZeroInsteadOfNull: boolean;
}

export const config: Config = {
  timeUnit: "hours",
  setZeroInsteadOfNull: true,
};

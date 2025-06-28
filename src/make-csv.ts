import {
  Ticket,
  Csv,
  CsvPresentation,
  CsvBuildConfig,
  AdditionalConfig,
} from "./types";
import { wrapStringsInBraces } from "./utils";

export const buildCsv = (
  tickets: Ticket[],
  csvBuildConfig: CsvBuildConfig,
  config: Pick<AdditionalConfig, "setZeroInsteadOfNull">
): Csv => {
  const result: CsvPresentation = [];
  const { interestedStatusesForTimeCalculations, switchesBetweenStatuses } =
    csvBuildConfig;
  const accumulatedArrays = [
    "url",
    "title",
    ...interestedStatusesForTimeCalculations,
    ...switchesBetweenStatuses,
  ];

  result.push(accumulatedArrays.join(", "));

  tickets.forEach(({ url, title, timeInStatuses, switchesBetweenStatuses }) => {
    const sum = { ...timeInStatuses, ...switchesBetweenStatuses };

    const csvRow: (string | number | null)[] = accumulatedArrays.map((item) => {
      if (sum[item] !== undefined) {
        return sum[item];
      }

      return config.setZeroInsteadOfNull ? 0 : null;
    });
    csvRow[0] = url;
    csvRow[1] = title;

    result.push(csvRow.map(wrapStringsInBraces).join(", "));
  });

  return result.join("\n");
};

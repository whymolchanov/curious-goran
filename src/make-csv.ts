import { createWriteStream } from "fs";
import { exit } from "process";
import { Ticket, CsvBuildConfig, Csv, CsvPresentation } from "./types";
import { Config, config } from "./config";

export const buildCsv = (
  tickets: Ticket[],
  csvBuildConfig: CsvBuildConfig,
  config: Pick<Config, "setZeroInsteadOfNull">
): Csv => {
  const result: CsvPresentation = [];
  const { interestedStatusesForTimeCalculations, switchesBetweenStatuses } = csvBuildConfig;
  const accumulatedArrays = ["key", "title", ...interestedStatusesForTimeCalculations, ...switchesBetweenStatuses];

  result.push(accumulatedArrays.join(", "));

  tickets.forEach(({ key, title, timeInStatuses, switchesBetweenStatuses }) => {
    const sum = { ...timeInStatuses, ...switchesBetweenStatuses };

    const csvRow: (string | number | null)[] = accumulatedArrays.map((item) => {
      if (sum[item] !== undefined) {
        return sum[item];
      }

      return config.setZeroInsteadOfNull ? 0 : null;
    });
    csvRow[0] = key;
    csvRow[1] = title;

    result.push(csvRow.join(", "));
  });

  return result.join("\n");
};

console.log("Start converting Jira issues to CSV...");

const tickets = require("../data/tickets.json") as Ticket[];
const csvTemplate = require("../data/csv-build-config.json") as CsvBuildConfig;
const csv = buildCsv(tickets, csvTemplate, config);

console.log("Writting to the result.csv file...");

const STREAM_PATH = "./data/result.csv";
const STREAM = createWriteStream(STREAM_PATH);
STREAM.write(csv, () => {
  console.log("Done!");
  exit(0);
});

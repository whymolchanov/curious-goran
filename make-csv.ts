const issues = require("./data/source.json");
import { createWriteStream } from "fs";
import { exit } from "process";
import { History, Transition, TimedStatus, CsvTemplate, Issue } from "./types";
import {
  buildCsv,
  calculateHowMuchTimeWasInEveryStatus,
  withoutNull,
} from "./utils";
import { config } from "./config";

const makeTransitionsFromChangelogHistory = (history: History) => {
  const { created, items } = history;

  const onlyStatusItems = items.filter(({ field }) => field === "status");

  if (onlyStatusItems.length > 1) {
    throw new Error("There are two status item instead of one in the history");
  }

  if (onlyStatusItems.length === 0) {
    return null;
  }

  const { fromString, toString } = onlyStatusItems[0];

  return { when: created, fromStatus: fromString, toStatus: toString };
};

export const makeTransitions = (issues: Issue[]): Transition[] => {
  return issues.map(({ key, changelog }) => {
    const transitions = changelog.histories
      .map((history) => {
        return makeTransitionsFromChangelogHistory(history);
      })
      .reverse();

    return { key, transitions: withoutNull(transitions) };
  });
};

const createTimedStatuses = (data: Issue[]) => {
  return makeTransitions(data).map((item) => {
    return {
      key: item.key,
      statuses: calculateHowMuchTimeWasInEveryStatus(config, item),
    };
  }) as TimedStatus[];
};

console.log("Start converting Jira issues to CSV...");

const timedStatuses = require("./data/timed-statuses.json") as TimedStatus[];
const csvTemplate = require("./data/csv-template.json") as CsvTemplate;
const csv = buildCsv(timedStatuses, csvTemplate, config);

console.log("Writting to the result.csv file...");

const STREAM_PATH = "./data/result.csv";
const STREAM = createWriteStream(STREAM_PATH);
STREAM.write(csv, () => {
  console.log("Done!");
  exit(0);
});

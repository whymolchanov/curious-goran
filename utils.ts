import { DateTime, Duration } from "luxon";
import { Config } from "./config";
import {
  Csv,
  CsvPresentation,
  CsvRow,
  CsvBuildConfig,
  TimeInStatus,
  Ticket,
  Transition,
} from "./types";

// example: [1,2,3,4] => [[1,2], [2,3], [3,4]]
export const createSlicedPairsFromArray = <T>(array: T[]): T[][] => {
  let result: T[][] = [];

  array.forEach((item, index) => {
    if (index + 1 === array.length) {
      return;
    }

    result.push([item, array[index + 1]]);
  });

  return result;
};

export const withoutNull = <T>(array: Array<T | null>): T[] => {
  const result: T[] = [];

  for (const item of array) {
    if (item !== null) {
      result.push(item);
    }
  }

  return result;
};

export const calculateHowMuchTimeWasInEveryStatus = (
  config: Pick<Config, "timeUnit">,
  source: Transition
): TimeInStatus => {
  const { transitions } = source;
  const transitionsWithoutSameStatuses = transitions.filter(
    (transition) => transition.fromStatus !== transition.toStatus
  );

  const slicedPairs = createSlicedPairsFromArray(
    transitionsWithoutSameStatuses
  );

  const arrayOfDurations = slicedPairs.map((pair) => {
    const [first, second] = pair;
    const firstDate = DateTime.fromISO(first.when);
    const secondDate = DateTime.fromISO(second.when);
    const delta: Duration = secondDate.diff(firstDate, [config.timeUnit]);

    return { [second.fromStatus]: Math.round(delta.get(config.timeUnit)) };
  });

  return arrayOfDurations.reduce((acc, item) => {
    const [key] = Object.keys(item);
    const [value] = Object.values(item);

    if (acc[key]) {
      acc[key] = acc[key] + value;
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});
};

export const buildCsv = (
  tickets: Ticket[],
  csvTemplate: CsvBuildConfig,
  config: Pick<Config, "setZeroInsteadOfNull">
): Csv => {
  const result: CsvPresentation = [];

  if (csvTemplate[0] !== "key") {
    throw new Error(
      'First column in CSV teamplate has to be "key"! Please add it to the CSV template as a first item'
    );
  }

  result.push(csvTemplate.join(", "));

  tickets.forEach(({ key, statuses }) => {
    const csvRow: (string | number | null)[] = csvTemplate.map((item) => {
      if (statuses[item] !== undefined) {
        return statuses[item];
      }

      return config.setZeroInsteadOfNull ? 0 : null;
    });
    csvRow[0] = key;

    result.push(csvRow.join(", "));
  });

  return result.join("\n");
};

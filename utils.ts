import {
  Csv,
  CsvPresentation,
  CsvRow,
  CsvTemplate,
  StatusesDurations,
  TimedStatus,
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
  source: Transition
): StatusesDurations => {
  const { transitions } = source;
  const transitionsWithoutSameStatuses = transitions.filter(
    (transition) => transition.fromStatus !== transition.toStatus
  );

  const slicedPairs = createSlicedPairsFromArray(
    transitionsWithoutSameStatuses
  );

  const arrayOfDurations = slicedPairs.map((pair) => {
    const [first, second] = pair;
    const delta = Date.parse(second.when) - Date.parse(first.when);
    const days = delta / (24 * 60 * 60 * 1000);

    return { [second.fromStatus]: Math.round(days) };
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
  timedStatuses: TimedStatus[],
  csvTemplate: CsvTemplate
): Csv => {
  const result: CsvPresentation = [];

  result.push(csvTemplate.join(", "));

  timedStatuses.forEach(({ key, statuses }, index) => {
    const csvRow: (string | number | null)[] = csvTemplate.map((item) => {
      if (statuses[item] !== undefined) {
        return statuses[item];
      }

      return null;
    });
    csvRow[0] = key;

    result.push(csvRow.join(", "));
  });

  return result.join("\n");
};

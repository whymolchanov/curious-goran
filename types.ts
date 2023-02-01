export type Csv = string;

export type CsvPresentation = CsvRow[];

export type CsvRow = string;

export type CsvTemplate = string[];

export interface TimedStatus {
  key: string;
  statuses: StatusesDurations;
}

export type StatusesDurations = Record<string, number>;

export interface Transition {
  key: string;
  transitions: {
    when: string;
    fromStatus: string;
    toStatus: string;
  }[];
}

interface HistoryItem {
  field: string;
  fromString: string;
  toString: string;
}

export interface History {
  created: string;
  items: HistoryItem[];
}

export interface Issue {
  key: string;
  changelog: {
    histories: History[];
  };
}

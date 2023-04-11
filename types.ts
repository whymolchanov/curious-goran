export type Csv = string;

export type CsvPresentation = CsvRow[];

export type CsvRow = string;

export interface CsvBuildConfig {
  interestedStatusesForTimeCalculations: string[];
};

export interface Ticket {
  key: string;
  statuses: TimeInStatus;
}

export type TimeInStatus = Record<string, number>;

export interface Transition {
  key: string;
  transitions: {
    when: string;
    fromStatus: string;
    toStatus: string;
  }[];
}

interface JiraTicketHistoryItem {
  field: string;
  fromString: string;
  toString: string;
}

export interface JiraTicketHistory {
  created: string;
  items: JiraTicketHistoryItem[];
}

export interface JiraTicket {
  key: string;
  changelog: {
    histories: JiraTicketHistory[];
  };
}

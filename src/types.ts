export type Csv = string;

export type CsvPresentation = CsvRow[];

export type CsvRow = string;

export type JiraTicketStatus = string;

export type JiraTicketTitle = string;

// example: "In review -> In progress"
export type StatusSwitchString = string;

export interface CsvBuildConfig {
  interestedStatusesForTimeCalculations: JiraTicketStatus[];
  switchesBetweenStatuses: StatusSwitchString[]
};

export type Count = number;
export type StatusSwitches = Record<StatusSwitchString, Count>;

export interface Ticket {
  key: string;
  title: JiraTicketTitle;
  timeInStatuses: TimeInStatus;
  switchesBetweenStatuses: StatusSwitches;
}

export type TimeInStatus = Record<JiraTicketStatus, number>;

export interface Transition {
  key: string;
  title: JiraTicketTitle;
  transitions: {
    when: string;
    fromStatus: JiraTicketStatus;
    toStatus: JiraTicketStatus;
  }[];
}

interface JiraTicketHistoryItem {
  field: string;
  // TODO(improvement): maybe this is JiraTicketStatus as well?
  fromString: string;
  toString: string;
}

export interface JiraTicketHistory {
  created: string;
  items: JiraTicketHistoryItem[];
}

export interface JiraTicket {
  key: string;
  fields: {
    summary: JiraTicketTitle;
  },
  changelog: {
    histories: JiraTicketHistory[];
  };
}

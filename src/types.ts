export type Csv = string;

export type CsvPresentation = CsvRow[];

export type CsvRow = string;

export type JiraTicketStatus = string;

// example: RET-666
export type JiraTicketKey = string;

export type JiraTicketUrl = string;

export type JiraTicketTitle = string;

// example: "In review -> In progress"
export type StatusSwitchString = string;

export type Count = number;
export type StatusSwitches = Record<StatusSwitchString, Count>;

export interface Ticket {
  url: JiraTicketUrl;
  title: JiraTicketTitle;
  timeInStatuses: TimeInStatus;
  switchesBetweenStatuses: StatusSwitches;
}

export type TimeInStatus = Record<JiraTicketStatus, number>;

export interface Transition {
  key: JiraTicketKey;
  title: JiraTicketTitle;
  transitions: {
    when: string;
    fromStatus: JiraTicketStatus;
    toStatus: JiraTicketStatus;
  }[];
}

interface JiraTicketHistoryItem {
  field: string;
  fromString: JiraTicketStatus;
  toString: JiraTicketStatus;
}

export interface JiraTicketHistory {
  created: string;
  items: JiraTicketHistoryItem[];
}

export interface JiraTicket {
  key: JiraTicketKey;
  fields: {
    summary: JiraTicketTitle;
  };
  changelog: {
    histories: JiraTicketHistory[];
  };
}

export type CsvBuildConfig = {
  interestedStatusesForTimeCalculations: JiraTicketStatus[];
  switchesBetweenStatuses: StatusSwitchString[];
};

export type TimeUnit = "days" | "hours";

export interface AdditionalConfig {
  timeUnit: TimeUnit;
  /**
   * If there is no value for particular status,
   * Curious Goran will write them as 0.
   * If you need empty spaces in place of obsolence
   * of particular statuses set here false.
   * */
  setZeroInsteadOfNull: boolean;
}

// TODO: think about this one
export type JqlConfig = {
  fileName: string;
  jql: string;
  jiraStatusesForCsv: CsvBuildConfig;
  additionalConfigs: AdditionalConfig;
}[];

export type Work = {
  fileName: string;
  url: string;
  jiraStatusesForCsv: CsvBuildConfig;
  additionalConfigs: AdditionalConfig;
};

import {
  JiraTicketHistory,
  Transition,
  Ticket,
  JiraTicket,
  StatusSwitches,
  StatusSwitchString,
  TimeUnit,
} from "./types";
import {
  calculateHowMuchTimeWasInEveryStatus,
  makeJiraTicketUrl,
  withoutNull,
} from "./utils";

import { config } from "dotenv";
config();

const makeTransitionsFromChangelogHistory = (history: JiraTicketHistory) => {
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

export const makeTransitions = (issues: JiraTicket[]): Transition[] => {
  return issues.map(({ key, fields: { summary }, changelog }) => {
    const transitions = changelog.histories
      .map((history) => {
        return makeTransitionsFromChangelogHistory(history);
      })
      .reverse();

    return { key, title: summary, transitions: withoutNull(transitions) };
  });
};

const calculateSwitches = (item: Transition): StatusSwitches => {
  const { transitions } = item;

  return transitions.reduce((acc: StatusSwitches, transition) => {
    const statusSwitchString: StatusSwitchString = [
      transition.fromStatus,
      transition.toStatus,
    ].join(" -> ");

    if (!acc[statusSwitchString]) {
      acc[statusSwitchString] = 0;
    }

    acc[statusSwitchString] = acc[statusSwitchString] + 1;

    return acc;
  }, {});
};

export const createTickets = (
  data: JiraTicket[],
  timeUnit: TimeUnit
): Ticket[] => {
  const baseUrl = process.env.JIRA_BASE_URL;

  if (!baseUrl) {
    throw new Error("You didn't specify JIRA_BASE_URL in the .env file.");
  }

  return makeTransitions(data).map((item) => {
    return {
      url: makeJiraTicketUrl(baseUrl, item.key),
      title: item.title,
      timeInStatuses: calculateHowMuchTimeWasInEveryStatus(timeUnit, item),
      switchesBetweenStatuses: calculateSwitches(item),
    };
  });
};

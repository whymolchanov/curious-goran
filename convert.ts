const issues = require("./data/source.json") as JiraTicket[];
import { createWriteStream } from "fs";
import { exit } from "process";
import { JiraTicketHistory, Transition, Ticket, JiraTicket, StatusSwitches, StatusSwitchString } from "./types";
import {
    calculateHowMuchTimeWasInEveryStatus,
    withoutNull,
} from "./utils";
import { config } from "./config";

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
    return issues.map(({ key, changelog }) => {
        const transitions = changelog.histories
            .map((history) => {
                return makeTransitionsFromChangelogHistory(history);
            })
            .reverse();

        return { key, transitions: withoutNull(transitions) };
    });
};

const calculateSwitches = (item: Transition): StatusSwitches => {
    const { transitions } = item;

    return transitions.reduce((acc: StatusSwitches, transition) => {
        const statusSwitchString: StatusSwitchString = [transition.fromStatus, transition.toStatus].join(' -> ');

        if (!acc[statusSwitchString]) {
            acc[statusSwitchString] = 0;
        }

        acc[statusSwitchString] = acc[statusSwitchString] + 1;

        return acc;
    }, {})
}

export const createTickets = (data: JiraTicket[]): Ticket[] => {
    return makeTransitions(data).map((item) => {
        return {
            key: item.key,
            timeInStatuses: calculateHowMuchTimeWasInEveryStatus(config, item),
            switchesBetweenStatuses: calculateSwitches(item),
        };
    });
};

const tickets = createTickets(issues);

const STREAM_PATH = "./data/tickets.json";
const STREAM = createWriteStream(STREAM_PATH);
STREAM.write(JSON.stringify(tickets), () => {
    console.log("Done!");
    exit(0);
});

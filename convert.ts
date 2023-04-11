const issues = require("./data/source.json");
import { createWriteStream } from "fs";
import { exit } from "process";
import { JiraTicketHistory, Transition, Ticket, JiraTicket } from "./types";
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

const createTimedStatuses = (data: JiraTicket[]) => {
    return makeTransitions(data).map((item) => {
        return {
            key: item.key,
            statuses: calculateHowMuchTimeWasInEveryStatus(config, item),
        };
    }) as Ticket[];
};

const timedStatuses = createTimedStatuses(issues);

const STREAM_PATH = "./data/tickets.json";
const STREAM = createWriteStream(STREAM_PATH);
STREAM.write(JSON.stringify(timedStatuses), () => {
    console.log("Done!");
    exit(0);
});

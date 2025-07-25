import { test } from "uvu";
import * as assert from "uvu/assert";
import { createTickets } from "../src/convert";
import { buildCsv } from "../src/make-csv";
import { CsvBuildConfig, JiraTicket } from "../src/types";
import {
  calculateHowMuchTimeWasInEveryStatus,
  createSlicedPairsFromArray,
  makeJiraTicketUrl,
  withoutNull,
  wrapStringsInBraces,
} from "../src/utils";

const JIRA_BASE_URL_FOR_TESTING = "https://super-puper.com";
const jiraTicketsData = require("./jira-tickets-data.json") as JiraTicket[];

test("createTickets", () => {
  process.env.JIRA_BASE_URL = JIRA_BASE_URL_FOR_TESTING;

  assert.equal(createTickets(jiraTicketsData, "hours"), [
    {
      url: `${JIRA_BASE_URL_FOR_TESTING}/browse/RET-3072`,
      title:
        "[Web] Treatment Monitoring Release Manager: add an error when it finds that it is a release branch with the same version as the lates release",
      timeInStatuses: {
        "In progress": 0,
        "In Review": 0,
        Tested: 0,
        "Ready to release": 325,
      },
      switchesBetweenStatuses: {
        "To Do -> In progress": 1,
        "In progress -> In Review": 1,
        "In Review -> Tested": 1,
        "Tested -> Ready to release": 1,
        "Ready to release -> Done": 1,
      },
    },
  ]);
});

test("createTickets: user forget to set JIRA_BASE_URL environment variable", () => {
  process.env.JIRA_BASE_URL = "";
  assert.throws(() => createTickets(jiraTicketsData, "hours"));
});

test("sliced pairs for numbers", () => {
  assert.equal(createSlicedPairsFromArray([1, 2, 3]), [
    [1, 2],
    [2, 3],
  ]);
  assert.equal(createSlicedPairsFromArray([1, 2, 3, 4]), [
    [1, 2],
    [2, 3],
    [3, 4],
  ]);
});

test("sliced pairs for strings", () => {
  assert.equal(createSlicedPairsFromArray(["1", "2", "3", "4"]), [
    ["1", "2"],
    ["2", "3"],
    ["3", "4"],
  ]);
});

test("sliced pairs for strings", () => {
  assert.equal(withoutNull([1, 2, 3, null]), [1, 2, 3]);
  assert.equal(withoutNull(["1", 2, 3, null]), ["1", 2, 3]);
});

test("calculateHowMuchTimeWasInEveryStatusInDays", () => {
  assert.equal(
    calculateHowMuchTimeWasInEveryStatus("days", {
      key: "RET-2922",
      title: "something for test",
      transitions: [
        {
          when: "2023-01-20T02:04:08.561+0300",
          fromStatus: "To Do",
          toStatus: "Waiting for Development",
        },
        {
          when: "2023-01-20T02:09:25.038+0300",
          fromStatus: "Waiting for Development",
          toStatus: "In progress",
        },
        {
          when: "2023-01-20T02:17:01.601+0300",
          fromStatus: "In progress",
          toStatus: "In Review",
        },
        {
          when: "2023-01-20T02:17:04.798+0300",
          fromStatus: "In Review",
          toStatus: "In Review",
        },
        {
          when: "2023-01-20T08:42:43.437+0300",
          fromStatus: "In Review",
          toStatus: "Ready for Testing",
        },
        {
          when: "2023-01-20T09:52:26.258+0300",
          fromStatus: "Ready for Testing",
          toStatus: "In Testing",
        },
        {
          when: "2023-01-20T14:19:50.324+0300",
          fromStatus: "In Testing",
          toStatus: "Ready to release",
        },
        {
          when: "2023-01-26T13:16:18.536+0300",
          fromStatus: "Ready to release",
          toStatus: "Done",
        },
      ],
    }),
    {
      "Waiting for Development": 0,
      "In progress": 0,
      "In Review": 0,
      "Ready for Testing": 0,
      "In Testing": 0,
      "Ready to release": 6,
    }
  );
});

test("calculateHowMuchTimeWasInEveryStatusInHours", () => {
  assert.equal(
    calculateHowMuchTimeWasInEveryStatus("hours", {
      key: "RET-2768",
      title: "super",
      transitions: [
        {
          when: "2022-10-28T13:13:13.345+0300",
          fromStatus: "To do",
          toStatus: "Selected for Development",
        },
        {
          when: "2022-10-28T14:00:21.912+0300",
          fromStatus: "Selected for Development",
          toStatus: "In progress",
        },
        {
          when: "2022-11-01T00:32:59.724+0300",
          fromStatus: "In progress",
          toStatus: "In Review",
        },
        {
          when: "2022-11-02T11:31:34.298+0300",
          fromStatus: "In Review",
          toStatus: "Ready for Testing",
        },
        {
          when: "2022-11-03T13:46:40.880+0300",
          fromStatus: "Ready for Testing",
          toStatus: "In Testing",
        },
        {
          when: "2022-11-06T00:22:09.367+0300",
          fromStatus: "In Testing",
          toStatus: "Tested",
        },
        {
          when: "2022-11-06T01:57:25.164+0300",
          fromStatus: "Tested",
          toStatus: "Ready to release",
        },
        {
          when: "2022-11-07T16:23:44.164+0300",
          fromStatus: "Ready to release",
          toStatus: "Tested",
        },
        {
          when: "2022-11-07T19:57:25.164+0300",
          fromStatus: "Tested",
          toStatus: "Ready to release",
        },
        {
          when: "2022-11-07T20:23:44.164+0300",
          fromStatus: "Ready to release",
          toStatus: "Done",
        },
        {
          when: "2022-11-08T16:24:50.948+0300",
          fromStatus: "Done",
          toStatus: "Done",
        },
      ],
    }),
    {
      "Selected for Development": 1,
      "In progress": 83,
      "In Review": 35,
      "Ready for Testing": 26,
      "In Testing": 59,
      Tested: 6,
      "Ready to release": 38,
    }
  );
});

const csvBuildConfig1: CsvBuildConfig = {
  interestedStatusesForTimeCalculations: [
    "Waiting for Development",
    "In Testing",
  ],
  switchesBetweenStatuses: [],
};
test("buildCsv with empty spaces", () => {
  assert.equal(
    buildCsv(
      [
        {
          url: `${JIRA_BASE_URL_FOR_TESTING}/browse/RET-2922`,
          title: "something for test",
          timeInStatuses: {
            "In progress": 0,
            "In Review": 0,
            "Ready for Testing": 0,
            "In Testing": 0,
            "Ready to release": 6,
          },
          switchesBetweenStatuses: {},
        },
      ],
      csvBuildConfig1,
      { setZeroInsteadOfNull: false }
    ),
    [
      [
        "url",
        "title",
        ...csvBuildConfig1.interestedStatusesForTimeCalculations,
      ].join(", "),
      `"${JIRA_BASE_URL_FOR_TESTING}/browse/RET-2922", "something for test", , 0`,
    ].join("\n")
  );
});

test("buildCsv with zeros", () => {
  assert.equal(
    buildCsv(
      [
        {
          url: `${JIRA_BASE_URL_FOR_TESTING}/browse/RET-2922`,
          title: "something for test",
          timeInStatuses: {
            "In progress": 0,
            "In Review": 0,
            "Ready for Testing": 0,
            "In Testing": 0,
            "Ready to release": 6,
          },
          switchesBetweenStatuses: {},
        },
      ],
      csvBuildConfig1,
      { setZeroInsteadOfNull: true }
    ),
    [
      "url, title, Waiting for Development, In Testing",
      `"${JIRA_BASE_URL_FOR_TESTING}/browse/RET-2922", "something for test", 0, 0`,
    ].join("\n")
  );
});

test("buildCsv: make a CSV with switches", () => {
  const tickets = [
    {
      url: `${JIRA_BASE_URL_FOR_TESTING}/browse/RET-3027`,
      title: "something for test, and more, and more",
      timeInStatuses: {
        "In progress": 0,
        "In Review": 0,
        Tested: 0,
        "Ready to release": 325,
      },
      switchesBetweenStatuses: {
        "To Do -> In progress": 1,
        "In progress -> In Review": 1,
        "In Review -> Tested": 1,
        "Tested -> Ready to release": 1,
        "Ready to release -> Done": 1,
      },
    },
  ];

  const csvBuildConfig: CsvBuildConfig = {
    interestedStatusesForTimeCalculations: [],
    switchesBetweenStatuses: ["To Do -> In progress"],
  };

  assert.equal(
    buildCsv(tickets, csvBuildConfig, { setZeroInsteadOfNull: true }),
    `url, title, To Do -> In progress\n"${JIRA_BASE_URL_FOR_TESTING}/browse/RET-3027", "something for test, and more, and more", 1`
  );
});

test("makeJiraTicketUrl function", () => {
  assert.equal(
    makeJiraTicketUrl("https://super-base.jira.com", "RET-666"),
    "https://super-base.jira.com/browse/RET-666"
  );
});

test("wrapStringInBraces", () => {
  assert.equal(wrapStringsInBraces(1), 1);
  assert.equal(wrapStringsInBraces(null), null);
  assert.equal(wrapStringsInBraces("super, puper"), '"super, puper"');
  assert.equal(wrapStringsInBraces("super, puper\n"), '"super, puper\n"');
});

test.run();

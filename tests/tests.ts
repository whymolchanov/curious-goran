import { test } from "uvu";
import * as assert from "uvu/assert";
import {
  buildCsv,
  calculateHowMuchTimeWasInEveryStatus,
  createSlicedPairsFromArray,
  withoutNull,
} from "../utils";

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

test("calculateHowMuchTimeWasInEveryStatus", () => {
  assert.equal(
    calculateHowMuchTimeWasInEveryStatus({
      key: "RET-2922",
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

test("calculateHowMuchTimeWasInEveryStatus", () => {
  assert.equal(
    calculateHowMuchTimeWasInEveryStatus({
      key: "RET-2768",
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
          toStatus: "Done",
        },
        {
          when: "2022-11-07T16:24:50.948+0300",
          fromStatus: "Done",
          toStatus: "Done",
        },
      ],
    }),
    {
      "Selected for Development": 0,
      "In progress": 3,
      "In Review": 1,
      "Ready for Testing": 1,
      "In Testing": 2,
      Tested: 0,
      "Ready to release": 2,
    }
  );
});

const csvTemplate = ["key", "Waiting for Development", "In Testing"];
test("buildCsv", () => {
  assert.equal(
    buildCsv(
      [
        {
          key: "RET-2922",
          statuses: {
            "Waiting for Development": 0,
            "In progress": 0,
            "In Review": 0,
            "Ready for Testing": 0,
            "In Testing": 0,
            "Ready to release": 6,
          },
        },
      ],
      csvTemplate
    ),
    [csvTemplate.join(", "), "RET-2922, 0, 0"].join("\n")
  );
});

test.run();

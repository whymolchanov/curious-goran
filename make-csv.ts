import { createWriteStream } from "fs";
import { exit } from "process";
import { Ticket, CsvBuildConfig } from "./types";
import {
  buildCsv,
} from "./utils";
import { config } from "./config";

console.log("Start converting Jira issues to CSV...");

const tickets = require("./data/tickets.json") as Ticket[];
const csvTemplate = require("./data/csv-build-config.json") as CsvBuildConfig;
const csv = buildCsv(tickets, csvTemplate, config);

console.log("Writting to the result.csv file...");

const STREAM_PATH = "./data/result.csv";
const STREAM = createWriteStream(STREAM_PATH);
STREAM.write(csv, () => {
  console.log("Done!");
  exit(0);
});

import { createWriteStream } from "fs";
import { exit } from "process";
import { config } from "./config";
import { createTickets } from "./convert";
import { get } from "./get";
import { buildCsv } from "./make-csv";
import { CsvBuildConfig, JiraTicket } from "./types";

const run = async () => {
    console.log("Curious Goran starting to work on your task...");
    const jiraTickets: JiraTicket[] = await get();
    const tickets = createTickets(jiraTickets);

    console.log("Start converting Jira issues to CSV...");

    const csvTemplate = require("../data/csv-build-config.json") as CsvBuildConfig;
    const csv = buildCsv(tickets, csvTemplate, config);

    console.log("Writting to the result.csv file...");

    const STREAM_PATH = "./data/result.csv";
    const STREAM = createWriteStream(STREAM_PATH);
    STREAM.write(csv, () => {
        console.log("Done!");
        exit(0);
    });
}

run().then(() => {
}).catch((error) => {
    console.log("Error happens:");
    console.log(error);
    exit(1);
});


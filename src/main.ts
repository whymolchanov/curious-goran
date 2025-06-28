import { createWriteStream } from "fs";
import { exit } from "process";
import { config } from "./config";
import { createTickets } from "./convert";
import { get } from "./get";
import { buildCsv } from "./make-csv";
import {
  CsvBuildConfig,
  CsvPresentation,
  JiraTicket,
  JqlConfig,
  Work,
} from "./types";
const jqls = require("../data/jql.json");

const searchForWork = (jqlConfig: JqlConfig): Work => {
  return jqlConfig.map(({ fileName, url }) => {
    return {
      fileName,
      url: `/search?expand=changelog&jql=${url}`,
    };
  });
};

const run = async () => {
  console.log("Curious Goran starting to work...");

  const workList = searchForWork(jqls);
  const streams = workList.map(({ fileName }) => {
    return createWriteStream(`./data/${fileName}.csv`);
  });
  const csvPresentations: CsvPresentation = [];

  for (const { fileName, url } of workList) {
    console.log(
      `Start working regarding ${fileName}.csv\nUsing this path ${url}`
    );
    const jiraTickets: JiraTicket[] = await get(url);
    const tickets = createTickets(jiraTickets);

    console.log("Start converting Jira issues to CSV...");
    const csvTemplate =
      require("../data/csv-build-config.json") as CsvBuildConfig;
    csvPresentations.push(buildCsv(tickets, csvTemplate, config));
  }

  console.log("Writing to files...");
  streams.forEach((stream, index) => {
    stream.write(csvPresentations[index], () => {
      stream.close();
    });
  });
};

run()
  .then(() => {
    console.log("Done!");
    exit(0);
  })
  .catch((error) => {
    console.log(error);
    exit(1);
  });

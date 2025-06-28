import { createWriteStream } from "fs";
import { exit } from "process";
import { createTickets } from "./convert";
import { get } from "./get";
import { buildCsv } from "./make-csv";
import { CsvPresentation, JiraTicket, JqlConfig, Work } from "./types";
const jqls = require("../src/config.json") as JqlConfig[];

const searchForWork = (jqlConfig: JqlConfig[]): Work[] => {
  return jqlConfig.map((config) => ({
    ...config,
    url: `/search?expand=changelog&jql=${config.jql}`,
  }));
};

const run = async () => {
  console.log("Curious Goran starting to work...");

  const workList = searchForWork(jqls);
  const streams = workList.map(({ fileName }) => {
    return createWriteStream(`./data/${fileName}.csv`);
  });
  const csvPresentations: CsvPresentation = [];

  for (const {
    fileName,
    url,
    jiraStatusesForCsv,
    additionalConfigs,
  } of workList) {
    console.log(
      `Start working regarding ${fileName}.csv\nUsing this path ${url}`
    );
    const jiraTickets: JiraTicket[] = await get(url);
    const tickets = createTickets(jiraTickets, additionalConfigs.timeUnit);

    console.log("Start converting Jira issues to CSV...");
    csvPresentations.push(
      buildCsv(tickets, jiraStatusesForCsv, additionalConfigs)
    );
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

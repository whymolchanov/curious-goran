import { createWriteStream } from "fs";
import { exit } from "process";
import { config } from "./config";
import { createTickets } from "./convert";
import { get } from "./get";
import { buildCsv } from "./make-csv";
import { CsvBuildConfig, CsvPresentation, JiraTicket, Work } from "./types";
const jqls = require('../data/jql.json') as Work;


const searchForWork = (): Work => {
    const JQL_ARGUMENT = 'jql';

    const [cliArg] = process.argv.slice(2);

    if (!cliArg) {
        throw new Error(
            "You have to use an argument.\nEither filterId or a jql.\nRead more about it in the README.md file"
        );
    }

    if (cliArg === JQL_ARGUMENT) {
        return jqls.map(({ fileName, url }) => {
            return {
                fileName,
                url: `/search?expand=changelog&jql=${url}`
            }
        })
    }

    const isArgAFilterId = !isNaN(Number(cliArg))
    if (isArgAFilterId) {
        return [{
            fileName: 'result',
            url: `/search?expand=changelog&jql=filter=${cliArg}`
        }]
    }

    throw new Error(
        "Sorry, this tool won't work without filter ID or jql.\nPlease, check the README.md file for reference"
    );
}


const run = async () => {
    console.log("Curious Goran starting to work...");

    // TODO(): test with filterId
    const workList = searchForWork();
    const streams = workList.map(({ fileName }) => {
        return createWriteStream(`./data/${fileName}.csv`);
    })
    const csvPresentations: CsvPresentation = [];

    for (const { fileName, url } of workList) {
        // TODO(): add a new approach to the README.md
        console.log(`Start working regarding ${fileName}.csv\nUsing this path ${url}`);
        const jiraTickets: JiraTicket[] = await get(url);
        const tickets = createTickets(jiraTickets);

        console.log("Start converting Jira issues to CSV...");
        const csvTemplate = require("../data/csv-build-config.json") as CsvBuildConfig;
        csvPresentations.push(buildCsv(tickets, csvTemplate, config));
    }

    console.log('Writing to files...');
    streams.forEach((stream, index) => {
        stream.write(csvPresentations[index], () => {
            stream.close();
        })
    });
}

run().then(() => {
    console.log('Done!');
    exit(0);
}).catch((error) => {
    console.log("Error happens:");
    console.log(error);
    exit(1);
});


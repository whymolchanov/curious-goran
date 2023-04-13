import axios from "axios";
import { createWriteStream } from "fs";
import { exit } from "process";

import { config } from "dotenv";
config();

// TODO(improvement): move all source code to the "src" folder.
import { JiraTicket } from "./types";

const STREAM = createWriteStream("./data/source.json");

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.JIRA_BASE_URL + "rest/api/2/",
  timeout: 15000,
  headers: {
    Authorization: `Basic ${process.env.JIRA_TOKEN_BASE_64}`,
  },
});

const getFilterUrl = async () => {
  const [filterId] = process.argv.slice(2);

  if (!filterId) {
    throw new Error(
      "Sorry, this tool won't work without filter ID. And now I don't see one"
    );
  }

  const { data } = await AXIOS_INSTANCE.get(`filter/${filterId}`);
  const { searchUrl } = data;

  return searchUrl;
};

const get = async () => {
  let totalNumber = Infinity;
  let result: JiraTicket[] = [];

  console.log("Getting right URL for your filter...");
  const filterUrl = await getFilterUrl();
  console.log("Getting your issues data...");

  while (result.length < totalNumber) {
    const { data } = await AXIOS_INSTANCE.get(
      // expand=changelog help us to get history of issues (without it we won't be able to calculate time)
      filterUrl + `&expand=changelog&startAt=${result.length}`
    );

    totalNumber = data.total;

    result = result.concat(data.issues);

    console.log(`There are ${totalNumber - result.length} issues more`);
  }
  console.log("Writting to the source.json file...");
  STREAM.write(JSON.stringify(result));
};

get()
  .then(() => {
    console.log("Process of getting issues has been completed");
    exit(0);
  })
  .catch((error) => {
    console.log("Error happens:");
    console.log(error);
  });

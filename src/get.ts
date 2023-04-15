import axios from "axios";

import { config } from "dotenv";
config();

import { JiraTicket } from "./types";

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.JIRA_BASE_URL + "/rest/api/2",
  timeout: 15000,
  headers: {
    Authorization: `Basic ${process.env.JIRA_TOKEN_BASE_64}`,
  },
});

export const get = async (url: string) => {
  let totalNumber = Infinity;
  let result: JiraTicket[] = [];

  while (result.length < totalNumber) {
    const { data } = await AXIOS_INSTANCE.get(`${url}&startAt=${result.length}`);

    if (!data.total) {
      throw new Error("I won't be able to receive any data from Jira");
    }

    totalNumber = data.total;

    result = result.concat(data.issues);

    console.log(`There are ${totalNumber - result.length} issues more`);
  }

  return result;
};

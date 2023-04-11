# Curious Goran

- Request data from Jira based on particular filter ID
- Create a CSV file with time statistics (in days or hours) on every ticket

#### Maybe in the future

- Build a chart with median for all presented tickets

---

## Setup

#### Authentication

[_read more here_](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/#supply-basic-auth-headers)

1. Create a token https://id.atlassian.com/manage-profile/security/api-tokens
2. Encode it `echo -n user@example.com:api_token_string | base64`
3. Put the token to `.env` file as `JIRA_TOKEN_BASE_64` (check `.env.example` file)

#### Base URL

4. Add base URL to `.env` file as `JIRA_BASE_URL` (check `.env.example` file)

#### CSV template

5. Check `data` folder and find `csv-build-config.example.json` file.
6. Add your own statuses to the csv in the order you would like.
7. Rename `csv-build-config.example.json` to `csv-build-config.json`

#### Config (optional)

8. Check `config.ts` file. There you will find the configuration for Curious Goran. If you need it, change fields in a way you like it.

---

## Request data by filter

1. Run `npm run get <filterId>` (example: `npm run get 666`)
2. Script will go through all pages, collect all JiraTickets data and put them to `./data/source.json`

---

## Convert JiraTickets to Tickets
*Ticket is a simplified version of a JiraTicket*
1. Run `npm run convert-jira-tickets-to-tickets`
2. Script will convert JiraTickets to Tickets and put them to `tickets.json`

---

## Build CSV
1. Run `npm run csv`
2. Script will get data from `./data/tickets.json` (where the Tickets is placed)
3. Filter out necessary data based on `data/csv-build-config.json`
4. Convert it to CSV with proper structure and put the result to the `./data/result.csv` file.

<!-- TODO(improve): rewrite README.md -->
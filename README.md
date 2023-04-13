# Curious Goran

- Request data from Jira based on particular filter ID
- Create a CSV file with time statistics (in days or hours) on every ticket and count how many times ticket switched from one status to another.

## Request data
1. Run `npm start <Jira filterId>` (example: `npm start 666`)


---

## Setup

### Authentication

[_read more here_](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/#supply-basic-auth-headers)

1. Create a token https://id.atlassian.com/manage-profile/security/api-tokens
2. Encode it `echo -n user@example.com:api_token_string | base64`
3. Put the token to `.env` file as `JIRA_TOKEN_BASE_64` (check `.env.example` file)

### Base URL

4. Add base URL to `.env` file as `JIRA_BASE_URL` (check `.env.example` file)

### CSV build config
*Curious Goran will add "key" and "title" to resulted CSV. So you shouldn't use these fields in the csv-build-convig.json*
1. Check `/data/csv-build-config.example.json` file.
2. Add your own statuses to the csv in the order you would like.
3. Rename `csv-build-config.example.json` to `csv-build-config.json`

### Curious Goran config (optional)

8. Check `/src/config.ts` file. There you will find the configuration for Curious Goran. If you need it, change fields in a way you like it.
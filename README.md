# Curious Goran

- Request data from Jira based on JQL
- Create a CSV file with time statistics (in days or hours) on every ticket and count how many times ticket switched from one status to another.

## Setup

### Authentication

[_read more here_](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/#supply-basic-auth-headers)

1. Create a token https://id.atlassian.com/manage-profile/security/api-tokens
2. Encode it `echo -n user@example.com:api_token_string | base64`
3. Put the token to `.env` file as `JIRA_TOKEN_BASE_64` (check `.env.example` file)

### Base URL

Add base URL to `.env` file as `JIRA_BASE_URL` (check `.env.example` file)

### Configure

1. Make copy of /src/config.example.json to /src/config.json
2. Rewrite the config.json file. Add your JQLs and statuses you want to see in resulting CSV

_Curious Goran will add "url" and "title" to resulted CSV. So you shouldn't use these fields in the /src/config.json_

## Request data

Run `npm start`

_Curious Goran will create a separate CSV file for each entry in the `/src/config.json` file._

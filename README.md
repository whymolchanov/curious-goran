# Curious Goran

- Request data from Jira based on JQL
- Create a CSV file with time statistics (in days or hours) on every ticket and count how many times ticket switched from one status to another.

## Request data

1. Run `npm start`
2. Curious Goran will create a separate CSV file for each entry in the `/data/jql.json` file.
   For example for following `/data/jql.json` Curious Goran will make two files --> `Bob Torn.csv` and `Super heroes team.csv`. In both of them there will be a result of request.

```
{
    [
        {
            "fileName": "Bob Torn",
            "jql": "assignee%20%3D5f7d8db66666666006f407c60",
        },
        {
            "fileName": "Super heroes team",
            "jql": "project%3D\"Super%20%26%20Heroes\"",
        },
    ]
}
```

---

## Setup

### Authentication

[_read more here_](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/#supply-basic-auth-headers)

1. Create a token https://id.atlassian.com/manage-profile/security/api-tokens
2. Encode it `echo -n user@example.com:api_token_string | base64`
3. Put the token to `.env` file as `JIRA_TOKEN_BASE_64` (check `.env.example` file)

### Base URL

Add base URL to `.env` file as `JIRA_BASE_URL` (check `.env.example` file)

### Configure

Add your JQLs and statuses you want to see in resulting CSV to the `/data/jql.json` file (check the example in the `/data/jql.example.json` file)

_Curious Goran will add "url" and "title" to resulted CSV. So you shouldn't use these fields in the /data/jql.json_

### Additional configuration (optional)

8. Check `/src/config.ts` file. There you will find the configuration for Curious Goran. If you need it, change fields in a way you like it.

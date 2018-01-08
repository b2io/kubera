# Kubera

> A project management dashboard for GitHub and Harvest.

## Usage

1. Authorize Kubera to use your GitHub and Harvest accounts.
2. Select the GitHub repository and Harvest project.
3. :money_with_wings: :chart:

## Authorization

### GitHub

Generate a Personal Access Token:

1. Log in to GitHub.
2. Navigate to https://github.com/settings/tokens.
3. Click "Generate new token".
4. Name the token "Kubera" and give it "repo", "read:org", and "read:user" scopes.
5. Record the token.

### Harvest

Generate a Personal Access Token:

1. Log in to Harvest.
2. Navigate to https://id.getharvest.com/developers.
3. Click "Create New Personal Access Token".
4. Name it "Kubera".
5. Record the token and account ID.

## Data Sources

### Estimates

Kubera understands your estimation process by looking at all issues on a GitHub repository. Estimates are assigned to an issue by using a specially constructed label.

Estimate labels should contain text of the form `@estimate(<Points>);`; e.g.: `@estimate(5); L`.

* `<Points>` is the estimated points; a positive integer.

### Sprints

Kubera ties your work into sprints using the projects on your GitHub repository. Projects are known to represent sprints by the data in their "Description" field.

Sprint projects should contain text of the form `@sprint(<Number>, <StartDate>, <EndDate>);`; e.g.: `@sprint(1, 20180101, 20180114);`.

* `<Number>` is the sprint number; a unique and sequential positive integer.
* `<StartDate>` is the start date; a date in the form `YYYYMMDD`.
* `<EndDate>` is the end date; a date in the form `YYYYMMDD`.

### Actuals

Kubera determines actual costs (in time and money) by cross-referencing a Harvest project to the configured sprint durations.

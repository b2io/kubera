# Kubera

> A project management dashboard for GitHub and Harvest.

## Usage

1. Authorize Kubera to use your GitHub and Harvest accounts.
3. Select the GitHub repository and Harvest project.
4. :money_with_wings: :chart:

## Data Sources

### Estimates

Kubera understands your estimation process by looking at all issues on a GitHub repository. Estimates are assigned to an issue by using a specially constructed label.

Estimate labels should contain text of the form `@estimate(<Points>);`; e.g.: `@estimate(5); L`.

- `<Points>` is the estimated points; a positive integer.

```graphql
query EstimatesQuery {
  repository(owner: "b2io", name: "kubera") {
    labels(first: 100) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          name
        }
      }
    }
  }
}
```

### Sprints

Kubera ties your work into sprints using the projects on your GitHub repository. Projects are known to represent sprints by the data in their "Description" field.

Sprint projects should contain text of the form `@sprint(<Number>, <StartDate>, <EndDate>);`; e.g.: `@sprint(1, 20180101, 20180114);`.

- `<Number>` is the sprint number; a unique and sequential positive integer.
- `<StartDate>` is the start date; a date in the form `YYYYMMDD`.
- `<EndDate>` is the end date; a date in the form `YYYYMMDD`.

```graphql
query SprintsQuery {
  repository(owner: "b2io", name: "kubera") {
    projects(first: 100) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          body
        }
      }
    }
  }
}
```

### Actuals

Kubera determines actual costs (in time and money) by cross-referencing a Harvest project to the configured sprint durations.

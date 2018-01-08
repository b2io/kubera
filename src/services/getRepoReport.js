import gql from 'graphql-tag';
import apolloClient from './apolloClient';

const query = gql`
  query RepoReportQuery($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      issues(first: 100) {
        edges {
          node {
            createdAt
            closedAt
            id
            title
            labels(first: 100) {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
      projects(first: 100) {
        edges {
          node {
            body
            id
            name
          }
        }
      }
    }
  }
`;

const isEstimateLabel = ({ name }) => name.match(/@estimate\([1-9]+\d*\);/);

const isSprintProject = ({ body }) =>
  body.match(/@sprint\([1-9]+\d*, \d{8}, \d{8}\);/);

const resolveEstimate = label =>
  parseInt(label.name.match(/@estimate\(([1-9]+\d*)\);/)[1], 10);

const resolveStory = issue => ({
  closedAt: issue.closedAt,
  estimate: resolveEstimate(issue.labels.find(isEstimateLabel)),
  id: issue.id,
  openedAt: issue.createdAt,
  title: issue.title,
});

const resolveSprint = project => {
  const [, number, startsAt, endsAt] = project.body.match(
    /@sprint\(([1-9]+\d*), (\d{8}), (\d{8})\);/,
  );

  return {
    endsAt,
    startsAt,
    id: project.id,
    name: project.name,
    number: parseInt(number, 10),
  };
};

const resolveReport = ({ data }) => {
  const stories = data.repository.issues.edges
    .map(e => e.node)
    .map(issue => ({
      ...issue,
      labels: issue.labels.edges.map(e => e.node),
    }))
    .filter(issue => issue.labels.some(isEstimateLabel))
    .map(resolveStory);
  const sprints = data.repository.projects.edges
    .map(e => e.node)
    .filter(isSprintProject)
    .map(resolveSprint);

  return { sprints, stories };
};

function getRepoReport(repo) {
  const [owner, name] = repo.name.split('/');

  return apolloClient
    .query({ query, variables: { name, owner } })
    .then(resolveReport);
}

export default getRepoReport;

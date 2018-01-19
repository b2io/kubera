import { format } from 'date-fns';
import gql from 'graphql-tag';
import { flatten, get, sortBy } from 'lodash';
import {
  concatMerge,
  pageableQuery,
  resolveCursors,
  someHasNextPage,
} from '../util';
import apolloClient from './apolloClient';

const pagingPaths = ['repository.issues', 'repository.projects'];

const fetchRepoReport = (repo, pagingInfo = [[true, null], [true, null]]) => {
  const [owner, name] = repo.name.split('/');
  const [issuesPaging, projectsPaging] = pagingInfo;

  return apolloClient
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        query RepoReportQuery($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            ${pageableQuery(...issuesPaging)`
              issues(first: 100, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                edges {
                  node {
                    createdAt
                    closedAt
                    id
                    number
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
            `}
            ${pageableQuery(...projectsPaging)`
              projects(first: 100, after: $cursor) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                edges {
                  node {
                    body
                    id
                    name
                  }
                }
              }
            `}
          }
        }
      `,
      variables: { name, owner },
    })
    .then(
      res =>
        someHasNextPage(res, pagingPaths)
          ? Promise.all([
              res,
              fetchRepoReport(repo, resolveCursors(res, pagingPaths)),
            ])
          : [res],
    )
    .then(flatten);
};

const isEstimateLabel = ({ name }) => name.match(/@estimate\([1-9]+\d*\);/);

const isSprintProject = ({ body }) =>
  body.match(/@sprint\([1-9]+\d*, \d{8}, \d{8}\);/);

const resolveEstimate = label =>
  parseInt(label.name.match(/@estimate\(([1-9]+\d*)\);/)[1], 10);

const resolveStory = issue => ({
  closedAt: issue.closedAt ? format(issue.closedAt) : null,
  estimate: resolveEstimate(issue.labels.find(isEstimateLabel)),
  id: issue.id,
  number: issue.number,
  openedAt: format(issue.createdAt),
  title: issue.title,
});

const resolveSprint = project => {
  const [, number, startsAt, endsAt] = project.body.match(
    /@sprint\(([1-9]+\d*), (\d{8}), (\d{8})\);/,
  );

  return {
    endsAt: format(endsAt),
    id: project.id,
    name: project.name,
    number: parseInt(number, 10),
    startsAt: format(startsAt),
  };
};

const resolveReport = ({ data }) => {
  const stories = sortBy(
    get(data.repository, 'issues.edges', [])
      .map(e => e.node)
      .map(issue => ({
        ...issue,
        labels: issue.labels.edges.map(e => e.node),
      }))
      .filter(issue => issue.labels.some(isEstimateLabel))
      .map(resolveStory),
    'number',
  );
  const sprints = sortBy(
    get(data.repository, 'projects.edges', [])
      .map(e => e.node)
      .filter(isSprintProject)
      .map(resolveSprint),
    'number',
  );

  return { sprints, stories };
};

function getRepoReport(repo) {
  return fetchRepoReport(repo)
    .then(responses =>
      responses.reduce(
        (report, res) => concatMerge(report, resolveReport(res)),
        {},
      ),
    )
    .catch(() =>
      Promise.reject('Unable to retrieve your sprints and stories.'),
    );
}

export default getRepoReport;

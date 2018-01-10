import format from 'date-fns/format';
import gql from 'graphql-tag';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import sortBy from 'lodash/sortBy';
import apolloClient from './apolloClient';

const afterParam = value => (value ? `, after: "${value}"` : '');

const someHasNextPage = (res, paths) =>
  paths.some(path => get(res.data, [path, 'pageInfo.hasNextPage'].join('.')));

const resolveCursors = (res, paths) =>
  paths.map(path => get(res.data, [path, 'pageInfo.endCursor'].join('.')));

const concatMerge = (object, other) =>
  mergeWith(
    object,
    other,
    (objectValue, sourceValue) =>
      isArray(objectValue) ? objectValue.concat(sourceValue) : undefined,
  );

const fetchRepoReport = (repo, cursors = []) => {
  const [owner, name] = repo.name.split('/');
  const [issuesCursor, projectsCursor] = cursors;

  return apolloClient.query({
    query: gql`
      query RepoReportQuery($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          issues(first: 100${afterParam(issuesCursor)}) {
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
          projects(first: 100${afterParam(projectsCursor)}) {
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
        }
      }
    `,
    variables: { name, owner },
  });
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
    data.repository.issues.edges
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
    data.repository.projects.edges
      .map(e => e.node)
      .filter(isSprintProject)
      .map(resolveSprint),
    'number',
  );

  return { sprints, stories };
};

const pagingPaths = ['repository.issues', 'repository.projects'];

function getRepoReport(repo) {
  return fetchRepoReport(repo)
    .then(
      res =>
        someHasNextPage(res, pagingPaths)
          ? Promise.all([
              res,
              fetchRepoReport(repo, resolveCursors(res, pagingPaths)),
            ])
          : [res],
    )
    .then(responses =>
      responses.reduce(
        (report, res) => concatMerge(report, resolveReport(res)),
        {},
      ),
    );
}

export default getRepoReport;

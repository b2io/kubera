import gql from 'graphql-tag';
import uniqBy from 'lodash/uniqBy';
import apolloClient from './apolloClient';

const query = gql`
  query RepositoriesQuery {
    viewer {
      organizations(first: 100) {
        edges {
          node {
            repositories(first: 100) {
              edges {
                node {
                  id
                  nameWithOwner
                }
              }
            }
          }
        }
      }
      repositories(first: 100) {
        edges {
          node {
            id
            nameWithOwner
          }
        }
      }
    }
  }
`;

const resolveRepo = repo => ({
  id: repo.id,
  name: repo.nameWithOwner,
});

const resolveRepos = ({ data }) => {
  const orgRepos = data.viewer.organizations.edges
    .map(e => e.node.repositories.edges)
    .reduce(
      (result, edges) => result.concat(edges.map(e => resolveRepo(e.node))),
      [],
    );
  const personalRepos = data.viewer.repositories.edges.map(e =>
    resolveRepo(e.node),
  );

  return uniqBy([...orgRepos, ...personalRepos], 'id');
};

function getRepos() {
  return apolloClient.query({ query }).then(resolveRepos);
}

export default getRepos;

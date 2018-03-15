import { flatMap, sortBy, times } from 'lodash';
import readStoredCredentials from './readStoredCredentials';

const resolveProject = project => ({
  id: project.id,
  name: `${project.client.name}/${project.name}`,
});

const fetchProjectsPage = (token, accountId, page) =>
  fetch(`https://api.harvestapp.com/v2/projects?is_open=true&page=${page}`, {
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Harvest-Account-Id': accountId,
    }),
  }).then(res => res.json());

function getProjects(page = 1) {
  const { harvestAccountId, harvestToken } = readStoredCredentials();

  return fetchProjectsPage(harvestToken, harvestAccountId, 1)
    .then(res =>
      Promise.all([
        res,
        ...times(res.total_pages - 1, n =>
          fetchProjectsPage(harvestToken, harvestAccountId, n + 2),
        ),
      ]).then(responses =>
        sortBy(
          flatMap(responses, res => res.projects.map(resolveProject)),
          'name',
        ),
      ),
    )
    .catch(() => Promise.reject('Unable to retrieve your projects.'));
}

export default getProjects;

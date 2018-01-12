import _ from 'lodash';
import store, { credentialsSelector } from '../redux';

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
  const { harvestAccountId, harvestToken } = credentialsSelector(
    store.getState(),
  );

  return fetchProjectsPage(harvestToken, harvestAccountId, 1).then(res =>
    Promise.all([
      res,
      ..._.times(res.total_pages - 1, n =>
        fetchProjectsPage(harvestToken, harvestAccountId, n + 2),
      ),
    ]).then(responses =>
      _.sortBy(
        _.flatMap(responses, res => res.projects.map(resolveProject)),
        'name',
      ),
    ),
  );
}

export default getProjects;

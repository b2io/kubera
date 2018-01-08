import store, { credentialsSelector } from '../redux';

const resolveProject = project => ({
  id: project.id,
  name: `${project.client.name}/${project.name}`,
});

function getProjects() {
  const { harvestAccountId, harvestToken } = credentialsSelector(
    store.getState(),
  );

  return fetch('https://api.harvestapp.com/v2/projects', {
    headers: new Headers({
      Authorization: `Bearer ${harvestToken}`,
      'Harvest-Account-Id': harvestAccountId,
    }),
  })
    .then(res => res.json())
    .then(res => res.projects.map(resolveProject));
}

export default getProjects;

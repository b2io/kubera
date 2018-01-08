import store, { credentialsSelector } from '../redux';

const resolveTimeEntry = timeEntry => ({
  hours: timeEntry.hours,
  id: timeEntry.id,
  recordedAt: timeEntry.spent_date,
  task: timeEntry.task.name,
  user: timeEntry.user.name,
});

function getProjectReport(project) {
  const { harvestAccountId, harvestToken } = credentialsSelector(
    store.getState(),
  );

  return fetch(
    `https://api.harvestapp.com/v2/time_entries?project_id=${project.id}`,
    {
      headers: new Headers({
        Authorization: `Bearer ${harvestToken}`,
        'Harvest-Account-Id': harvestAccountId,
      }),
    },
  )
    .then(res => res.json())
    .then(res => ({ timeEntries: res.time_entries.map(resolveTimeEntry) }));
}

export default getProjectReport;

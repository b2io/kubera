import { format } from 'date-fns';
import { flatMap, sortBy, times } from 'lodash';
import readStoredCredentials from './readStoredCredentials';

const resolveReference = extRef =>
  extRef && extRef.service === 'github.com' ? extRef.id : null;

const resolveTimeEntry = timeEntry => ({
  hours: timeEntry.hours,
  id: timeEntry.id,
  recordedAt: format(timeEntry.spent_date),
  reference: resolveReference(timeEntry.external_reference),
  task: timeEntry.task.name,
  user: timeEntry.user.name,
});

const fetchProjectReportPage = (project, token, accountId, page) =>
  fetch(
    `https://api.harvestapp.com/v2/time_entries?project_id=${
      project.id
    }&page=${page}`,
    {
      headers: new Headers({
        Authorization: `Bearer ${token}`,
        'Harvest-Account-Id': accountId,
      }),
    },
  ).then(res => res.json());

function getProjectReport(project) {
  const { harvestAccountId, harvestToken } = readStoredCredentials();

  return fetchProjectReportPage(project, harvestToken, harvestAccountId, 1)
    .then(res =>
      Promise.all([
        res,
        ...times(res.total_pages - 1, n =>
          fetchProjectReportPage(
            project,
            harvestToken,
            harvestAccountId,
            n + 2,
          ),
        ),
      ]).then(responses => ({
        timeEntries: sortBy(
          flatMap(responses, res => res.time_entries.map(resolveTimeEntry)),
          'recordedAt',
        ),
      })),
    )
    .catch(() => Promise.reject('Unable to retrieve your time entries.'));
}

export default getProjectReport;

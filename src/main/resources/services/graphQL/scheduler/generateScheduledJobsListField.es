//import {toStr} from '@enonic/js-utils';

import {APP_EXPLORER} from '/lib/explorer/model/2/constants';
import {list} from '/lib/graphql';
import {list as listJobs} from '/lib/xp/scheduler';


export function generateScheduledJobsListField({
	GQL_TYPE_JOB
}) {
	return {
		resolve: (/*env*/) => {
			//log.debug(`env:${toStr(env)}`);
			const scheduledJobs = listJobs()
				.filter(({descriptor}) => descriptor.startsWith(APP_EXPLORER))
				.map(({
					config: {
						collectionId
					},
					descriptor,
					enabled,
					schedule
				}) => ({
					collectionId,
					descriptor,
					enabled,
					schedule
				}));
			//log.debug(`scheduledJobs:${toStr(scheduledJobs)}`);
			return scheduledJobs;
		}, // resolve
		type: list(GQL_TYPE_JOB)
	};
}


/* Example query
{
	listScheduledJobs {
		collectionId
		descriptor
		enabled
		schedule {
			timeZone
			type
			value
		}
	}
}
*/

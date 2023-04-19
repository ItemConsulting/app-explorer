import type {
	EnonicXpRequest,
	Headers
} from '@enonic-types/lib-explorer/Request.d';

import {
	//RESPONSE_TYPE_JSON,
	RESPONSE_TYPE_HTML,
	forceArray,
	startsWith//,
	//toStr
} from '@enonic/js-utils';
import {resolve} from 'uri-js';
import {
	NT_API_KEY,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hash} from '/lib/explorer/string/hash';
import {coerceApiKey} from '../../services/graphQL/apiKey/coerceApiKey';
import {AUTH_PREFIX} from '../constants';
import lcKeys from '@enonic/js-utils/object/lcKeys';



export function list(request :EnonicXpRequest) {
	//log.debug('request:%s', toStr(request));

	const { // HTTP/2 uses lowercase header keys
		authorization // 'Explorer-Api-Key XXXX'
	} = lcKeys(request.headers) as Headers;

	if(!authorization) {
		log.error(`authorization header missing!`);
		return {
			//body: '{}',
			//contentType: RESPONSE_TYPE_JSON,
			status: 401
		}; // Unauthorized
	}
	if(!startsWith(authorization, AUTH_PREFIX)) {
		log.error(`Invalid authorization header:${authorization}!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKey = authorization.substring(AUTH_PREFIX.length);
	//log.debug(`apiKey:${toStr(apiKey)}`);
	if (!apiKey) {
		log.error(`ApiKey not found in authorization header:${authorization}!`);
		return { status: 401 }; // Unauthorized
	}
	const hashedApiKey = hash(apiKey);
	//log.debug(`hashedApiKey:${toStr(hashedApiKey)}`);

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const matchingApiKeys = explorerRepoReadConnection.query({
		count: -1,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'key',
						values: [hashedApiKey]
					}
				},{
					hasValue: {
						field: '_nodetype',
						values: [NT_API_KEY]
					}
				}]
			}
		},
		query: ''
	});
	//log.debug(`matchingApiKeys:${toStr(matchingApiKeys)}`);
	if(matchingApiKeys.total !== 1) {
		log.error(`Unique apiKey:${apiKey} not found!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKeyNode = coerceApiKey(explorerRepoReadConnection.get(matchingApiKeys.hits[0].id));
	//log.debug(`apiKeyNode:${toStr(apiKeyNode)}`);
	const {collections} = apiKeyNode;
	//log.debug(`collections:${toStr(collections)}`);
	const {
		path
	} = request;
	const parentHref = resolve(path, '..');
	//log.debug('parentHref:%s', toStr(parentHref));

	return {
		body: `<html>
	<head>
		<title>Collections - Version 1 - API documentation</title>
	</head>
	<body>
		<h1>API documentation</h1>
		<h2>Collections</h2>
		<ul>
			<li><a href="${parentHref}">..</a></li-->
			${forceArray(collections).map((collection) => `<li><a href="${path}/collection/${collection}">${collection}</a></li>`).join('\n')}
		</ul>
	</body>
</html>`,
		contentType: RESPONSE_TYPE_HTML
	};
} // list

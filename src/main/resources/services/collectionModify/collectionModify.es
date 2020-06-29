//import {toStr} from '/lib/util';

import {
	NT_COLLECTION,
	PRINCIPAL_EXPLORER_WRITE,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {collection} from '/lib/explorer/model/2/nodeTypes/collection'
import {connect} from '/lib/explorer/repo/connect';
import {modify} from '/lib/explorer/node/modify';


export function post({
	body: json
}) {
	//log.info(`json:${json}`);

	const obj = JSON.parse(json);

	const writeConnection = connect({
		principals: [PRINCIPAL_EXPLORER_WRITE]
	});

	// WARNING If the uses changes name, this will trigger a failing rename!
	//obj._name = obj.name;
	if (obj.name !== obj._name) {
		const moveParams = {
			source: obj._path,
			target: obj.name
		};
		//log.info(`moveParams:${toStr({moveParams})}`);
		const boolMoved = writeConnection.move(moveParams);
		if (boolMoved) {
			obj._name = obj.name;
		}
	}

	obj.collector.configJson = JSON.stringify(obj.collector.config); // ForceArray workaround:
	//log.info(`obj:${toStr({obj})}`);

	const params = collection(obj); // Strips _id, _path
	//log.info(`params:${toStr({params})}`);

	const node = modify({
		__connection: writeConnection,
		...params
	});

	const body = {};
	let status = 200;
	if (node) {
		body.name = node._name;
		body.displayName = node.displayName;
	} else {
		body.error = `Something went wrong when trying to modify collection ${name}`;
		status = 500;
	}
	return {
		body,
		contentType: RT_JSON,
		status
	};
} // post

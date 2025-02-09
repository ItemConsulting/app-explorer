import type {InterfaceNode} from '/lib/explorer/types/Interface.d';

//import {toStr} from '@enonic/js-utils';

import {getInterfaceQuery} from '../queries/getInterfaceQuery';


type getInterfaceResponse = {
	getInterface :InterfaceNode/*{
		_id :string
		_name :string
		_path :string
		_versionKey :string
		collectionIds :Array<string>
		fields :Array<{
			boost :number
			name :string
		}>
		stopWords :Array<string>
		synonymIds :Array<string>
	}*/
}


export function fetchInterfaceGet({
	handleData = () => {},
	url,
	variables: {
		_id
	}
} :{
	handleData :(data :getInterfaceResponse) => void
	url :string
	variables :{
		_id :string
	}
}) {
	//console.debug('fetchInterfaceGet({url:', url, ', _id:', _id, '})');
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type':	'application/json'
		},
		body: JSON.stringify({
			query: `{${getInterfaceQuery({_id})}}`
		})
	})
		.then(response => response.json())
		.then(json => {
			//console.debug('fetchInterfaceGet({url:', url, ', _id:', _id, '}) --> json', json);
			handleData(json.data);
		});
}

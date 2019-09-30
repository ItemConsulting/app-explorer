import {
	PRINCIPAL_EXPLORER_READ,
	RT_JSON
} from '/lib/explorer/model/2/constants';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {getFields} from '/lib/explorer/field/getFields';
import {getFieldValues} from '/lib/explorer/field/getFieldValues';
import {query} from '/lib/explorer/interface/query';
import {connect} from '/lib/explorer/repo/connect';
import {query as getStopWords} from '/lib/explorer/stopWords/query';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';


export function get() {
	const connection = connect({principals: [PRINCIPAL_EXPLORER_READ]});

	const fieldValuesArray = getFieldValues({connection}).hits;
	const fieldValuesObj = {};
	fieldValuesArray.forEach(({_path, displayName, field, value}) => {
		/*if (!fieldValuesObj[field]) {fieldValuesObj[field] = []}
		fieldValuesObj[field].push({
			label: displayName,
			value: _name,
			path: _path
		});*/
		if (!fieldValuesObj[field]) {fieldValuesObj[field] = {}}
		fieldValuesObj[field][value] = {
			//key: value,
			text: displayName,
			path: _path//,
			//value
		};
	});

	const fieldsArray = getFields({connection}).hits.map(({displayName, key, _path}) => ({
		key,
		text: displayName,
		path: _path,
		value: key,
		values: fieldValuesObj[key]
	}));
	const fieldsObj = {};
	fieldsArray.forEach(({
		key,
		//label,
		path,
		text,
		//value,
		values
	}) => {
		fieldsObj[key] = {
			//key,
			//label,
			path,
			text,
			values
		};
	});

	const interfaces = query({connection});
	interfaces.hits = interfaces.hits.map(({_id: id, _name: name, displayName}) => ({displayName, id, name}));

	const stopWordOptions = getStopWords({connection}).hits.map(({displayName, name}) => ({
		key: name,
		text: displayName,
		value: name
	}));

	return {
		body: {
			collectionOptions: queryCollections({connection}).hits.map(({
				displayName: text,
				_name: key
			}) => ({
				key,
				text,
				value: key
			})),
			fieldsObj,
			interfaces,
			stopWordOptions,
			thesauriOptions: getThesauri({connection}).hits.map(({displayName, name}) => ({
				key: name,
				text: displayName,
				value: name
			}))
		},
		contentType: RT_JSON
	};
} // function get

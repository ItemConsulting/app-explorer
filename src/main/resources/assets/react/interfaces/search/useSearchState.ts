import type {
	StrictDropdownItemProps,
	PaginationProps,
} from 'semantic-ui-react';
import type {InterfaceField} from '@enonic-types/lib-explorer/Interface.d';



import {HTTP_HEADERS} from '@enonic/explorer-utils';
import {useWhenInitAsync} from '@seamusleahy/init-hooks';
import * as gql from 'gql-query-builder';
import * as React from 'react';
import useJsonModalState from '../../components/modals/useJsonModalState';
import useSearchInterface from '../useSearchInterface';
import {useUpdateEffect} from '../../utils/useUpdateEffect';


type InterfaceName = string;
type SearchString = string;

export type SearchProps = {
	basename: string
	servicesBaseUrl: string
	//documentTypesAndFields ?:Record<string,Fields>
	fields?: InterfaceField[]
	firstColumnWidth?: 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15

	interfaceNameState: InterfaceName
	setInterfaceNameState: React.Dispatch<React.SetStateAction<InterfaceName>>

	interfaceOptions?: StrictDropdownItemProps[]

	searchString?: SearchString
	setSearchString: React.Dispatch<React.SetStateAction<SearchString>>
}


const DEBUG_DEPENDENCIES = false;

export function useSearchState({
	basename,
	interfaceNameState,
	servicesBaseUrl,
	// Optional
	fieldsProp = [],
	searchString = '',
}: {
	basename: string
	interfaceNameState: string
	searchString?: SearchString
	servicesBaseUrl: string
	// Optional
	fieldsProp?: InterfaceField[]
}) {
	// console.debug('useSearchState fieldsProp', fieldsProp);
	// console.debug('useSearchState interfaceName', interfaceNameState);

	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	// const [boolOnChange, setBoolOnChange] = React.useState(false);
	//console.debug('Search boolOnChange', boolOnChange);
	const [initializing, setInitializing] = React.useState(true);
	const [interfaceCollectionCount, setInterfaceCollectionCount] = React.useState<number>();
	const [interfaceDocumentCount, setInterfaceDocumentCount] = React.useState<number>();
	const [page, setPage] = React.useState(1);
	const {
		state: jsonModalState,
		setState: setJsonModalState
	} = useJsonModalState();

	const [loading, setLoading] = React.useState(false);
	//console.debug('Search loading', loading);
	const [
		perPage,
		// setPerPage,
	] = React.useState(10);

	//const [cache, setCache] = React.useState({} as Cache);
	//console.debug('Search cache', cache);

	const [start, setStart] = React.useState(0);

	const {
		resultState,
		searchedStringState,
		searchFunction,
	} = useSearchInterface({
		basename,
		fieldsProp,
		interfaceNameState,
		setLoading
	});

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks
	//──────────────────────────────────────────────────────────────────────────
	const getInterfaceCollectionCount = React.useCallback(() => {
		if (interfaceNameState === 'default') {
			return fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: { // HTTP/2 uses lowercase header keys
					'content-type':	'application/json'
				},
				body: JSON.stringify(gql.query({
					operation: 'queryCollections',
					fields: ['total']
				}))
			})
				.then(response => response.json())
				.then(json => {
					// console.debug('json', json);
					setInterfaceCollectionCount(json.data.queryCollections.total);
				});
		} else {
			return fetch(`${servicesBaseUrl}/graphQL`, {
				method: 'POST',
				headers: { // HTTP/2 uses lowercase header keys
					'content-type':	'application/json'
				},
				body: JSON.stringify(gql.query({
					operation: 'queryInterfaces',
					fields: [{
						hits: [
							'_name',
							'collectionIds'
						]
					}]
				}))
			})
				.then(response => response.json())
				.then(json => {
					// console.debug('json', json);
					const {hits} = json.data.queryInterfaces
					let found = false;
					for (let i = 0; i < hits.length; i++) {
						const {
							_name,
							collectionIds
						} = hits[i];
						if (_name === interfaceNameState) {
							found = true;
							setInterfaceCollectionCount(collectionIds.length);
						}
					} // for
					if (!found) {
						setInterfaceCollectionCount(0);
					}
				});
		}
	}, [
		interfaceNameState,
		servicesBaseUrl
	]);

	const getInterfaceDocumentCount = React.useCallback(() => {
		// console.debug('getInterfaceDocumentCount interfaceNameState:', interfaceNameState);
		return fetch(`${basename}/api/v1/interface`, {
			method: 'POST',
			headers: { // HTTP/2 uses lowercase header keys
				'content-type':	'application/json',
				[HTTP_HEADERS.EXPLORER_INTERFACE_NAME.toLowerCase()]: interfaceNameState,
			},
			body: JSON.stringify(gql.query({
				operation: 'interface',
				fields: [{
					operation: 'search',
					variables: {
						count: {
							value: 0
						},
						// query: {
						// 	required: false,
						// 	type: 'QueryDSL',
						// 	value: {
						// 		matchAll: {}
						// 	}
						// }
					},
					fields: ['total']
				}]
			}))
		})
			.then(response => response.json())
			.then(json => {
				// console.debug('json', json);
				// console.debug('setInterfaceDocumentCount:', json.data.interface.search.total);
				setInterfaceDocumentCount(json.data.interface.search.total);
			});
	}, [
		basename,
		interfaceNameState,
	]);

	const handlePaginationChange = React.useCallback((
		_event: React.MouseEvent<HTMLAnchorElement>,
		data: PaginationProps
	) => {
		const {activePage: newPage} = data;
		DEBUG_DEPENDENCIES && console.debug('handlePaginationChange callback called. newPage:', newPage);
		setPage(newPage as number);
		const newStart = (newPage as number - 1 ) * perPage;
		// if (newStart !== start) {
		// 	setStart(newStart)
		// }
		searchFunction({
			searchString,
			start: newStart
		});
	}, [ // The callback is not executed when it's deps changes. Only the reference to the callback is updated.
		perPage,
		searchFunction,
		searchString,
		// start
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Init only
	//──────────────────────────────────────────────────────────────────────────
	useWhenInitAsync(() => {
		Promise.all([
			getInterfaceCollectionCount(),
			getInterfaceDocumentCount(),
			searchFunction({
				searchString,
				start: 0
			})
		]).then(() => {
			setInitializing(false);
		})
	});

	//──────────────────────────────────────────────────────────────────────────
	// Update only (not init)
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		// console.debug('update page:', page, 'perPage:', perPage, 'start:', start);
		const newStart = (page as number - 1 ) * perPage;
		if (newStart !== start) {
			setStart(newStart)
		}
	}, [
		page,
		perPage,
		start
	]);

	useUpdateEffect(() => {
		getInterfaceCollectionCount();
		getInterfaceDocumentCount();
		searchFunction({
			searchString,
			start: 0
		})
	},[interfaceNameState]);

	//──────────────────────────────────────────────────────────────────────────
	// Returns
	//──────────────────────────────────────────────────────────────────────────
	return {
		// boolOnChange, setBoolOnChange,

		interfaceCollectionCount, setInterfaceCollectionCount,
		interfaceDocumentCount, setInterfaceDocumentCount,
		handlePaginationChange,
		initializing,
		jsonModalState, setJsonModalState,
		loading, setLoading,
		page, setPage,
		perPage, // setPerPage,
		resultState,
		searchFunction,
		searchedStringState,
		start, // setStart,
	}
}

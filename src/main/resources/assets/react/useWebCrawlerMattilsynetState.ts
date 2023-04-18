import type {
	CollectorComponentRef,
	CollectorComponentAfterResetFunction,
	CollectorComponentValidateFunction
} from '/lib/explorer/types/index.d';


import {
	forceArray,
	isSet,
} from '@enonic/js-utils';
import * as React from 'react';
import {useUpdateEffect} from './utils/useUpdateEffect';


export type CollectorConfigMT = {
	baseUri?: string
	excludes?: string|string[]
	excludeSelectors?: string|string[]
	keepHtml?: boolean
	userAgent?: string
}


export function useWebCrawlerMattilsynetState({
	collectorConfig,
	ref,
	setCollectorConfig,
	setCollectorConfigErrorCount
} :{
	collectorConfig :CollectorConfigMT
	ref :CollectorComponentRef<CollectorConfigMT>
	setCollectorConfig :(param :CollectorConfigMT|((prevCollectorConfig :CollectorConfigMT) => CollectorConfigMT)) => void
	setCollectorConfigErrorCount :(collectorConfigErrorCount :number) => void
}) {
	//──────────────────────────────────────────────────────────────────────────
	// Avoiding derived state, by simply "symlinking"
	//──────────────────────────────────────────────────────────────────────────
	const baseUri = collectorConfig
		? (collectorConfig.baseUri || '')
		: '';

	const excludesArray = collectorConfig && collectorConfig.excludes ? forceArray(collectorConfig.excludes) : undefined; // Avoid derived state, so don't wrap with useState!
	//console.debug('excludesArray', excludesArray);

	const setExcludesArray = (newExcludesArray :Array<string>) => setCollectorConfig(prevCollectorConfig => {
		//console.debug('setExcludesArray newExcludesArray', newExcludesArray);
		return {
			...prevCollectorConfig,
			excludes: newExcludesArray
		};
	});

	const excludeSelectorsArray = collectorConfig && collectorConfig.excludeSelectors ? forceArray(collectorConfig.excludeSelectors) : undefined; // Avoid derived state, so don't wrap with useState!

	const setExcludeSelectorsArray = (newExcludeSelectorsArray: Array<string>) => setCollectorConfig(prevCollectorConfig => {
		return {
			...prevCollectorConfig,
			excludeSelectors: newExcludeSelectorsArray
		};
	});

	const keepHtml = collectorConfig && isSet(collectorConfig.keepHtml)
		? collectorConfig.keepHtml
		: false;
	const setKeepHtml = (newKeepHtml: boolean) => setCollectorConfig(prevCollectorConfig => {
		return {
			...prevCollectorConfig,
			keepHtml: newKeepHtml
		};
	});

	const userAgent = collectorConfig
		? (collectorConfig.userAgent || '')
		: '';

	const setUserAgent = (newUserAgent :string) => setCollectorConfig(prevCollectorConfig => {
		return {
			...prevCollectorConfig,
			userAgent: newUserAgent
		};
	});

	//──────────────────────────────────────────────────────────────────────────
	// State
	//──────────────────────────────────────────────────────────────────────────
	const [baseUriError, setBaseUriError] = React.useState<string>(undefined);
	const [/*baseUriVisited*/, setBaseUriVisited] = React.useState(false);

	//──────────────────────────────────────────────────────────────────────────
	// Callbacks, should only depend on props, not state
	//──────────────────────────────────────────────────────────────────────────
	const validateBaseUri = React.useCallback((baseUri :string) => {
		//console.debug('in validateBaseUri');
		const newError = !baseUri ? 'Uri is required!' : undefined;
		setBaseUriError(newError); // useEffect[baseUriError] triggers setCollectorConfigErrorCount
		return !newError;
	},[]); // Since there are no deps, it could have been a normal function rather than a React.useCallback

	const baseUriOnChange = React.useCallback((
		_event :React.ChangeEvent<HTMLInputElement>,
		{value} : {value :string}
	) => {
		//console.debug('baseUriOnChange');
		setCollectorConfig(prevCollectorConfig => ({
			...prevCollectorConfig,
			baseUri: value
		}));
		validateBaseUri(value);
	}, [
		setCollectorConfig,
		validateBaseUri
	]);

	const baseUriOnBlur = React.useCallback(() => {
		//console.debug('baseUriOnBlur');
		setBaseUriVisited(true);
		validateBaseUri(collectorConfig
			? (collectorConfig.baseUri || '')
			: '');
	}, [
		collectorConfig,
		validateBaseUri
	]);

	const afterReset :CollectorComponentAfterResetFunction = () => {
		setBaseUriVisited(false); // no listeners on baseUriVisited :)
		setBaseUriError(undefined); // useEffect[baseUriError] SHOULD trigger setCollectorConfigErrorCount, but DOESN'T ???
	};

	const validate = React.useCallback<CollectorComponentValidateFunction<CollectorConfigMT>>(({baseUri} :CollectorConfigMT) => {
		//console.debug('in validateCollectorConfig');
		const newCollectorConfigErrorCount = validateBaseUri(baseUri) ? 0 : 1;
		return !newCollectorConfigErrorCount;
	}, [
		validateBaseUri
	]);

	//──────────────────────────────────────────────────────────────────────────
	// Make it possible for parent to call these functions
	//──────────────────────────────────────────────────────────────────────────
	React.useImperativeHandle(ref, () => ({
		afterReset,
		validate
	}));

	//──────────────────────────────────────────────────────────────────────────
	// Init
	//──────────────────────────────────────────────────────────────────────────
	/*React.useEffect(() => {
		console.debug('Collector component init');
	},[]);*/

	//──────────────────────────────────────────────────────────────────────────
	// Updates (changes, not init)
	//──────────────────────────────────────────────────────────────────────────
	useUpdateEffect(() => {
		//console.debug('Collector component baseUriError changed', baseUriError);
		setCollectorConfigErrorCount(baseUriError ? 1 : 0);
	}, [
		baseUriError
	]);

	return {
		baseUri,
		baseUriOnBlur,
		baseUriOnChange,
		baseUriError,
		excludesArray,
		excludeSelectorsArray,
		keepHtml,
		setExcludesArray,
		setExcludeSelectorsArray,
		setKeepHtml,
		setUserAgent,
		userAgent
	};
}

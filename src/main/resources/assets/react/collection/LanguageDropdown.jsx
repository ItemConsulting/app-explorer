//import {Dropdown as SemanticUiReactDropdown} from 'semantic-ui-react';
//import {Flag} from 'semantic-ui-react';
import {Dropdown} from 'semantic-ui-react-form';
import {getEnonicContext} from 'semantic-ui-react-form/Context';
import getIn from 'get-value';

import {capitalize} from '../utils/capitalize';

export function LanguageDropdown(props) {
	const {
		locales
	} = props;
	const [context/*, dispatch*/] = getEnonicContext();

	const language = getIn(context.values, 'language');
	/*
	className='icon'
	button
	floating
	icon='world'
	labeled
	text='Select LAnguage'
	*/
	//return <Flag name={}/>
	return <Dropdown
		fluid
		options={locales.map(({
			country,
			//displayCountry,
			//displayLanguage,
			displayName,
			//displayVariant,
			//language,
			tag//,
			//variant
		}) => ({
			flag: country,
			//image: { avatar: true, src: '/images/avatar/small/jenny.jpg' }
			key: tag,
			//text: `country:${country} displayCountry:${displayCountry} displayLanguage:${displayLanguage} displayName:${displayName} displayVariant:${displayVariant} language:${language} tag:${tag} variant:${variant}`,
			//text: `${displayName.replace(/\b\w/g, l => l.toUpperCase())} [${tag}]`, // Fails on å
			//text: `${displayName.replace(/(^|\s)\S/g, l => l.toUpperCase())} [${tag}]`,
			text: `${capitalize(displayName)} [${tag}]`,
			value: tag
		}))}
		path='language'
		placeholder='Select language'
		search
		selection
		value={language}
	/>;
} // LanguageDropdown

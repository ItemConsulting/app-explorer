import type {
	CollectorComponentRef,
	CollectorProps
} from '/lib/explorer/types/index.d';

import * as React from 'react';
import {
	Button,
	Form,
	Header,
	Icon,
	Input,
	Table
} from 'semantic-ui-react';
import {DeleteItemButton} from './components/DeleteItemButton';
import {InsertButton} from './components/InsertButton';
import {MoveDownButton} from './components/MoveDownButton';
import {MoveUpButton} from './components/MoveUpButton';
import {CollectorConfigMT, useWebCrawlerMattilsynetState} from "./useWebCrawlerMattilsynetState";


const DEFAULT_UA = 'Mozilla/5.0 (compatible; Enonic XP Explorer Collector Web crawler/1.0.0)';


export const Collector = React.forwardRef(({
	collectorConfig,
	//explorer,
	setCollectorConfig,
	setCollectorConfigErrorCount
} :CollectorProps<CollectorConfigMT>, ref :CollectorComponentRef<CollectorConfigMT>) => {
	const {
		baseUri,
		baseUriError,
		baseUriOnBlur,
		baseUriOnChange,
		excludesArray,
		excludeSelectorsArray,
		keepHtml,
		setExcludesArray,
		setExcludeSelectorsArray,
		setKeepHtml,
		setUserAgent,
		userAgent
	} = useWebCrawlerMattilsynetState({
		collectorConfig,
		ref,
		setCollectorConfig,
		setCollectorConfigErrorCount
	});
	return <Form>
		<Form.Input
			error={baseUriError}
			fluid
			label='URL'
			onBlur={baseUriOnBlur}
			onChange={baseUriOnChange}
			required
			value={baseUri}
		/>
		{excludesArray && Array.isArray(excludesArray) && excludesArray.length
			? <>
				<Header as='h4' content='Exclude URL pattern(s)' dividing/>
				<Table celled compact selectable striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell collapsing>Regular expression</Table.HeaderCell>
							<Table.HeaderCell collapsing>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>{excludesArray.map((
						exclude = '',
						index
					) => {
						return <Table.Row key={index}>
							<Table.Cell>
								<Input
									fluid
									onChange={(_event,{value}) => {
										const deref = JSON.parse(JSON.stringify(excludesArray));
										deref[index] = value;
										setExcludesArray(deref);
									}}
									value={exclude}
								/>
							</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<InsertButton
										array={excludesArray}
										insertAtIndex={index + 1}
										setArrayFunction={setExcludesArray}
										valueToInsert=''
									/>
									<MoveDownButton
										array={excludesArray}
										index={index}
										setArrayFunction={setExcludesArray}
									/>
									<MoveUpButton
										array={excludesArray}
										index={index}
										setArrayFunction={setExcludesArray}
									/>
									<DeleteItemButton
										array={excludesArray}
										disabled={false}
										index={index}
										setArrayFunction={setExcludesArray}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}</Table.Body>
				</Table>
			</>
			: <Form.Field>
				<Button
					onClick={() => {
						setExcludesArray(['']);
					}}
				>
					<Icon color='green' name='plus'/>Add exclude URL pattern(s)
				</Button>
			</Form.Field>
		}
		{excludeSelectorsArray && Array.isArray(excludeSelectorsArray) && excludeSelectorsArray.length
			? <>
				<Header as='h4' content='Exclude html elements from &apos;text&apos; field with CSS-selectors' dividing/>
				<Table celled compact selectable striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell collapsing>
								Selectors. etc: &apos;#ID&apos; &apos;.CLASS&apos; &apos;HTMLTAG&apos; https://cheerio.js.org/docs/basics/selecting
							</Table.HeaderCell>
							<Table.HeaderCell collapsing>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>{excludeSelectorsArray.map((
						excludeSelector = '',
						index
					) => {
						return <Table.Row key={index}>
							<Table.Cell>
								<Input
									fluid
									onChange={(_event,{value}) => {
										const deref = JSON.parse(JSON.stringify(excludeSelectorsArray));
										deref[index] = value;
										setExcludeSelectorsArray(deref);
									}}
									value={excludeSelector}
								/>
							</Table.Cell>
							<Table.Cell collapsing>
								<Button.Group>
									<InsertButton
										array={excludeSelectorsArray}
										insertAtIndex={index + 1}
										setArrayFunction={setExcludeSelectorsArray}
										valueToInsert=''
									/>
									<MoveDownButton
										array={excludeSelectorsArray}
										index={index}
										setArrayFunction={setExcludeSelectorsArray}
									/>
									<MoveUpButton
										array={excludeSelectorsArray}
										index={index}
										setArrayFunction={setExcludeSelectorsArray}
									/>
									<DeleteItemButton
										array={excludeSelectorsArray}
										disabled={false}
										index={index}
										setArrayFunction={setExcludeSelectorsArray}
									/>
								</Button.Group>
							</Table.Cell>
						</Table.Row>;
					})}</Table.Body>
				</Table>
			</>
			: <Form.Field>
				<Button
					onClick={() => {
						setExcludeSelectorsArray(['']);
					}}
				>
					<Icon color='green' name='plus'/>Add exclude html element with CSS-selector pattern(s)
				</Button>
			</Form.Field>
		}
		<Form.Checkbox
			checked={keepHtml}
			label='Keep a copy of the HTML source? (not recommended)'
			onChange={(_event, {checked}) => setKeepHtml(checked)}
		/>
		<Form.Input
			fluid
			label='Custom User-Agent'
			onChange={(_event,{value}) => setUserAgent(value)}
			placeholder={`Leave empty to use ${DEFAULT_UA}`}
			value={userAgent}
		/>
	</Form>;
}); // Collector
Collector.displayName = 'Collector';

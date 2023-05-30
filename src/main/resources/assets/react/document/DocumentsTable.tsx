import type {
	PaginationProps,
} from 'semantic-ui-react';
import type JsonModalState from '../components/modals/JsonModalState.d';
import type {QueryDocumentsResult} from './';


import {
	ELLIPSIS,
	getIn,
	HIGHLIGHT_FIELD_ALLTEXT,
	isString,
} from '@enonic/js-utils';
import {FieldPath} from '@enonic/explorer-utils';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend'
import ReactHtmlParser from 'react-html-parser';
import {
	Button,
	Icon,
	Pagination,
	Table,
} from 'semantic-ui-react';
import JsonModal from '../components/modals/JsonModal';
import {
	FRAGMENT_SIZE_DEFAULT,
	PER_PAGE_DEFAULT,
	POST_TAG,
	PRE_TAG,
	SELECTED_COLUMNS_DEFAULT,
	Column,
} from './constants';
import DragAndDropableHeaderCell from './DragAndDropableHeaderCell';
import React from 'react';

const ROW_HEIGHT = 34;
const JSON_ICON_HEIGHT = 20;
const JSON_BUTTON_PADDING = (ROW_HEIGHT - JSON_ICON_HEIGHT)/2;

function getHighlightedHtml({
	_highlight,
	fallback = '',
	fieldPath,
	fragmentSize,
}: {
	_highlight: Record<string,string[]>
	fallback: string
	fieldPath: string
	fragmentSize: number
}) {
	const lcFieldPath = fieldPath.toLowerCase();
	let highlightedHtml = _highlight
		? _highlight[lcFieldPath]
			? _highlight[lcFieldPath][0]
			: _highlight[`${lcFieldPath}._stemmed_en`] // TODO Hardcode
				? _highlight[`${lcFieldPath}._stemmed_en`][0]
				: _highlight[`${lcFieldPath}._stemmed_no`]
					? _highlight[`${lcFieldPath}._stemmed_no`][0]
					: isString(fallback)
						? fallback.length > fragmentSize
							? `${fallback.substring(0, fragmentSize)}${ELLIPSIS}`
							: fallback
						: fallback
		: fallback;
	const strippedHighlight = highlightedHtml?.replace(new RegExp(PRE_TAG,'g'), '')?.replace(new RegExp(POST_TAG,'g'), '');
	if (
		strippedHighlight !== fallback
	) {
		const startOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(0, strippedHighlight.length);
		const endOfFieldWithSameLengthAsStrippedHighlight = fallback.substring(fallback.length - strippedHighlight.length);
		// console.debug({
		// 	fallback,
		// 	'fallback.length': fallback.length,
		// 	fragmentSize,
		// 	highlightedHtml,
		// 	strippedHighlight,
		// 	'strippedHighlight.length': strippedHighlight.length,
		// 	startOfFieldWithSameLengthAsStrippedHighlight,
		// 	endOfFieldWithSameLengthAsStrippedHighlight,
		// });
		if (strippedHighlight === startOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${highlightedHtml}${ELLIPSIS}`;
		} else if (strippedHighlight === endOfFieldWithSameLengthAsStrippedHighlight) {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}`;
		} else {
			highlightedHtml = `${ELLIPSIS}${highlightedHtml}${ELLIPSIS}`;
		}
	}
	return highlightedHtml;
}

function columnNameToDisplayName(columnName: string) {
	return columnName === Column.COLLECTION
		? 'Collection'
		: columnName === Column.DOCUMENT_TYPE
			? 'Document type'
			: columnName === Column.LANGUAGE
				? 'Language'
				: columnName === Column.ID
					? 'Document ID'
					: columnName === Column.JSON
						? 'JSON'
						// : columnName === HIGHLIGHT_FIELD_ALLTEXT
						// ? '_alltext'
						: columnName;
}


function DocumentsTable({
	documentsRes,
	dragAndDropColumnsProp = false,
	fragmentSize = FRAGMENT_SIZE_DEFAULT,
	handleDroppedColumn = ({}) => undefined,
	handlePaginationChange,
	jsonModalState,
	loading,
	page,
	perPage = PER_PAGE_DEFAULT,
	searchedString,
	selectedColumnsState = [...SELECTED_COLUMNS_DEFAULT],
	setJsonModalState,
	start,
}: {
	documentsRes: QueryDocumentsResult,
	dragAndDropColumnsProp?: boolean,
	fragmentSize?: number
	handleDroppedColumn?: ({fromId, toId}: {fromId: string, toId: string}) => void
	handlePaginationChange: (
		_event: React.MouseEvent<HTMLAnchorElement>,
		data: PaginationProps
	) => void,
	jsonModalState: JsonModalState
	loading: boolean
	page: number
	perPage?: number
	searchedString: string
	selectedColumnsState?: string[]
	setJsonModalState: React.Dispatch<React.SetStateAction<JsonModalState>>
	start: number
}) {
	return <>
		<DndProvider backend={HTML5Backend}>
			<div className='ovx-o'>
				<Table celled compact striped>
					<Table.Header>
						<Table.Row>
							{selectedColumnsState.map((columnName, i) => columnName === HIGHLIGHT_FIELD_ALLTEXT
								? searchedString
									? <Table.HeaderCell
										content={columnNameToDisplayName(columnName)}
										key={i}
										singleLine
									/>
									: null
								: dragAndDropColumnsProp
									? <DragAndDropableHeaderCell
										collapsing
										content={columnNameToDisplayName(columnName)}
										id={columnName}
										index={i}
										key={`column-${columnName}`}
										onDrop={({
											fromId,
											toId
										}) => handleDroppedColumn({
											fromId,
											toId
										})}
										singleLine
									/>
									: <Table.HeaderCell
										content={columnNameToDisplayName(columnName)}
										key={i}
										singleLine
									/>)
							}
							{/*columnOptions
								.filter(({value}) => selectedColumns.includes(value as string))
								.map(({text},i) => <Table.HeaderCell collapsing content={text} key={i}/>)*/}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{documentsRes.hits.map(({
							_highlight = {},
							_id,
						 	_json,
							...rest
						}, i) => {
							return <Table.Row key={i}>
								{
									selectedColumnsState.map((selectedColumnName, j) => {
										const key = `${i}.${j}`;
										if (selectedColumnName === Column.COLLECTION) {
											return <Table.Cell collapsing key={key}>
												{rest[FieldPath.META] && rest[FieldPath.META].collection || rest['_collection']}
											</Table.Cell>;
										} else if (selectedColumnName === Column.DOCUMENT_TYPE) {
											return <Table.Cell collapsing key={key}>
												{rest[FieldPath.META] && rest[FieldPath.META].documentType || rest['_documentType']}
											</Table.Cell>;
										} else if (selectedColumnName === Column.LANGUAGE) {
											return <Table.Cell collapsing key={key}>
												{rest[FieldPath.META] && rest[FieldPath.META].language || rest['_language']}
											</Table.Cell>;
										} else if (selectedColumnName === Column.ID) {
											return <Table.Cell collapsing key={key}>{_id}</Table.Cell>;
										} else if (selectedColumnName === Column.JSON) {
											return <Table.Cell collapsing key={key}>
												<Button
													basic
													className='marginLess translucent'
													onClick={() => {
														setJsonModalState({
															open: true,
															header: _id,
															parsedJson: _json as any,// || rest['_json'], // Can't fallback to string, when the type should be object
														})
													}}
													style={{
														padding: JSON_BUTTON_PADDING
													}}
												>
													<svg width={JSON_ICON_HEIGHT} height={JSON_ICON_HEIGHT} version="2.0">
														<use href="#json" />
													</svg>
												</Button>
											</Table.Cell>;
										} else if (selectedColumnName === HIGHLIGHT_FIELD_ALLTEXT) {
											return searchedString
												? <Table.Cell>
													{
														_highlight?.['_alltext'].length
															? <ul style={{
																listStyleType: 'none',
																margin: 0,
																padding: 0
															}}>
																{
																	_highlight['_alltext'].map((htmlString, j) => <li key={j}>
																		{ReactHtmlParser(htmlString)}
																	</li>)
																}
															</ul>
															: null
													}
												</Table.Cell>
												: null;
										} else if (!SELECTED_COLUMNS_DEFAULT.includes(selectedColumnName as Column)) {
											const htmlString = getHighlightedHtml({
												_highlight,
												fallback: String(getIn(_json, selectedColumnName)),
												fieldPath: selectedColumnName,
												fragmentSize,
											});
											// console.debug('htmlString', htmlString);
											return <Table.Cell
												collapsing
												key={key}
											>{ReactHtmlParser(htmlString)}</Table.Cell>;
										} else {
											console.error('Unhandeled selectedColumnName', selectedColumnName);
											return <Table.Cell
												collapsing
												key={key}
											/>;
										}
									})
									// .filter(x => x) // Overcome error, not needed and can cause scewed index between headerCell and cell
								}
							</Table.Row>})}
					</Table.Body>
				</Table>
			</div>
		</DndProvider>
		<Pagination
			disabled={loading || !documentsRes.total}
			pointing
			secondary
			size='mini'
			style={{
				marginBottom: 14,
				marginTop: 14
			}}

			activePage={page}
			boundaryRange={1}
			siblingRange={1}
			totalPages={Math.ceil(documentsRes.total / perPage)}

			ellipsisItem={{content: <Icon name='ellipsis horizontal' />, icon: true}}
			firstItem={{content: <Icon name='angle double left' />, icon: true}}
			prevItem={{content: <Icon name='angle left' />, icon: true}}
			nextItem={{content: <Icon name='angle right' />, icon: true}}
			lastItem={{content: <Icon name='angle double right' />, icon: true}}

			onPageChange={handlePaginationChange}
		/>
		{documentsRes.total
			? <p className={loading ? 'disabled' : ''}>Displaying {(() => {
				const begin = start + 1;
				const end = Math.min(start + perPage, documentsRes.total);
				if (end === begin) {
					return begin;
				}
				return `${begin}-${end} of ${documentsRes.total}`;
			})()}</p>
			: null
		}
		<JsonModal
			state={jsonModalState}
			setState={setJsonModalState}
		/>
	</>;
}

export default DocumentsTable;

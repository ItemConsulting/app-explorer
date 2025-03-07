import type {CollectionFormValues} from '@enonic-types/lib-explorer';
import type {
	CollectorComponents,
	SetLicensedToFunction,
	SetLicenseValidFunction
} from '../index.d';


import {
	// TASK_STATE_FAILED,
	// TASK_STATE_FINISHED,
	TASK_STATE_RUNNING,
	TASK_STATE_WAITING,
	lpad,
	rpad
} from '@enonic/js-utils';
import {parseExpression as parseCronExpression} from 'cron-parser';
import {Link} from 'react-router-dom';
import {
	Dimmer,
	Header,
	Loader,
	Popup,
	Progress,
	Radio,
	Segment,
	Table,
} from 'semantic-ui-react';
import HoverButton from '../components/buttons/HoverButton';
import RefreshButton from '../components/buttons/RefreshButton';
import Flex from '../components/Flex';
import {Cron} from '../utils/Cron';
import {
	MONTH_TO_HUMAN
} from './SchedulingSegment';
import {CollectionCopyModal} from './CollectionCopyModal';
import {DeleteCollectionModal} from './delete/DeleteCollectionModal';
import {NewOrEditCollectionModal} from './NewOrEditCollectionModal';
import {useCollectionsState} from './useCollectionsState';


// const GQL_MUTATION_COLLECTIONS_REINDEX = `mutation ReindexMutation(
//   $collectionIds: [String]!
// ) {
//   reindexCollections(collectionIds: $collectionIds) {
//     collectionId
//     collectionName
//     message
//     documentTypeId
//     taskId
//   }
// }`;


export function Collections(props :{
	collectorComponents :CollectorComponents
	licenseValid :boolean
	newCollectionModalOpen?: boolean
	servicesBaseUrl :string
	setLicensedTo :SetLicensedToFunction
	setLicenseValid :SetLicenseValidFunction
}) {
	const {
		collectorComponents,
		licenseValid,
		newCollectionModalOpen = false,
		servicesBaseUrl,
		setLicensedTo,
		setLicenseValid,
	} = props;

	const {
		anyReindexTaskWithoutCollectionId,
		anyTaskWithoutCollectionName,
		collectionsTaskState,
		collectorIdToDisplayName, // setCollectorIdToDisplayName,
		collectorOptions,
		// column,
		contentTypeOptions,
		copyModalCollectionId, setCopyModalCollectionId,
		deleteCollectionModalState, setDeleteCollectionModalState,
		// direction,
		fieldsObj,
		intInitializedCollectorComponents,
		isLoading,
		jobsObj,
		locales,
		memoizedFetchCollections,
		memoizedFetchOnUpdate,
		memoizedFetchTasks,
		objCollectionsBeingReindexed,
		queryCollectionsGraph,
		shemaIdToName,
		setShowCollector,
		setShowDelete,
		setShowDocumentType,
		//setShowInterfaces,
		setShowLanguage,
		setShowSchedule,
		showCollector,
		showDelete,
		showDocumentCount,
		showDocumentType,
		//showInterfaces,
		showLanguage,
		showSchedule,
		siteOptions
	} = useCollectionsState({
		collectorComponents,
		servicesBaseUrl
	});

	return <>
		<Flex
			className='mt-1rem'
			justifyContent='center'
		>
			<Flex.Item
				className='w-ma-fullExceptGutters w-fullExceptGutters-mobileDown'
				overflowX='overlay'
			>
				<Segment className='button-padding' floated='left'>
					<Radio
						label='Show all fields'
						checked={showCollector}
						onChange={(
							_event: unknown,
							{ checked }
						) => {
							setShowCollector(checked);
							// setShowDocumentCount(checked);
							setShowLanguage(checked);
							setShowDocumentType(checked);
							//setShowInterfaces(checked);
							setShowSchedule(checked);
							setShowDelete(checked);
						}}
						toggle
					/>
				</Segment>
				<RefreshButton
					floated='right'
					loading={isLoading}
					onClick={memoizedFetchOnUpdate}
				/>
				<div className='cl-b'/>
				<Header
					as='h1'
					disabled={isLoading}
				>Collections</Header>
				<Dimmer.Dimmable dimmed={isLoading}>
					<Dimmer active={isLoading} inverted>
						<Loader size='large'>Loading</Loader>
					</Dimmer>
					<Table
						celled
						compact
						disabled={isLoading}
						striped
					>
						<Table.Header>
							<Table.Row>
								{/* Width is X columns of total 16 */}
								<Table.HeaderCell>Collect</Table.HeaderCell>
								<Table.HeaderCell
									onClick={null/*handleSortGenerator('displayName')*/}
									sorted={/*column === '_name' ? direction : */null}
								>Name</Table.HeaderCell>
								{showCollector ? <Table.HeaderCell>Collector</Table.HeaderCell> : null}
								{showDocumentCount ? <Table.HeaderCell>Documents</Table.HeaderCell> : null}
								{showLanguage ? <Table.HeaderCell>Language</Table.HeaderCell> : null}
								{showDocumentType ? <Table.HeaderCell>Document Type</Table.HeaderCell> : null}
								{/*showInterfaces ? <Table.HeaderCell>Interfaces</Table.HeaderCell> : null*/}
								{showSchedule ? <Table.HeaderCell>Schedule</Table.HeaderCell> : null }
								<Table.HeaderCell>Actions</Table.HeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{queryCollectionsGraph.hits && queryCollectionsGraph.hits.map(({
								_id: collectionId,
								_name: collectionName,
								_path,
								collector,
								documentCount,
								//interfaces,
								language = '',
								documentTypeId = ''
							}, index) => {
								const key = `collection[${index}]`;

								const boolCollectorSelected = !!(collector && collector.name);
								//console.debug('boolCollectorSelected', boolCollectorSelected);

								const boolCollectorSelectedAndInitialized = !!(boolCollectorSelected && collectorComponents[collector.name]);
								//console.debug('boolCollectorSelectedAndInitialized', boolCollectorSelectedAndInitialized);

								const busy = anyReindexTaskWithoutCollectionId
								|| !!(
									objCollectionsBeingReindexed[collectionId]
									&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
								);
								//console.debug('busy', busy);

								const collectorNameOrEmpty = collector && collector.name && collectorIdToDisplayName[collector.name] || '';

								const editEnabled = intInitializedCollectorComponents
									&& (boolCollectorSelectedAndInitialized || !boolCollectorSelected)
									&& !busy;
								//console.debug('editEnabled', editEnabled);

								const disabled = !editEnabled || isLoading;
								//console.debug('disabled', disabled);

								const cron = jobsObj[collectionId]
									? jobsObj[collectionId].map(({value}) => {
										return new Cron(value).toObj();
									})
									: [new Cron('0 0 * * 0').toObj()]; // Default once a week
								const doCollect = jobsObj[collectionId] ? jobsObj[collectionId][0].enabled : false;
								return <Table.Row key={key}>
									<Table.Cell collapsing>
										{
											collector && collector.name
												? collectionsTaskState[collectionName]
													? {
														WAITING: <Popup
															content={`Collector is in waiting state`}
															inverted
															trigger={<HoverButton color='yellow' disabled={!boolCollectorSelectedAndInitialized} icon='pause'/>}/>,
														RUNNING: <Popup
															content={`Stop collecting to ${collectionName}`}
															inverted
															trigger={<HoverButton color='red' disabled={!boolCollectorSelectedAndInitialized} icon='stop' onClick={() => {
																fetch(`${servicesBaseUrl}/collectorStop?collectionName=${collectionName}`, {
																	method: 'POST'
																}).then(() => {
																	memoizedFetchTasks();
																});
															}}/>}/>,
														FINISHED: <Popup
															content={`Finished collecting to ${collectionName}`}
															inverted
															trigger={<HoverButton color='green' disabled={!boolCollectorSelectedAndInitialized} icon='checkmark'/>}/>,
														FAILED: <Popup
															content={`Something went wrong while collecting to ${collectionName}`}
															inverted
															trigger={<HoverButton color='red' disabled={!boolCollectorSelectedAndInitialized} icon='warning'/>}/>
													}[collectionsTaskState[collectionName]]
													: anyTaskWithoutCollectionName
														? <Popup
															content={`Some collector task is starting...`}
															inverted
															trigger={<HoverButton color='yellow' disabled={!boolCollectorSelectedAndInitialized} icon='question' loading/>}/>
														: <Popup
															content={`Start collecting to ${collectionName}`}
															inverted
															trigger={
																<HoverButton
																	color={boolCollectorSelectedAndInitialized ? 'green' : 'grey'}
																	disabled={!boolCollectorSelectedAndInitialized || busy}
																	icon='cloud download'
																	onClick={() => {
																		fetch(`${servicesBaseUrl}/collectionCollect?id=${collectionId}&name=${collectionName}`, {
																			method: 'POST'
																		}).then(() => {
																			memoizedFetchTasks();
																		});
																	}}
																/>
															}
														/>
												: <HoverButton color='grey' disabled={true} icon='cloud download'/>
										}
									</Table.Cell>
									<Table.Cell collapsing>{collectionName}</Table.Cell>
									{busy
										? <Table.Cell collapsing colspan={
											(showCollector ? 1 : 0)
											+ (showDocumentCount ? 1 : 0)
											+ (showLanguage ? 1 : 0)
											+ (showDocumentType ? 1 : 0)
											//+ (showInterfaces ? 1 : 0)
											+ (showSchedule ? 1 : 0)
										}><Progress
												active
												progress='ratio'
												total={objCollectionsBeingReindexed[collectionId].total}
												value={objCollectionsBeingReindexed[collectionId].current}
											/>{'Reindexing...'}</Table.Cell>
										: <>
											{showCollector ? <Table.Cell collapsing>{collectorNameOrEmpty}</Table.Cell> : null}
											{showDocumentCount ? <Table.Cell collapsing>{
												documentCount === -1
													? ''
													: documentCount > 1
														? <Link
															to={`/documents?collection=${collectionName}`}
														>{documentCount}</Link>
														: '0'
											}</Table.Cell> : null}
											{showLanguage ? <Table.Cell collapsing>{language}</Table.Cell> : null}
											{showDocumentType ? <Table.Cell collapsing>{
												collector && collector.managedDocumentTypes
													? <ul style={{
														listStyleType: 'none',
														margin: 0,
														padding: 0
													}}>{collector.managedDocumentTypes.map((mDTName, i) => <li key={i} style={{marginBottom: 3}}>{mDTName} <span style={{color:'gray'}}>(managed)</span></li>)}</ul>
													: shemaIdToName[documentTypeId]
											}</Table.Cell> : null }
											{/*showInterfaces ? <Table.Cell collapsing>{interfaces.map((iface, i :number) => <p key={i}>
												{i === 0 ? null : <br/>}
												<span style={{whiteSpace: 'nowrap'}}>{iface}</span>
											</p>)}</Table.Cell> : null*/}
											{showSchedule ? <Table.Cell>{
												collectorNameOrEmpty
													? jobsObj[collectionId]
														? jobsObj[collectionId].map(({enabled, value}, i :number) => {
															if (jobsObj[collectionId].length === 1 && !enabled) {
																return 'Inactive';
															}
															const interval = parseCronExpression(value);
															const fields = JSON.parse(JSON.stringify(interval.fields)); // Fields is immutable
															return <pre key={`${collectionName}.cron.${i}`} style={{color:enabled ? 'auto' : 'gray'}}>
																{`${Cron.hourToHuman(fields.hour)}:${
																	Cron.minuteToHuman(fields.minute)} ${
																	Cron.dayOfWeekToHuman(fields.dayOfWeek)} in ${
																	rpad(MONTH_TO_HUMAN[fields.month.length === 12 ? '*' : fields.month[0]], 11)} (dayOfMonth:${
																	lpad(fields.dayOfMonth.length === 31 ? '*' : fields.dayOfMonth)})`}
															</pre>;
														})
														: 'Not scheduled'
													: 'N/A'
											}</Table.Cell> : null}
										</>
									}
									<Table.Cell collapsing>
										<NewOrEditCollectionModal
											collections={queryCollectionsGraph.hits}
											collectorOptions={collectorOptions}
											collectorComponents={collectorComponents}
											contentTypeOptions={contentTypeOptions}
											disabled={disabled}
											initialValues={{
												_id: collectionId,
												_name: collectionName,
												_path,
												collector,
												cron,
												doCollect,
												documentTypeId,
												language
											}}
											fields={fieldsObj}
											loading={isLoading}
											locales={locales}
											licenseValid={licenseValid}
											_name={collectionName}
											afterClose={() => {
												//console.debug('NewOrEditCollectionModal afterClose');
												memoizedFetchOnUpdate();
											}}
											servicesBaseUrl={servicesBaseUrl}
											setLicensedTo={setLicensedTo}
											setLicenseValid={setLicenseValid}
											siteOptions={siteOptions}
											totalNumberOfCollections={queryCollectionsGraph.total}
										/>
										{/*anyReindexTaskWithoutCollectionId
											? <Popup
												content={`Some reindex task is starting...`}
												inverted
												trigger={<Button disabled={true} icon loading><Icon color='yellow' name='question'/></Button>}/>
											: <Popup
												content={
													objCollectionsBeingReindexed[collectionId]
													&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
														? `Collection is being reindexed...`
														: 'Start reindex'
												}
												inverted
												trigger={<Button
													disabled={
														objCollectionsBeingReindexed[collectionId]
														&& [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state) }
													icon
													onClick={() => {
														fetch(`${servicesBaseUrl}/graphQL`, {
															method: 'POST',
															headers: { 'Content-Type': 'application/json' },
															body: JSON.stringify({
																query: GQL_MUTATION_COLLECTIONS_REINDEX,
																variables: {
																	collectionIds: [collectionId]
																}
															})
														})
															.then(res => res.json())
															.then(res => {
																console.debug(res);
															});
													}}
												>
													<Icon color={
														objCollectionsBeingReindexed[collectionId]
															? objCollectionsBeingReindexed[collectionId].state === TASK_STATE_FAILED
																? 'red'
																: [TASK_STATE_RUNNING, TASK_STATE_WAITING].includes(objCollectionsBeingReindexed[collectionId].state)
																	? 'yellow'
																	: 'green' // objCollectionsBeingReindexed[collectionId] === TASK_STATE_FINISHED
															: 'green'} name='recycle'/>
												</Button>}/>
										*/}
										<Popup
											content={`Copy collection ${collectionName}`}
											inverted
											trigger={
												<HoverButton
													color='blue'
													icon='copy'
													onClick={
														() => {
															setCopyModalCollectionId(collectionId);
														}
													}
												/>
											}
										/>
										{
											showDelete
												? <Popup
													content={`Delete collection ${collectionName}`}
													inverted
													trigger={
														<HoverButton
															color='red'
															disabled={busy}
															icon='trash alternate outline'
															onClick={
																() => {
																	setDeleteCollectionModalState({
																		collectionId,
																		collectionName,
																		open: true,
																	})
																}
															}
														/>
													}
												/>
												: null
										}
									</Table.Cell>
								</Table.Row>;
							})}
						</Table.Body>
					</Table>
					<NewOrEditCollectionModal
						collections={queryCollectionsGraph.hits}
						collectorOptions={collectorOptions}
						collectorComponents={collectorComponents}
						contentTypeOptions={contentTypeOptions}
						disabled={!intInitializedCollectorComponents || isLoading}
						defaultOpen={newCollectionModalOpen}
						loading={isLoading}
						fields={fieldsObj}
						initialValues={{
							_name: '',
							collector: {
								//config: {}, // CollectorSelector onChange will set this.
								//configJson: '{}',
								name: ''//,
								//taskName: 'collect'//, // TODO
							},
							cron: [{ // Default once a week
								month: '*',
								dayOfMonth: '*',
								dayOfWeek: '0',
								minute: '0',
								hour: '0'
							}],
							doCollect: false,
							language: ''
						} as CollectionFormValues}
						licenseValid={licenseValid}
						locales={locales}
						afterClose={() => {
							//console.debug('NewOrEditCollectionModal afterClose');
							memoizedFetchOnUpdate();
						}}
						servicesBaseUrl={servicesBaseUrl}
						setLicensedTo={setLicensedTo}
						setLicenseValid={setLicenseValid}
						siteOptions={siteOptions}
						totalNumberOfCollections={queryCollectionsGraph.total}
					/>
				</Dimmer.Dimmable>
			</Flex.Item>
		</Flex>
		{
			copyModalCollectionId
				? <CollectionCopyModal
					afterSuccess={() => {memoizedFetchOnUpdate()}}
					collectionId={copyModalCollectionId}
					collectionNames={queryCollectionsGraph.hits.map(({_name}) => _name)}
					servicesBaseUrl={servicesBaseUrl}
					setCopyModalCollectionId={setCopyModalCollectionId}
				/>
				: null
		}
		{
			deleteCollectionModalState.open
				? <DeleteCollectionModal
					collectionId={deleteCollectionModalState.collectionId}
					collectionName={deleteCollectionModalState.collectionName}
					onClose={() => {
						setDeleteCollectionModalState({
							collectionId: '',
							collectionName: '',
							open: false,
						})
						memoizedFetchCollections();
					}}
					servicesBaseUrl={servicesBaseUrl}
				/>
				: null
		}
	</>;
} // Collections

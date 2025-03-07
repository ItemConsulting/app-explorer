import type {DocumentTypesComponentParams} from './index.d';


import {Link} from 'react-router-dom';
import {
	Header,
	Icon,
	Popup,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';
import RefreshButton from '../components/buttons/RefreshButton';
import {ButtonEdit} from '../components/ButtonEdit';
import {ButtonNew} from '../components/ButtonNew';
import {EditManagedDocumentTypeWarningModal} from './EditManagedDocumentTypeWarningModal';
import Flex from '../components/Flex';
import {NewOrEditDocumentTypeModal} from './NewOrEditDocumentTypeModal';
import {DeleteDocumentTypeModal} from './DeleteDocumentTypeModal';
import {
	getDefaultModalState,
	useDocumentTypesState
} from './useDocumentTypesState';


export function DocumentTypes({
	servicesBaseUrl
} :DocumentTypesComponentParams) {

	const {
		currentDocumentTypeName, setCurrentDocumentTypeName,
		documentTypes,
		editManagedDocumentTypeWarningModalOpen, setEditManagedDocumentTypeWarningModalOpen,
		isLoading,
		memoizedUpdateState,
		newOrEditModalState, setNewOrEditModalState,
		showAllFields, setShowAllFields
	} = useDocumentTypesState({
		servicesBaseUrl
	});

	return <Flex
		className='mt-1rem'
		justifyContent='center'
	>
		<Flex.Item
			className={[
				'w-ma-fullExceptGutters',
				'w-mi-tabletExceptGutters-tabletUp',
				'w-fullExceptGutters-mobileDown',
			].join(' ')}
			overflowX='overlay'
		>
			<Flex
				justifyContent='space-between'
				gap
				marginBottom
			>
				<Flex.Item>
					<Segment className='button-padding'>
						<Radio
							label={'Show all fields'}
							checked={showAllFields}
							onChange={(
								//@ts-ignore
								ignored,
								{ checked }
							) => {
								setShowAllFields(checked);
							}}
							toggle
						/>
					</Segment>
				</Flex.Item>
				<Flex.Item>
					<RefreshButton
						loading={isLoading}
						onClick={memoizedUpdateState}
					/>
				</Flex.Item>
			</Flex>
			<Header as='h1' content='Document types'/>
			<Table celled compact singleLine striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell textAlign='right'>Documents</Table.HeaderCell>
						{showAllFields ? <Table.HeaderCell>Documents per collection</Table.HeaderCell> : null}
						<Table.HeaderCell singleLine textAlign='right'>Field count</Table.HeaderCell>
						{showAllFields ?
							<>
								<Table.HeaderCell>Fields</Table.HeaderCell>
								<Table.HeaderCell singleLine>Add fields</Table.HeaderCell>
								<Table.HeaderCell>Managed by</Table.HeaderCell>
							</>
							: null}
						<Table.HeaderCell>{showAllFields ? 'Actions' : 'Edit'}</Table.HeaderCell>
						{/* {showDetails ? <Table.HeaderCell>Details</Table.HeaderCell> : null} */}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{Object.keys(documentTypes).map((documetTypeName) => documentTypes[documetTypeName]).map(({
						_id,
						_name,
						//_versionKey, // We get this inside NewOrEditDocumentTypeModal
						activeProperties,
						activePropertyNames,
						addFields = true,
						collectionsNames = [],
						collections = [],
						documentsInTotal = 0,
						managedBy = ''
					}, index) => {
						const editButton = <Popup
							content={_name}
							header='Edit document-type'
							inverted
							trigger={<ButtonEdit basic className='marginless translucent' disabled={isLoading} onClick={() => {
								setCurrentDocumentTypeName(_name);
								if (documentTypes[_name] && documentTypes[_name].managedBy) {
									setEditManagedDocumentTypeWarningModalOpen(true);
								} else {
									setNewOrEditModalState({
										_id,
										_name,
										open: true
									});
								}
							}}/>}
						/>;
						return <Table.Row key={index}>
							<Table.Cell disabled={isLoading}>{_name}</Table.Cell>

							<Table.Cell collapsing disabled={isLoading} textAlign='right'>{documentsInTotal > 0
								? <Link
									to={`/documents?documentType=${_name}`}
								>{documentsInTotal}</Link>
								: 0}</Table.Cell>

							{showAllFields ? <Table.Cell disabled={isLoading}><ul style={{
								listStyleType: 'none',
								margin: 0,
								padding: 0
							}}>{collections.map(({
									name,
									docCount
								}, i) => <li key={i} style={{marginBottom: 3}}>{name} ({docCount})</li>)}</ul></Table.Cell> : null}

							<Table.Cell collapsing disabled={isLoading} textAlign='right'>{activeProperties.length}</Table.Cell>
							{
								showAllFields
									? <Table.Cell collapsing disabled={isLoading}>
										<ul style={{
											listStyleType: 'none',
											margin: 0,
											padding: 0
										}}>
											{
												activePropertyNames.sort().map((p, i) => <li key={i} style={{marginBottom: 3}}>{p}</li>)
											}
										</ul>
									</Table.Cell>
									: null
							}
							{
								showAllFields
									? <>
										<Table.Cell collapsing disabled={isLoading}>
											{
												addFields
													? <Icon color='grey' disabled={isLoading} name='checkmark' size='large'/>
													: <Icon color='grey' disabled={isLoading} name='x' size='large'/>
											}
										</Table.Cell>
										<Table.Cell collapsing disabled={isLoading}>{managedBy}</Table.Cell>
									</>
									: null
							}
							<Table.Cell collapsing disabled={isLoading}>
								{editButton}
								{
									showAllFields
										? <DeleteDocumentTypeModal
											_id={_id}
											_name={_name}
											afterClose={() => {
												//console.debug('DeleteDocumentTypeModal afterClose');
												memoizedUpdateState();
											}}
											collectionNames={collectionsNames}
											disabled={isLoading}
											servicesBaseUrl={servicesBaseUrl}
										/>
										: null
								}
							</Table.Cell>
							{/* {showDetails ? <Table.Cell collapsing>
								<Table>
									<Table.Header>
										<Table.Row>
											<Table.HeaderCell>Name</Table.HeaderCell>
											<Table.HeaderCell>Value type</Table.HeaderCell>
											<Table.HeaderCell textAlign='center'>Min</Table.HeaderCell>
											<Table.HeaderCell textAlign='center'>Max</Table.HeaderCell>
											<Table.HeaderCell textAlign='center'>Indexing</Table.HeaderCell>
											<Table.HeaderCell textAlign='center'>Fulltext</Table.HeaderCell>
											<Table.HeaderCell textAlign='center'>nGram</Table.HeaderCell>
											<Table.HeaderCell textAlign='center'>Include in _allText</Table.HeaderCell>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{activeProperties.map(({
											enabled,
											fulltext,
											includeInAllText,
											max,
											min,
											name,
											nGram,
											valueType
										}, k) => <Table.Row key={`${index}.${k}`}>
											<Table.Cell collapsing>{name}</Table.Cell>
											<Table.Cell collapsing>{valueType}</Table.Cell>
											<Table.Cell collapsing textAlign='center'>{min}</Table.Cell>
											<Table.Cell collapsing textAlign='center'>{max}</Table.Cell>
											<Table.Cell collapsing textAlign='center'>{enabled ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>}</Table.Cell>
											<Table.Cell collapsing textAlign='center'>{enabled
												? fulltext ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>
												: null
											}</Table.Cell>
											<Table.Cell collapsing textAlign='center'>{enabled
												? nGram ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>
												: null
											}</Table.Cell>
											<Table.Cell collapsing textAlign='center'>{enabled
												? includeInAllText ? <Icon color='green' name='checkmark' size='large'/> : <Icon color='grey' name='x' size='large'/>
												: null
											}</Table.Cell>
										</Table.Row>)}
									</Table.Body>
								</Table>
							</Table.Cell> : null} */}


						</Table.Row>;
					})}
				</Table.Body>
			</Table>

			<Popup
				content='New document type'
				inverted
				trigger={
					<ButtonNew onClick={() => {
						return setNewOrEditModalState(getDefaultModalState(true));
					}}/>
				}
			/>

			<NewOrEditDocumentTypeModal
				_id={newOrEditModalState._id}
				_name={newOrEditModalState._name}
				open={newOrEditModalState.open}
				documentTypes={documentTypes}
				setModalState={setNewOrEditModalState}
				onClose={() => {
					setNewOrEditModalState({ open: false });
					memoizedUpdateState();
				}}
				servicesBaseUrl={servicesBaseUrl}
			/>

			<EditManagedDocumentTypeWarningModal
				documentTypeName={currentDocumentTypeName}
				managedBy={documentTypes[currentDocumentTypeName] ? documentTypes[currentDocumentTypeName].managedBy : ''}
				onCancel={() => {
					setEditManagedDocumentTypeWarningModalOpen(false);
				}}
				onClose={() => {
					setEditManagedDocumentTypeWarningModalOpen(false);
				}}
				onConfirm={() => {
					setNewOrEditModalState({
						_id: documentTypes[currentDocumentTypeName]._id,
						_name: currentDocumentTypeName,
						open: true
					});
					setEditManagedDocumentTypeWarningModalOpen(false);
				}}
				open={editManagedDocumentTypeWarningModalOpen}
			/>
		</Flex.Item>
	</Flex>;
} // DocumentTypes

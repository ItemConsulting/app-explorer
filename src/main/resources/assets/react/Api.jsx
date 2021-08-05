import {
	Header,
	Label,
	Radio,
	Segment,
	Table
} from 'semantic-ui-react';


import {DeleteApiKeyModal} from './api/DeleteApiKeyModal';
import {NewOrEditApiKeyModal} from './api/NewOrEditApiKeyModal';

import {useInterval} from './utils/useInterval';


const GQL = `{
	queryApiKeys {
		hits {
			_name
			collections
			interfaces
		}
	}
	queryCollections {
		hits {
			_name
		}
	}
	queryInterfaces {
		hits {
			_name
		}
	}
}`;


export const Api = (props) => {
	//console.debug('props', props);
	const {
		servicesBaseUrl
	} = props;

	const [queryApiKeysGraph, setQueryApiKeysGraph] = React.useState({});
	const [queryCollectionsGraph, setQueryCollectionsGraph] = React.useState({});
	const [queryInterfacesGraph, setQueryInterfacesGraph] = React.useState({});
	const [boolPoll, setBoolPoll] = React.useState(true);

	const [showCollections, setShowCollections] = React.useState(true);
	const [showInterfaces, setShowInterfaces] = React.useState(true);

	const fetchApiKeys = () => {
		fetch(`${servicesBaseUrl}/graphQL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: GQL })
		})
			.then(res => res.json())
			.then(res => {
				//console.log(res);
				if (res && res.data) {
					setQueryApiKeysGraph(res.data.queryApiKeys);
					setQueryCollectionsGraph(res.data.queryCollections);
					setQueryInterfacesGraph(res.data.queryInterfaces);
				}
			});
	};

	React.useEffect(() => fetchApiKeys(), []); // Only once

	useInterval(() => {
		// This will continue to run as long as the Collections "tab" is open
		if (boolPoll) {
			fetchApiKeys();
		}
	}, 2500);

	return <>
		<Segment basic inverted style={{
			marginLeft: -14,
			marginTop: -14,
			marginRight: -14
		}}>
			<Table basic collapsing compact inverted>
				<Table.Body>
					<Table.Row verticalAlign='middle'>
						<Table.Cell collapsing>
							<Radio
								checked={showCollections}
								onChange={(ignored,{checked}) => {
									setShowCollections(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show collection(s)</Label>
						</Table.Cell>
						<Table.Cell collapsing>
							<Radio
								checked={showInterfaces}
								onChange={(ignored,{checked}) => {
									setShowInterfaces(checked);
								}}
								toggle
							/>
							<Label color='black' size='large'>Show interface(s)</Label>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		</Segment>
		<Header as='h1'>API Keys</Header>
		<Table celled collapsing compact selectable sortable striped>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell>Edit</Table.HeaderCell>
					<Table.HeaderCell>Name</Table.HeaderCell>
					{showCollections ? <Table.HeaderCell>Collections</Table.HeaderCell> : null}
					{showInterfaces ? <Table.HeaderCell>Interfaces</Table.HeaderCell> : null}
					<Table.HeaderCell>Actions</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{queryApiKeysGraph.hits && queryApiKeysGraph.hits.map(({
					_name,
					collections,
					interfaces
				}) => {
					return <Table.Row key={_name}>
						<Table.Cell collapsing>
							<NewOrEditApiKeyModal
								_name={_name}
								initialValues={{
									_name,
									collections,
									interfaces
								}}
								onClose={() => {
									//console.debug('onClose');
									fetchApiKeys();
									setBoolPoll(true);
								}}
								onOpen={() => {
									console.debug('onOpen'); // For some reason does not get called???
									setBoolPoll(false);
								}}
								queryCollectionsGraph={queryCollectionsGraph}
								queryInterfacesGraph={queryInterfacesGraph}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
						<Table.Cell collapsing>{_name}</Table.Cell>
						{showCollections ? <Table.Cell>{collections.join(', ')}</Table.Cell> : null}
						{showInterfaces ? <Table.Cell>{interfaces.join(', ')}</Table.Cell> : null}
						<Table.Cell collapsing>
							<DeleteApiKeyModal
								_name={_name}
								onClose={() => {
									//console.debug('onClose');
									fetchApiKeys();
									setBoolPoll(true);
								}}
								onOpen={() => {
									//console.debug('onOpen'); // For some reason does not get called???
									setBoolPoll(false);
								}}
								servicesBaseUrl={servicesBaseUrl}
							/>
						</Table.Cell>
					</Table.Row>;
				})}
			</Table.Body>
		</Table>
		<NewOrEditApiKeyModal
			onClose={() => {
				//console.debug('onClose');
				fetchApiKeys();
				setBoolPoll(true);
			}}
			onOpen={() => {
				//console.debug('onOpen'); // Why this one gets called and not the other ones is beyond me???
				setBoolPoll(false);
			}}
			queryCollectionsGraph={queryCollectionsGraph}
			queryInterfacesGraph={queryInterfacesGraph}
			servicesBaseUrl={servicesBaseUrl}
		/>
	</>;
};

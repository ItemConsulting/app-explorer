import {
	Button,
	Header,
	Icon,
	Modal,
	Popup
} from 'semantic-ui-react';


export const DeleteApiKeyModal = (props) => {
	//console.debug('props', props);
	const {
		_name,
		onClose = () => {},
		onOpen = () => {},
		servicesBaseUrl
	} = props;
	const [state, setState] = React.useState({
		open: false
	});
	return <Modal
		closeIcon
		onClose={() => {
			setState({open: false});
			onClose();
		}}
		onOpen={onOpen}
		open={state.open}
		size='large'
		trigger={<Popup
			content={`Delete API Key ${_name}`}
			inverted
			trigger={<Button
				icon
				onClick={() => setState({open: true})}
			><Icon color='red' name='trash alternate outline'/></Button>}/>
		}
	>
		<Modal.Header>{`Delete API Key ${_name}`}</Modal.Header>
		<Modal.Content>
			<Header as='h2'>Do you really want to delete {_name}?</Header>
			<Button
				compact
				onClick={() => {
					fetch(`${servicesBaseUrl}/apiKeyDelete?name=${_name}`, {
						method: 'DELETE'
					}).then((/*response*/) => {
						//if (response.status === 200) {}
						setState({open: false});
						onClose();
					});
				}}
			><Icon color='red' name='trash alternate outline'/>Confirm Delete</Button>
		</Modal.Content>
	</Modal>;
}; // DeleteApiKeyModal

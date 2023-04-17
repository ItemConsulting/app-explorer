import { HTTP_HEADERS } from '@enonic/explorer-utils/src'
import GraphiQL from './GraphiQL';


function GraphiQLRouted({
	basename,
	interfaceNameState,
	searchString = '',
}: {
	basename: string
	interfaceNameState: string
	searchString?: string
}) {
	return <GraphiQL
		headers={{
			[HTTP_HEADERS.EXPLORER_INTERFACE_NAME.toLowerCase()]: interfaceNameState
		}}
		searchString={searchString}
		url={`${basename}/api/v1/interface`}
	/>;
}

export default GraphiQLRouted;

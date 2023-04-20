import type {EnonicXpRequest} from '/lib/explorer/types/index.d';

export function safelyGetHeader(request: EnonicXpRequest, header: string): string {
	const lowerCase = header.toLowerCase();
	const list = lowerCase.split('-')
	const camelCase = list?.map((item) => {
		return item.charAt(0).toUpperCase() + item.slice(1);
	}).join('-')
	return request?.headers?.[lowerCase] ?? request?.headers?.[camelCase];
}

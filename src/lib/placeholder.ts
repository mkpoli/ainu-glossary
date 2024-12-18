export function isPlaceholderLike(text: string): boolean {
	return Boolean(text.match(/^[VNS]\d|YYYY|MM|DD|HH|SS$/));
}
export function removePlaceholders(text: string) {
	return text
		.replace(/[VNS]\d|YYYY|MM|DD|HH|SS|a=|=an/gm, '')
		.trim()
		.replace(/\s+/g, ' ');
}

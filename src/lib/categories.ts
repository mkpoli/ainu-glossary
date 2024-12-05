export class CategoriesEncoder {
	private bitmaskSize: number = 64;
	private category2id: Map<string, number>;

	constructor(categories: [number, string][], bitmaskSize: number = 64) {
		this.bitmaskSize = bitmaskSize;
		this.category2id = new Map(categories.map(([id, category]) => [category, id]));
	}

	async encode(categories: string[], bitmaskSize: number = 64): Promise<string> {
		let bitmask = 0n;

		for (const category of categories) {
			const index = this.category2id.get(category) ?? 0;
			bitmask |= 1n << BigInt(index);
		}

		const byteArray: number[] = [];
		let temp = bitmask;
		while (temp > 0n) {
			byteArray.push(Number(temp & 0xffn));
			temp >>= 8n;
		}
		return btoa(String.fromCharCode(...byteArray.reverse()))
			.replaceAll('/', '_')
			.replaceAll('+', '-')
			.replaceAll('=', '');
	}

	async decode(encoded: string): Promise<string[]> {
		const decoded = encoded.replaceAll('_', '/').replaceAll('-', '+');
		const binaryString = atob(decoded);
		const byteArray = new Uint8Array(binaryString.length);

		for (let i = 0; i < binaryString.length; i++) {
			byteArray[i] = binaryString.charCodeAt(i);
		}

		let bitmask = BigInt(0);
		for (const byte of byteArray) {
			bitmask = (bitmask << 8n) | BigInt(byte);
		}

		const selectedCategories = [];
		for (const [category, id] of this.category2id) {
			if ((bitmask & (BigInt(1) << BigInt(id))) !== 0n) {
				selectedCategories.push(category);
			}
		}

		return selectedCategories;
	}
}

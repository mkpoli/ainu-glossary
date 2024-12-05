export class CategoriesEncoder {
	private bitmaskSize: number = 64;
	private categories: string[] = [];

	constructor(categories: string[], bitmaskSize: number = 64) {
		this.bitmaskSize = bitmaskSize;
		this.categories = categories;
	}

	private async getBitIndex(category: string): Promise<number> {
		const encoder = new TextEncoder();
		const data = encoder.encode(category);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = new Uint8Array(hashBuffer);
		const index = (hashArray[0] << 8) | hashArray[1];
		return index % this.bitmaskSize;
	}

	async encode(categories: string[], bitmaskSize: number = 64): Promise<string> {
		let bitmask = 0n;

		for (const category of categories) {
			const index = await this.getBitIndex(category);
			bitmask |= 1n << BigInt(index);
		}

		const byteArray: number[] = [];
		let temp = bitmask;
		while (temp > 0n) {
			byteArray.push(Number(temp & 0xffn));
			temp >>= 8n;
		}

		const base64String = btoa(String.fromCharCode(...byteArray.reverse()))
			.replace(/\//g, '_')
			.replace(/\+/g, '-')
			.replace(/=+$/, '');
		return base64String;
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
		for (const category of this.categories) {
			const index = await this.getBitIndex(category);
			if ((bitmask & (BigInt(1) << BigInt(index))) !== 0n) {
				selectedCategories.push(category);
			}
		}

		return selectedCategories;
	}
}

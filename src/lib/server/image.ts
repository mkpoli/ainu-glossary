import satori, { type SatoriOptions } from 'satori';
import { html } from 'satori-html';
import { PRIVATE_GOOGLE_WEBFONTS_API_KEY } from '$env/static/private';

const WEBFONTS_API = 'https://www.googleapis.com/webfonts/v1/webfonts';

// resvg initializes once per isolate; its .wasm ships as a module import, the
// only form of WebAssembly loading workerd permits.
let resvgReady: Promise<typeof import('@resvg/resvg-wasm')> | undefined;

function getResvg() {
	resvgReady ??= (async () => {
		const [resvg, { default: wasm }] = await Promise.all([
			import('@resvg/resvg-wasm'),
			import('@resvg/resvg-wasm/index_bg.wasm')
		]);
		await resvg.initWasm(wasm);
		return resvg;
	})();
	return resvgReady;
}

export async function downloadFonts(
	fonts: { name: string; variants: string[] }[]
): Promise<Buffer[]> {
	const url = `${WEBFONTS_API}?key=${PRIVATE_GOOGLE_WEBFONTS_API_KEY}&family=${fonts
		.map((font) => encodeURIComponent(font.name))
		.join('&family=')}`;
	const listResponse = await fetch(url);
	if (!listResponse.ok) {
		throw new Error(`Webfonts API failed: ${listResponse.status}`);
	}
	const data = (await listResponse.json()) as {
		items?: { family?: string; files?: Record<string, string> }[];
	};
	if (!data.items) {
		throw new Error('No fonts found');
	}

	const variantsByFont = Object.fromEntries(fonts.map((font) => [font.name, font.variants]));

	return await Promise.all(
		data.items.flatMap(async (item) => {
			if (!item.files) {
				throw new Error('No font files found');
			}
			if (!item.family) {
				throw new Error('No font family found');
			}
			console.log('item.family', item.family);
			console.log('variantsByFont[item.family]', variantsByFont[item.family]);
			console.log('item.files', item.files);
			const fontFile = item.files[variantsByFont[item.family]?.[0]];
			if (!fontFile) {
				throw new Error('No font file found');
			}
			const fontResponse = await fetch(fontFile);
			if (!fontResponse.ok) {
				throw new Error('Failed to fetch font');
			}
			const fontBuffer = await fontResponse.arrayBuffer();
			return Buffer.from(fontBuffer);
		})
	);
}

export async function generateImage(content: [string, string], assetFetch: typeof globalThis.fetch) {
	try {
		const FONTS = [
			{ name: 'El Messiri', variants: ['700'] },
			{ name: 'Noto Serif JP', variants: ['800'] }
		];
		const fontBuffers = await downloadFonts(FONTS);

		const options = {
			width: 1200,
			height: 630,
			fonts: fontBuffers.map((fontBuffer, index) => ({
				name: FONTS[index].name,
				data: fontBuffer
			}))
		} satisfies SatoriOptions;

		function getFontSize(text: string) {
			return text.length <= 5
				? '192px'
				: text.length <= 10
					? '128px'
					: text.length <= 15
						? '96px'
						: text.length <= 20
							? '64px'
							: '48px';
		}

		function getGap(text: string) {
			return text.length <= 5
				? '0px'
				: text.length <= 10
					? '32px'
					: text.length <= 15
						? '16px'
						: text.length <= 20
							? '16px'
							: '12px';
		}

		console.log(getFontSize(content[0]), getGap(content[0]));

		const backgroundImagePath = '/og-template.png';
		const backgroundImageResponse = await assetFetch(backgroundImagePath);
		if (!backgroundImageResponse.ok) {
			throw new Error('Failed to fetch background image');
		}
		const backgroundImageBuffer = await backgroundImageResponse.arrayBuffer();
		const backgroundDataUri = `data:image/png;base64,${Buffer.from(backgroundImageBuffer).toString('base64')}`;

		const svg = await satori(
			html`<div
				style="color: white; display: flex; align-items: center; justify-content: center; text-align: center; width: 100%; height: 100%; font-size: ${getFontSize(
					content[0]
				)}; gap: ${getGap(
					content[0]
				)}; flex-direction: column; line-height: 1; text-shadow: 0 0 10px rgba(0, 0, 0, 0.5); background-image: url('${backgroundDataUri}'); background-size: 1200px 630px;"
			>
				<p
					style="margin: 0; max-width: 800px; word-break: break-all; font-family:${FONTS[0]
						.name}; font-weight: ${FONTS[0].variants[0]}; font-size: 1.125em;"
				>
					${content[0]}
				</p>
				<p
					style="margin: 0; max-width: 800px; word-break: break-all; font-family:${FONTS[1]
						.name}; font-weight: ${FONTS[1].variants[0]};"
				>
					${content[1]}
				</p>
			</div>`,
			options
		);

		const { Resvg } = await getResvg();
		const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
		return resvg.render().asPng();
	} catch (error) {
		console.error(error);
	}
}

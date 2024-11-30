import satori, { type SatoriOptions } from 'satori';
import { html } from 'satori-html';
import { PRIVATE_GOOGLE_WEBFONTS_API_KEY } from '$env/static/private';
import { google } from 'googleapis';
import sharp from 'sharp';

const webfonts = google.webfonts({
	version: 'v1',
	auth: PRIVATE_GOOGLE_WEBFONTS_API_KEY
});

export async function downloadFonts(
	fonts: { name: string; variants: string[] }[]
): Promise<Buffer[]> {
	const { data } = await webfonts.webfonts.list({
		family: fonts.map((font) => font.name)
	});
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

export async function generateImage(content: [string, string], fetch: typeof globalThis.fetch) {
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

		const svg = await satori(
			html`<div
				style="color: white; display: flex; align-items: center; justify-content: center; text-align: center; width: 100%; height: 100%; font-size: ${getFontSize(
					content[0]
				)}; gap: ${getGap(
					content[0]
				)}; flex-direction: column; line-height: 1; text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);"
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

		const backgroundImagePath = '/og-template.png';
		const backgroundImageResponse = await fetch(backgroundImagePath);
		if (!backgroundImageResponse.ok) {
			throw new Error('Failed to fetch background image');
		}
		const backgroundImageBuffer = await backgroundImageResponse.arrayBuffer();

		const background = await sharp(backgroundImageBuffer).resize(1200, 630).toBuffer();
		const png = await sharp(background)
			.composite([{ input: Buffer.from(svg) }])
			.png()
			.toBuffer();
		return png;
	} catch (error) {
		console.error(error);
	}
}

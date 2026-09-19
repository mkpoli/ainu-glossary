import { convertKanaToLatn, convertLatnToKana } from 'ainconv';
import { segment } from './segment';

export function latn2kana(latn: string) {
	const processedLatn = latn
		.replace(/-/g, ' ')
		.replace(/\buo/gi, 'uwo')
		.replace(/\bue/gi, 'uwe')
		.replace(/\boue/gi, 'ouwe')
		.replace(/\bio/gi, 'iyo')
		.replace(/\bie/gi, 'iye')
		.replace(/\beie/gi, 'eiye')
		.replace(/or ta/gi, 'otta')
		.replace(/an=ye/gi, 'ayye')
		.replace(/mp/gi, 'np')
		.replace(/mm/gi, 'nm')
		.replace(/b/g, 'p')
		.replace(/d/g, 't')
		.replace(/g/g, 'k')
		.replace(/z/g, 'c');

	try {
		const converted = convertLatnToKana(processedLatn);
		return converted.replace(/ト゚/g, 'ツ゚');
	} catch (e) {
		// console.error(`Error converting Latn "${latn}" to Kana`, e);
		return processedLatn;
	}
}

export function kana2latn(kana: string) {
	return segment(kana, 'ain-Kana')
		.map((segment) => convertKanaToLatn(segment.segment))
		.join('');
}

import { browser } from '$app/environment';
import { convertLatnToKana } from 'ainconv';
export type Script = 'Kana' | 'Latn';

function latn2kana(latn: string) {
	const processedLatn = latn
		.replace(/-/g, ' ')
		.replace(/\buo/gi, 'uwo')
		.replace(/\bue/gi, 'uwe')
		.replace(/\bio/gi, 'iyo')
		.replace(/\bie/gi, 'iye')
		.replace(/or ta/gi, 'otta')
		.replace(/an=ye/gi, 'ayye')
		.replace(/mp/gi, 'np')
		.replace(/mm/gi, 'nm');

	const converted = convertLatnToKana(processedLatn);

	return converted.replace(/ト゚/g, 'ツ゚');
	// return processedLatn;
}

function createScriptManager() {
	let script = $state<Script>('Latn');
	let t = $derived(script === 'Kana' ? latn2kana : (latn: string) => latn);

	return {
		get script() {
			return script;
		},
		set script(value: 'Kana' | 'Latn') {
			script = value;
			if (browser) {
				document.documentElement.lang = value === 'Kana' ? 'ain-Kana' : 'ain-Latn';
			}
		},
		get t() {
			return t;
		}
	};
}

export default createScriptManager();

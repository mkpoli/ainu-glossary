import { browser } from '$app/environment';
import { convertLatnToKana } from 'ainconv';
export type Script = 'Kana' | 'Latn';

function latn2kana(latn: string) {
	const processedLatn = latn
		.replace(/-/g, ' ')
		.replace(/\buo/g, 'uwo')
		.replace(/\bue/g, 'uwe')
		.replace(/\bio/g, 'iyo')
		.replace(/\bie/g, 'iye');

	return convertLatnToKana(processedLatn);
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

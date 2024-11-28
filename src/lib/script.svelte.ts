import { browser } from '$app/environment';
import { convertLatnToKana } from 'ainconv';
export type Script = 'Kana' | 'Latn';

function createScriptManager() {
	let script = $state<Script>('Latn');
	let t = $derived(script === 'Kana' ? convertLatnToKana : (latn: string) => latn);

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

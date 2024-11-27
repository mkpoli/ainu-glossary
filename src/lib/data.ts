export interface Entry {
	日本語: string;
	English: string;
	中文: string;
	Aynu: string;
	sheetName: string;
}

export const GOOGLE_SHEET_LINK =
	'https://docs.google.com/spreadsheets/d/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/edit?usp=sharing';

export async function fetchData(fetch: (url: string) => Promise<Response>): Promise<Entry[]> {
	const res = await fetch('/api/gdoc');
	const json = await res.json();
	return json;
}

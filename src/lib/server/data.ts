import type { Entry, Sheet } from '$lib/data';
import type { R2Bucket } from '@cloudflare/workers-types';
import { getGoogleAccessToken } from './google-auth';

interface GoogleCredentials {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
}
let googleCredentials: GoogleCredentials;

try {
	const {
		PRIVATE_GOOGLE_API_TYPE,
		PRIVATE_GOOGLE_API_PROJECT_ID,
		PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
		PRIVATE_GOOGLE_API_PRIVATE_KEY,
		PRIVATE_GOOGLE_API_CLIENT_EMAIL,
		PRIVATE_GOOGLE_API_CLIENT_ID
	} = await import('$env/static/private');
	googleCredentials = {
		type: PRIVATE_GOOGLE_API_TYPE,
		project_id: PRIVATE_GOOGLE_API_PROJECT_ID,
		private_key_id: PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
		private_key: PRIVATE_GOOGLE_API_PRIVATE_KEY,
		client_email: PRIVATE_GOOGLE_API_CLIENT_EMAIL,
		client_id: PRIVATE_GOOGLE_API_CLIENT_ID
	};
} catch (e) {
	// Use dot env

	const {
		PRIVATE_GOOGLE_API_TYPE,
		PRIVATE_GOOGLE_API_PROJECT_ID,
		PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
		PRIVATE_GOOGLE_API_PRIVATE_KEY,
		PRIVATE_GOOGLE_API_CLIENT_EMAIL,
		PRIVATE_GOOGLE_API_CLIENT_ID
	} = import.meta.env;

	googleCredentials = {
		type: PRIVATE_GOOGLE_API_TYPE,
		project_id: PRIVATE_GOOGLE_API_PROJECT_ID,
		private_key_id: PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
		private_key: PRIVATE_GOOGLE_API_PRIVATE_KEY,
		client_email: PRIVATE_GOOGLE_API_CLIENT_EMAIL,
		client_id: PRIVATE_GOOGLE_API_CLIENT_ID
	};
}

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

async function sheetsApi<T>(path: string): Promise<T> {
	const token = await getGoogleAccessToken(googleCredentials, SHEETS_SCOPE);
	const response = await fetch(`${SHEETS_API}${path}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!response.ok) {
		throw new Error(`Sheets API ${path} failed: ${response.status} ${await response.text()}`);
	}
	return response.json() as Promise<T>;
}

const TABLE_KEY = 'table.json';
const SHEETS_KEY = 'sheets.json';

/** The R2 operations the glossary needs, served by the `GLOSSARY_BUCKET` binding. */
export type GlossaryBucket = Pick<R2Bucket, 'get' | 'head' | 'put'>;

export function glossaryBucket(platform: App.Platform | undefined): GlossaryBucket {
	const bucket = platform?.env?.GLOSSARY_BUCKET;
	if (!bucket) {
		throw new Error('The GLOSSARY_BUCKET R2 binding is missing from platform.env');
	}
	return bucket;
}

function versionOf(table: { etag: string }, sheets: { etag: string }): string {
	return `${table.etag}:${sheets.etag}`;
}

/** Identifies the stored glossary by its ETags; changes whenever either object is rewritten. */
export async function dataVersion(bucket: GlossaryBucket): Promise<string | undefined> {
	const [table, sheets] = await Promise.all([bucket.head(TABLE_KEY), bucket.head(SHEETS_KEY)]);
	return table && sheets ? versionOf(table, sheets) : undefined;
}

export async function downloadData(bucket: GlossaryBucket): Promise<{
	table: Entry[];
	sheets: Sheet[];
	lastModified: Date;
	version: string;
}> {
	const [table, sheets] = await Promise.all([bucket.get(TABLE_KEY), bucket.get(SHEETS_KEY)]);
	if (!table || !sheets) {
		const missing = [!table && TABLE_KEY, !sheets && SHEETS_KEY].filter(Boolean).join(', ');
		throw new Error(`Glossary bucket has no ${missing}`);
	}

	return {
		table: await table.json<Entry[]>(),
		sheets: await sheets.json<Sheet[]>(),
		lastModified: table.uploaded,
		version: versionOf(table, sheets)
	};
}

export async function updateData(bucket: GlossaryBucket): Promise<void> {
	console.info('[updateData] Start');

	const sheets = await sheetsApi<{
		sheets?: { properties?: { title?: string } }[];
	}>('/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE');

	console.info('[updateData] Sheets fetched');

	const all_sheets_sheet = sheets.sheets?.find((sheet) => sheet.properties?.title === 'all_sheets');

	console.info('[updateData] all_sheets sheet found');

	if (!all_sheets_sheet) {
		throw new Error('No all_sheets sheet found');
	}

	console.info('[updateData] all_sheets sheet values fetched');

	const all_sheets = (
		await sheetsApi<{ values?: string[][] }>(
			'/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/values/all_sheets'
		)
	)
		.values!.slice(1)
		.map(([isContent, sheetName, description, count, id]) => {
			return {
				isContent: isContent === 'TRUE',
				sheetName,
				description,
				count: parseInt(count),
				id: parseInt(id)
			};
		});

	console.info(`[updateData] all_sheets parsed ${all_sheets.length} sheets`);

	const all_content_sheets = all_sheets.filter((sheet) => sheet.isContent);

	const all_content_sheets_data: Record<
		string,
		{
			[key: string]: string;
		}[]
	> = {};

	console.info(`[updateData] Fetching ${all_content_sheets.length} content sheets`);

	for (const sheet of all_content_sheets) {
		const sheet_data = await sheetsApi<{ values?: string[][] }>(
			`/1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE/values/${encodeURIComponent(sheet.sheetName)}`
		);

		const sheet_data_values = sheet_data.values!.slice(1).map((row) => {
			return row.reduce((acc, cell, i) => {
				acc[sheet_data.values![0][i]] = cell;
				return acc;
			}, {});
		});

		all_content_sheets_data[sheet.sheetName] = sheet_data_values;
	}

	console.info('[updateData] Content sheets data fetched');

	// Flatten to { ...item, sheetName: sheetName }

	const all_content_sheets_data_flattened = Object.entries(all_content_sheets_data).reduce(
		(acc, [sheetName, data]) => {
			return [...acc, ...data.map((item) => ({ ...item, sheetName }))];
		},
		[] as { [key: string]: string }[]
	);

	console.info('[updateData] Content sheets data flattened');

	// console.log(all_content_sheets_data_flattened);

	console.info('[updateData] Uploading to Cloudflare R2');

	const json = { httpMetadata: { contentType: 'application/json' } };
	await bucket.put(TABLE_KEY, JSON.stringify(all_content_sheets_data_flattened), json);
	await bucket.put(SHEETS_KEY, JSON.stringify(all_content_sheets), json);

	console.info('[updateData] Uploaded to Cloudflare R2');
}

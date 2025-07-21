// @ts-expect-error: Cloudflare Workers types are available in the runtime
import type { ScheduledController, ExecutionContext, R2Bucket } from '@cloudflare/workers-types';

interface GoogleKey {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
}

class GoogleOAuth {
	constructor(
		public googleKey: GoogleKey,
		public scopes: string[]
	) {}

	public async getGoogleAuthToken(): Promise<string | undefined> {
		const { client_email: user, private_key: key } = this.googleKey;
		const scope = this.formatScopes(this.scopes);
		const jwtHeader = this.objectToBase64url({ alg: 'RS256', typ: 'JWT' });

		try {
			const assertiontime = Math.round(Date.now() / 1000);
			const expirytime = assertiontime + 3600;
			const claimset = this.objectToBase64url({
				iss: user,
				scope,
				aud: 'https://oauth2.googleapis.com/token',
				exp: expirytime,
				iat: assertiontime
			});

			const jwtUnsigned = `${jwtHeader}.${claimset}`;
			const signedJwt = `${jwtUnsigned}.${await this.sign(jwtUnsigned, key)}`;
			const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${signedJwt}`;

			const response = await fetch(this.googleKey.token_uri, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cache-Control': 'no-cache',
					Host: 'oauth2.googleapis.com'
				},
				body
			});

			const resp = await response.json();
			return resp.access_token;
		} catch (err) {
			console.error(err);
			return undefined;
		}
	}

	private objectToBase64url(object: object): string {
		const uint8 = new TextEncoder().encode(JSON.stringify(object));
		return this.arrayBufferToBase64Url(
			uint8.buffer.slice(uint8.byteOffset, uint8.byteOffset + uint8.byteLength) as ArrayBuffer
		);
	}

	private arrayBufferToBase64Url(buffer: ArrayBuffer): string {
		return btoa(String.fromCharCode(...new Uint8Array(buffer)))
			.replace(/=/g, '')
			.replace(/\+/g, '-')
			.replace(/\//g, '_');
	}

	private str2ab(str: string): ArrayBuffer {
		const buf = new ArrayBuffer(str.length);
		const bufView = new Uint8Array(buf);
		for (let i = 0, strLen = str.length; i < strLen; i += 1) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	private async sign(content: string, signingKey: string): Promise<string> {
		const buf = this.str2ab(content);
		const plainKey = signingKey
			.replace(/(\r\n|\n|\r)/gm, '')
			.replace(/\\n/g, '')
			.replace('-----BEGIN PRIVATE KEY-----', '')
			.replace('-----END PRIVATE KEY-----', '')
			.trim();

		const binaryKey = this.str2ab(atob(plainKey));
		const signer = await crypto.subtle.importKey(
			'pkcs8',
			binaryKey,
			{
				name: 'RSASSA-PKCS1-V1_5',
				hash: { name: 'SHA-256' }
			},
			false,
			['sign']
		);
		const binarySignature = await crypto.subtle.sign({ name: 'RSASSA-PKCS1-V1_5' }, signer, buf);
		return this.arrayBufferToBase64Url(binarySignature);
	}

	// formatScopes will create a scopes string that is formatted for the Google API
	private formatScopes(scopes: string[]): string {
		return scopes.join(' ');
	}
}

export interface Env {
	GDOCS_SPREADSHEET_ID: string;
	GLOSSARY_BUCKET: R2Bucket;
	GAPI_PROJECT_ID: string;
	GAPI_CLIENT_EMAIL: string;
	GAPI_CLIENT_ID: string;
	GAPI_PRIVATE_KEY_ID: string;
	GAPI_PRIVATE_KEY: string;
	GAPI_API_AUTH_URI: string;
	GAPI_API_TOKEN_URI: string;
	GAPI_API_AUTH_PROVIDER_X509_CERT_URL: string;
	GAPI_API_CLIENT_X509_CERT_URL: string;
	GAPI_API_UNIVERSE_DOMAIN: string;
}

// Utility to mimic the needed Google Sheets API functionality
function createSheetsApi(token: string, spreadsheetId: string) {
	const base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
	return {
		async getSpreadsheet() {
			const res = await fetch(`${base}?includeGridData=false`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error(`Failed to fetch spreadsheet: ${res.status}`);
			return await res.json();
		},
		async getValues(range: string) {
			const res = await fetch(`${base}/values/${encodeURIComponent(range)}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error(`Failed to fetch values: ${res.status}`);
			return await res.json();
		}
	};
}

async function updateData(sheetsApi: ReturnType<typeof createSheetsApi>, env: Env): Promise<void> {
	console.info('[updateData] Start');

	const sheets = await sheetsApi.getSpreadsheet();

	console.info('[updateData] Sheets fetched');

	const all_sheets_sheet = sheets.sheets?.find(
		(sheet: any) => sheet.properties?.title === 'all_sheets'
	);

	console.info('[updateData] all_sheets sheet found');

	if (!all_sheets_sheet) {
		throw new Error('No all_sheets sheet found');
	}

	console.info('[updateData] all_sheets sheet values fetched');

	const all_sheets_data = await sheetsApi.getValues('all_sheets');
	const all_sheets =
		all_sheets_data.values
			?.slice(1)
			.map(([isContent, sheetName, description, count, id]: string[]) => {
				return {
					isContent: isContent === 'TRUE',
					sheetName,
					description,
					count: parseInt(count),
					id: parseInt(id)
				};
			}) ?? [];

	console.info(`[updateData] all_sheets parsed ${all_sheets.length} sheets`);

	const all_content_sheets = all_sheets.filter((sheet) => sheet.isContent);

	const all_content_sheets_data: Record<string, { [key: string]: string }[]> = {};

	console.info(`[updateData] Fetching ${all_content_sheets.length} content sheets`);

	for (const sheet of all_content_sheets) {
		const sheet_data = await sheetsApi.getValues(sheet.sheetName);
		const sheet_data_values =
			sheet_data.values?.slice(1).map((row: string[]) => {
				return row.reduce((acc: any, cell: string, i: number) => {
					acc[sheet_data.values[0][i]] = cell;
					return acc;
				}, {});
			}) ?? [];
		all_content_sheets_data[sheet.sheetName] = sheet_data_values;
	}

	console.info('[updateData] Content sheets data fetched');

	const all_content_sheets_data_flattened = Object.entries(all_content_sheets_data).reduce(
		(acc, [sheetName, data]) => {
			return [...acc, ...data.map((item) => ({ ...item, sheetName }))];
		},
		[] as { [key: string]: string }[]
	);

	console.info('[updateData] Content sheets data flattened');

	console.info('[updateData] Uploading to Cloudflare R2');
	await env.GLOSSARY_BUCKET.put('table.json', JSON.stringify(all_content_sheets_data_flattened), {
		httpMetadata: {
			contentType: 'application/json'
		}
	});

	await env.GLOSSARY_BUCKET.put('sheets.json', JSON.stringify(all_sheets), {
		httpMetadata: {
			contentType: 'application/json'
		}
	});

	console.info('[updateData] Uploaded to Cloudflare R2');
}

async function triggerUpdate(env: Env): Promise<Response> {
	const requiredVars = [
		'GAPI_PROJECT_ID',
		'GAPI_CLIENT_EMAIL',
		'GAPI_CLIENT_ID',
		'GAPI_PRIVATE_KEY_ID',
		'GAPI_PRIVATE_KEY',
		'GAPI_API_AUTH_URI',
		'GAPI_API_TOKEN_URI',
		'GAPI_API_AUTH_PROVIDER_X509_CERT_URL',
		'GAPI_API_CLIENT_X509_CERT_URL',
		'GAPI_API_UNIVERSE_DOMAIN',
		'GDOCS_SPREADSHEET_ID',
		'GLOSSARY_BUCKET'
	];
	const missing = requiredVars.filter((key) => !env[key as keyof typeof env]);
	if (missing.length) {
		throw new Error('Missing environment variables: ' + missing.join(', '));
	}
	const auth = new GoogleOAuth(
		{
			type: 'service_account',
			project_id: env.GAPI_PROJECT_ID,
			private_key_id: env.GAPI_PRIVATE_KEY_ID,
			private_key: env.GAPI_PRIVATE_KEY,
			client_email: env.GAPI_CLIENT_EMAIL,
			client_id: env.GAPI_CLIENT_ID,
			auth_uri: env.GAPI_API_AUTH_URI,
			token_uri: env.GAPI_API_TOKEN_URI,
			auth_provider_x509_cert_url: env.GAPI_API_AUTH_PROVIDER_X509_CERT_URL,
			client_x509_cert_url: env.GAPI_API_CLIENT_X509_CERT_URL,
			universe_domain: env.GAPI_API_UNIVERSE_DOMAIN
		} as GoogleKey,
		['https://www.googleapis.com/auth/spreadsheets.readonly']
	);
	const token = await auth.getGoogleAuthToken();
	if (!token) {
		throw new Error('Failed to obtain Google API token');
	}
	const spreadsheetId = env.GDOCS_SPREADSHEET_ID;
	if (!spreadsheetId) {
		throw new Error('GDOCS_SPREADSHEET_ID environment variable is not set');
	}
	const sheetsApi = createSheetsApi(token, spreadsheetId);
	try {
		await updateData(sheetsApi, env);
		return new Response('Success', { status: 200 });
	} catch (e) {
		console.error('Error in worker:', e);
		return new Response('Error', { status: 500 });
	}
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		await triggerUpdate(env);
	},
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		if (new URL(request.url).pathname === '/') {
			return await triggerUpdate(env);
		}
		return new Response('Not found', { status: 404 });
	}
};

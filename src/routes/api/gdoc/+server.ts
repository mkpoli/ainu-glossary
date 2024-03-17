import { json } from '@sveltejs/kit';
import { google } from 'googleapis';
import type { RequestHandler } from './$types';

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import {
	PRIVATE_CLOUDFLARE_R2_S3_ACCESS_KEY_ID,
	PRIVATE_CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY,
	PRIVATE_CLOUDFLARE_R2_S3_BUCKET,
	PRIVATE_CLOUDFLARE_R2_S3_ENDPOINT,
	PRIVATE_GOOGLE_API_TYPE,
	PRIVATE_GOOGLE_API_KEY,
	PRIVATE_GOOGLE_API_PROJECT_ID,
	PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
	PRIVATE_GOOGLE_API_PRIVATE_KEY,
	PRIVATE_GOOGLE_API_CLIENT_EMAIL,
	PRIVATE_GOOGLE_API_CLIENT_ID,
	PRIVATE_GOOGLE_API_AUTH_URI,
	PRIVATE_GOOGLE_API_TOKEN_URI,
	PRIVATE_GOOGLE_API_AUTH_PROVIDER_X509_CERT_URL,
	PRIVATE_GOOGLE_API_CLIENT_X509_CERT_URL,
	PRIVATE_GOOGLE_API_UNIVERSE_DOMAIN
} from '$env/static/private';

// import { PRIVATE_GOOGLE_API_KEY } from '$env/static/private';
// import { PRIVATE_GOOGLE_APPLICATION_CREDENTIALS } from '$env/static/private';
const auth = new google.auth.GoogleAuth({
	// keyFile: PRIVATE_GOOGLE_APPLICATION_CREDENTIALS,
	credentials: {
		type: PRIVATE_GOOGLE_API_TYPE,
		project_id: PRIVATE_GOOGLE_API_PROJECT_ID,
		private_key_id: PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
		private_key: PRIVATE_GOOGLE_API_PRIVATE_KEY,
		client_email: PRIVATE_GOOGLE_API_CLIENT_EMAIL,
		client_id: PRIVATE_GOOGLE_API_CLIENT_ID,
		auth_uri: PRIVATE_GOOGLE_API_AUTH_URI,
		token_uri: PRIVATE_GOOGLE_API_TOKEN_URI,
		auth_provider_x509_cert_url: PRIVATE_GOOGLE_API_AUTH_PROVIDER_X509_CERT_URL,
		client_x509_cert_url: PRIVATE_GOOGLE_API_CLIENT_X509_CERT_URL
	},
	scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const docs = google.sheets({ version: 'v4', auth });

const s3 = new S3Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: PRIVATE_CLOUDFLARE_R2_S3_ACCESS_KEY_ID,
		secretAccessKey: PRIVATE_CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY
	},
	endpoint: PRIVATE_CLOUDFLARE_R2_S3_ENDPOINT
});

export const GET: RequestHandler = async () => {
	// Retrive data from R2 through S3 API
	try {
		const result = await s3.send(
			new GetObjectCommand({
				Bucket: PRIVATE_CLOUDFLARE_R2_S3_BUCKET,
				Key: 'table.json'
			})
		);

		const chunks: Uint8Array[] = [];
		for await (const chunk of result.Body) {
			chunks.push(chunk);
		}

		const buffer = Buffer.concat(chunks);

		return json(JSON.parse(buffer.toString()));
	} catch (e) {
		console.error(e);
		return json({ error: e });
	}

	// return json(document.data);
	// return json(all_content_sheets_data_flattened);
	// return new Response('Hello from the server!', {
	// 	headers: {
	// 		'content-type': 'application/json'
	// 	}
	// });
};

export const POST: RequestHandler = async (request) => {
	const sheets = await docs.spreadsheets.get({
		spreadsheetId: '1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE'
	});

	const all_sheets_sheet = sheets.data.sheets?.find(
		(sheet) => sheet.properties?.title === 'all_sheets'
	);

	if (!all_sheets_sheet) {
		return json({ error: 'No all_sheets sheet found' });
	}

	const all_sheets = (
		await docs.spreadsheets.values.get({
			spreadsheetId: '1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE',
			range: 'all_sheets'
		})
	).data
		.values!.slice(1)
		.map(([isContent, sheetName, description, count]) => {
			return { isContent: isContent === 'TRUE', sheetName, description, count: parseInt(count) };
		});

	const all_content_sheets = all_sheets.filter((sheet) => sheet.isContent);

	const all_content_sheets_data: Record<
		string,
		{
			[key: string]: string;
		}[]
	> = {};

	for (const sheet of all_content_sheets) {
		const sheet_data = (
			await docs.spreadsheets.values.get({
				spreadsheetId: '1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE',
				range: sheet.sheetName
			})
		).data;

		const sheet_data_values = sheet_data.values!.slice(1).map((row) => {
			return row.reduce((acc, cell, i) => {
				acc[sheet_data.values![0][i]] = cell;
				return acc;
			}, {});
		});

		all_content_sheets_data[sheet.sheetName] = sheet_data_values;
	}

	// Flatten to { ...item, sheetName: sheetName }

	const all_content_sheets_data_flattened = Object.entries(all_content_sheets_data).reduce(
		(acc, [sheetName, data]) => {
			return [...acc, ...data.map((item) => ({ ...item, sheetName }))];
		},
		[] as { [key: string]: string }[]
	);

	// console.log(all_content_sheets_data_flattened);

	// Upload the result to Cloudflare R2 thourgh S3 API

	await s3.send(
		new PutObjectCommand({
			Bucket: PRIVATE_CLOUDFLARE_R2_S3_BUCKET,
			Key: 'table.json',
			Body: JSON.stringify(all_content_sheets_data_flattened),
			ContentType: 'application/json'
		})
	);

	return new Response('Success', {
		headers: {
			'content-type': 'application/json'
		}
	});
};

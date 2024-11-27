import {
	PRIVATE_CLOUDFLARE_R2_S3_ACCESS_KEY_ID,
	PRIVATE_CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY,
	PRIVATE_CLOUDFLARE_R2_S3_BUCKET,
	PRIVATE_CLOUDFLARE_R2_S3_ENDPOINT,
	PRIVATE_GOOGLE_API_TYPE,
	PRIVATE_GOOGLE_API_PROJECT_ID,
	PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
	PRIVATE_GOOGLE_API_PRIVATE_KEY,
	PRIVATE_GOOGLE_API_CLIENT_EMAIL,
	PRIVATE_GOOGLE_API_CLIENT_ID
} from '$env/static/private';
import type { Entry, Sheet } from '$lib/data';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { google } from 'googleapis';
const auth = new google.auth.GoogleAuth({
	// keyFile: PRIVATE_GOOGLE_APPLICATION_CREDENTIALS,
	credentials: {
		type: PRIVATE_GOOGLE_API_TYPE,
		project_id: PRIVATE_GOOGLE_API_PROJECT_ID,
		private_key_id: PRIVATE_GOOGLE_API_PRIVATE_KEY_ID,
		private_key: PRIVATE_GOOGLE_API_PRIVATE_KEY,
		client_email: PRIVATE_GOOGLE_API_CLIENT_EMAIL,
		client_id: PRIVATE_GOOGLE_API_CLIENT_ID
	},
	scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

import type { NodeJsClient } from '@smithy/types';

const docs = google.sheets({ version: 'v4', auth });
import { Buffer } from 'node:buffer';

const s3 = new S3Client({
	region: 'us-east-1',
	credentials: {
		accessKeyId: PRIVATE_CLOUDFLARE_R2_S3_ACCESS_KEY_ID,
		secretAccessKey: PRIVATE_CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY
	},
	endpoint: PRIVATE_CLOUDFLARE_R2_S3_ENDPOINT
}) as NodeJsClient<S3Client>;

export async function downloadTextFile(key: string): Promise<string> {
	const result = await s3.send(
		new GetObjectCommand({ Bucket: PRIVATE_CLOUDFLARE_R2_S3_BUCKET, Key: key })
	);

	const chunks: Uint8Array[] = [];

	for await (const chunk of result.Body ?? []) {
		chunks.push(chunk);
	}

	return Buffer.concat(chunks).toString();
}

export async function downloadData(): Promise<{ table: Entry[]; sheets: Sheet[] }> {
	const table_result = JSON.parse(await downloadTextFile('table.json'));
	const sheets_result = JSON.parse(await downloadTextFile('sheets.json'));

	return { table: table_result, sheets: sheets_result };
}

export async function updateData(): Promise<void> {
	console.info('[updateData] Start');

	const sheets = await docs.spreadsheets.get({
		spreadsheetId: '1zV0gl4TWV5fkf2r9i_1P1jmH_p7LOzbhZQgm7mPwDdE'
	});

	console.info('[updateData] Sheets fetched');

	const all_sheets_sheet = sheets.data.sheets?.find(
		(sheet) => sheet.properties?.title === 'all_sheets'
	);

	console.info('[updateData] all_sheets sheet found');

	if (!all_sheets_sheet) {
		throw new Error('No all_sheets sheet found');
	}

	console.info('[updateData] all_sheets sheet values fetched');

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

	// Upload the result to Cloudflare R2 thourgh S3 API

	console.info('[updateData] Uploading to Cloudflare R2');

	await s3.send(
		new PutObjectCommand({
			Bucket: PRIVATE_CLOUDFLARE_R2_S3_BUCKET,
			Key: 'table.json',
			Body: JSON.stringify(all_content_sheets_data_flattened),
			ContentType: 'application/json'
		})
	);

	await s3.send(
		new PutObjectCommand({
			Bucket: PRIVATE_CLOUDFLARE_R2_S3_BUCKET,
			Key: 'sheets.json',
			Body: JSON.stringify(all_content_sheets),
			ContentType: 'application/json'
		})
	);

	console.info('[updateData] Uploaded to Cloudflare R2');
}

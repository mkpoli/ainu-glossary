import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

import { downloadData, updateData } from '$lib/server/data';

export const GET: RequestHandler = async () => {
	// Retrive data from R2 through S3 API
	try {
		return json(await downloadData());
	} catch (e) {
		console.error(e);
		return json({ error: e });
	}
};

export const POST: RequestHandler = async (request) => {
	try {
		await updateData();
		return json({ success: true });
	} catch (e) {
		console.error(e);
		return json({ error: e });
	}
};

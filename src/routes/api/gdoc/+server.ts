import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

import { downloadData, updateData } from '$lib/server/data';

export const GET: RequestHandler = async () => {
	// Retrive data from R2 through S3 API
	try {
		const data = await downloadData();
		return json(data, {
			headers: {
				'Cache-Control': 'public, max-age=86400, s-maxage=86400'
			}
		});
	} catch (e) {
		console.error(e);
		return json({ error: e });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const key = request.headers.get('x-admin-key');
	if (!platform?.env?.ADMIN_KEY || key !== platform.env.ADMIN_KEY) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}
	try {
		await updateData();
		return json({ success: true });
	} catch (e) {
		console.error(e);
		return json({ error: e });
	}
};

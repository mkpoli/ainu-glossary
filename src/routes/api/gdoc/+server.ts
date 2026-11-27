import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

import { GLOSSARY_CACHE_CONTROL } from '$lib/data';
import { glossaryBucket, updateData } from '$lib/server/data';
import { getGlossary, invalidateGlossary } from '$lib/server/glossary';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		const { table, sheets, lastModified } = await getGlossary(glossaryBucket(platform));
		return json(
			{ table, sheets, lastModified },
			{
				headers: {
					'Cache-Control': GLOSSARY_CACHE_CONTROL
				}
			}
		);
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
		await updateData(glossaryBucket(platform));
		invalidateGlossary();
		return json({ success: true });
	} catch (e) {
		console.error(e);
		return json({ error: e });
	}
};

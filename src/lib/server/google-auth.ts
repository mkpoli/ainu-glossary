/**
 * Service-account access tokens for Google APIs, signed with WebCrypto. Runs
 * on workerd, where the googleapis client library cannot.
 */

interface ServiceAccount {
	client_email: string;
	private_key: string;
}

const TOKEN_URI = 'https://oauth2.googleapis.com/token';

function base64url(data: Uint8Array | string): string {
	const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function pemToPkcs8(pem: string): Uint8Array {
	const body = pem
		.replace(/-----BEGIN PRIVATE KEY-----/, '')
		.replace(/-----END PRIVATE KEY-----/, '')
		.replace(/\s/g, '');
	return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

let cached: { token: string; scope: string; expiresAt: number } | undefined;

export async function getGoogleAccessToken(
	account: ServiceAccount,
	scope: string
): Promise<string> {
	if (cached && cached.scope === scope && cached.expiresAt > Date.now() + 60_000) {
		return cached.token;
	}

	const now = Math.floor(Date.now() / 1000);
	const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
	const claims = base64url(
		JSON.stringify({
			iss: account.client_email,
			scope,
			aud: TOKEN_URI,
			iat: now,
			exp: now + 3600
		})
	);
	const signingInput = `${header}.${claims}`;

	const key = await crypto.subtle.importKey(
		'pkcs8',
		pemToPkcs8(account.private_key),
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign(
		'RSASSA-PKCS1-v1_5',
		key,
		new TextEncoder().encode(signingInput)
	);
	const jwt = `${signingInput}.${base64url(new Uint8Array(signature))}`;

	const response = await fetch(TOKEN_URI, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion: jwt
		})
	});
	if (!response.ok) {
		throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
	}
	const { access_token, expires_in } = (await response.json()) as {
		access_token: string;
		expires_in: number;
	};

	cached = { token: access_token, scope, expiresAt: Date.now() + expires_in * 1000 };
	return access_token;
}

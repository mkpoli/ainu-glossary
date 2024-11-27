export function generateColorHashFromString(text: string): string {
	const availableColors = [
		'bg-slate-200 text-slate-900',
		'bg-zinc-200 text-zinc-900',
		'bg-stone-200 text-stone-900',
		'bg-red-200 text-red-900',
		'bg-orange-200 text-orange-900',
		'bg-amber-200 text-amber-900',
		'bg-yellow-200 text-yellow-900',
		'bg-lime-200 text-lime-900',
		'bg-green-200 text-green-900',
		'bg-emerald-200 text-emerald-900',
		'bg-teal-200 text-teal-900',
		'bg-cyan-200 text-cyan-900',
		'bg-sky-200 text-sky-900',
		'bg-blue-200 text-blue-900',
		'bg-indigo-200 text-indigo-900',
		'bg-violet-200 text-violet-900',
		'bg-purple-200 text-purple-900',
		'bg-fuchsia-200 text-fuchsia-900',
		'bg-pink-200 text-pink-900',
		'bg-rose-200 text-rose-900'
	];

	function hashStringToNumber(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	const hash = hashStringToNumber(text);
	const index = hash % availableColors.length;
	return availableColors[index];
}

export function formatGenre(genre: string): string {
	return genre.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

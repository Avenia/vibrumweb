declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"guitars": {
"pyrocaster copy 2.md": {
	id: "pyrocaster copy 2.md";
  slug: "pyrocaster-copy-2";
  body: string;
  collection: "guitars";
  data: InferEntrySchema<"guitars">
} & { render(): Render[".md"] };
"pyrocaster copy 3.md": {
	id: "pyrocaster copy 3.md";
  slug: "pyrocaster-copy-3";
  body: string;
  collection: "guitars";
  data: InferEntrySchema<"guitars">
} & { render(): Render[".md"] };
"pyrocaster copy 4.md": {
	id: "pyrocaster copy 4.md";
  slug: "pyrocaster-copy-4";
  body: string;
  collection: "guitars";
  data: InferEntrySchema<"guitars">
} & { render(): Render[".md"] };
"pyrocaster copy 5.md": {
	id: "pyrocaster copy 5.md";
  slug: "pyrocaster-copy-5";
  body: string;
  collection: "guitars";
  data: InferEntrySchema<"guitars">
} & { render(): Render[".md"] };
"pyrocaster copy 6.md": {
	id: "pyrocaster copy 6.md";
  slug: "pyrocaster-copy-6";
  body: string;
  collection: "guitars";
  data: InferEntrySchema<"guitars">
} & { render(): Render[".md"] };
"pyrocaster copy.md": {
	id: "pyrocaster copy.md";
  slug: "pyrocaster-copy";
  body: string;
  collection: "guitars";
  data: InferEntrySchema<"guitars">
} & { render(): Render[".md"] };
"pyrocaster.md": {
	id: "pyrocaster.md";
  slug: "pyrocaster";
  body: string;
  collection: "guitars";
  data: InferEntrySchema<"guitars">
} & { render(): Render[".md"] };
};
"stories": {
"2024-12-pyrocaster-build copy 10.md": {
	id: "2024-12-pyrocaster-build copy 10.md";
  slug: "2024-12-pyrocaster-build-copy-10";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 11.md": {
	id: "2024-12-pyrocaster-build copy 11.md";
  slug: "2024-12-pyrocaster-build-copy-11";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 12.md": {
	id: "2024-12-pyrocaster-build copy 12.md";
  slug: "2024-12-pyrocaster-build-copy-12";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 2.md": {
	id: "2024-12-pyrocaster-build copy 2.md";
  slug: "2024-12-pyrocaster-build-copy-2";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 3.md": {
	id: "2024-12-pyrocaster-build copy 3.md";
  slug: "2024-12-pyrocaster-build-copy-3";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 4.md": {
	id: "2024-12-pyrocaster-build copy 4.md";
  slug: "2024-12-pyrocaster-build-copy-4";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 5.md": {
	id: "2024-12-pyrocaster-build copy 5.md";
  slug: "2024-12-pyrocaster-build-copy-5";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 6.md": {
	id: "2024-12-pyrocaster-build copy 6.md";
  slug: "2024-12-pyrocaster-build-copy-6";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 7.md": {
	id: "2024-12-pyrocaster-build copy 7.md";
  slug: "2024-12-pyrocaster-build-copy-7";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 8.md": {
	id: "2024-12-pyrocaster-build copy 8.md";
  slug: "2024-12-pyrocaster-build-copy-8";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy 9.md": {
	id: "2024-12-pyrocaster-build copy 9.md";
  slug: "2024-12-pyrocaster-build-copy-9";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build copy.md": {
	id: "2024-12-pyrocaster-build copy.md";
  slug: "2024-12-pyrocaster-build-copy";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster-build.md": {
	id: "2024-12-pyrocaster-build.md";
  slug: "2024-12-pyrocaster-build";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster2 copy.md": {
	id: "2024-12-pyrocaster2 copy.md";
  slug: "2024-12-pyrocaster2-copy";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
"2024-12-pyrocaster2.md": {
	id: "2024-12-pyrocaster2.md";
  slug: "2024-12-pyrocaster2";
  body: string;
  collection: "stories";
  data: InferEntrySchema<"stories">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		"slides": {
"01": {
	id: "01";
  collection: "slides";
  data: InferEntrySchema<"slides">
};
"02": {
	id: "02";
  collection: "slides";
  data: InferEntrySchema<"slides">
};
"03": {
	id: "03";
  collection: "slides";
  data: InferEntrySchema<"slides">
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}

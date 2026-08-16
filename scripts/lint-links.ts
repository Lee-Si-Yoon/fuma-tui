import {
	type FileObject,
	printErrors,
	scanURLs,
	validateFiles,
} from "next-validate-link"
import { getSource } from "../source"

async function checkLinks() {
	const source = await getSource()
	const scanned = await scanURLs({
		preset: "next",
		populate: {
			"docs/[[...slug]]": source.getPages().map((page) => {
				return {
					value: {
						slug: page.slugs,
					},
					hashes: getHeadingsFromContent(page.data.content ?? ""),
				}
			}),
		},
	})

	printErrors(
		await validateFiles(await getFiles(), {
			scanned,
			checkRelativePaths: "as-url",
		}),
		true,
	)
}

/** Parse heading hashes from raw markdown (Obsidian source has no toc on data) */
function getHeadingsFromContent(content: string): string[] {
	const headings: string[] = []
	const regex = /^(#{1,6})\s+(.+)$/gm
	let match = regex.exec(content)
	while (match !== null) {
		const text = match[2].replace(/[*`_~]/g, "").trim()
		headings.push(
			text
				.toLowerCase()
				.replace(/[^\w\s-]/g, "")
				.replace(/\s+/g, "-"),
		)
		match = regex.exec(content)
	}
	return headings
}

async function getFiles(): Promise<FileObject[]> {
	const source = await getSource()
	const promises = source.getPages().map(
		async (page): Promise<FileObject> => ({
			path: page.url,
			content: page.data.content ?? "",
			url: page.url,
			data: page.data,
		}),
	)

	return Promise.all(promises)
}

void checkLinks()

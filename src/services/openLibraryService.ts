export interface OpenLibraryBook {
  isbn: string;
  title: string;
  author: string;
  year?: string;
  publisher?: string;
  coverUrl?: string;
}

export const openLibraryService = {
  async lookup(isbnRaw: string): Promise<OpenLibraryBook | null> {
    const isbn = isbnRaw.replace(/[-\s]/g, "");
    if (!isbn) return null;
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(
      isbn,
    )}&format=json&jscmd=data`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, any>;
    const entry = data[`ISBN:${isbn}`];
    if (!entry) return null;
    return {
      isbn,
      title: entry.title ?? "",
      author: Array.isArray(entry.authors) && entry.authors.length > 0
        ? entry.authors.map((a: any) => a.name).join(", ")
        : "",
      year: entry.publish_date,
      publisher:
        Array.isArray(entry.publishers) && entry.publishers.length > 0
          ? entry.publishers.map((p: any) => p.name).join(", ")
          : undefined,
      coverUrl: entry.cover?.medium ?? entry.cover?.large ?? entry.cover?.small,
    };
  },
};

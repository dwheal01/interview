// Book types for Open Library API

export interface BookCover {
  small?: string;
  medium?: string;
  large?: string;
}

export interface Author {
  key: string;
  name: string;
}

export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  authors?: Author[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  cover?: BookCover;
  number_of_pages_median?: number;
  subject?: string[];
  language?: string[];
}

export interface BookSearchResponse {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: Book[];
}

export interface BookDetails {
  key: string;
  title: string;
  authors: Array<{
    author: {
      key: string;
      name: string;
    };
  }>;
  publish_date?: string;
  number_of_pages?: number;
  subjects?: string[];
  description?: string | { value: string };
  covers?: number[];
  isbn_10?: string[];
  isbn_13?: string[];
}

export interface ApiError {
  message: string;
  status?: number;
}


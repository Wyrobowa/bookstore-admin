export type Book = {
  id: number;
  title: string;
  description: string | null;
  tag_id: number | null;
  status_id: number | null;
  author_id: number | null;
  publisher_id: number | null;
  pages: number | null;
  status: string | null;
  author_first_name: string | null;
  author_last_name: string | null;
};

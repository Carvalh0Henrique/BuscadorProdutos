import { FormEvent, useState } from "react";

type SearchFormProps = {
  isLoading: boolean;
  onSearch: (query: string) => void;
};

export function SearchForm({ isLoading, onSearch }: SearchFormProps) {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query);
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <input
        className="min-h-12 flex-1 rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Digite o nome do produto"
        type="search"
        value={query}
      />
      <button
        className="min-h-12 rounded-md bg-teal-700 px-5 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}

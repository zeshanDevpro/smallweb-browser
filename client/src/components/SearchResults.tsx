import type { SearchResultsProps } from "@/lib/types";

export function SearchResults({
  query,
  hits,
  onNavigate,
}: SearchResultsProps) {
  return (
    <section className="search-results" aria-live="polite">
      <p className="eyebrow">SMALLWEB SEARCH</p>
      <h1>{query ? `Results for “${query}”` : "Search smallweb"}</h1>
      {!query.trim() ? (
        <p className="empty-copy">Enter a word or address to explore.</p>
      ) : hits.length === 0 ? (
        <p className="empty-copy">No pages found. Try another search.</p>
      ) : (
        <div className="result-list">
          {hits.map((hit, index) => (
            <button
              type="button"
              className={`result-card border border-slate-200 border-l-[3px] ${
                index % 3 === 0
                  ? "border-l-emerald-300 hover:border-emerald-400"
                  : index % 3 === 1
                    ? "border-l-violet-300 hover:border-violet-400"
                    : "border-l-orange-300 hover:border-orange-400"
              } bg-gradient-to-r from-white via-white to-slate-50 hover:shadow-[0_8px_20px_#354b5b12]`}
              key={hit.address}
              onClick={() => onNavigate(hit.address)}
            >
              <span className="result-address bg-emerald-50 text-emerald-800">
                {hit.address}
              </span>
              <strong>{hit.title}</strong>
              <span className="result-snippet">{hit.snippet}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

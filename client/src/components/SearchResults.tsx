import type { SearchHit } from "@/lib/types";

export function SearchResults({
  query,
  hits,
  onNavigate,
}: {
  query: string;
  hits: SearchHit[];
  onNavigate: (address: string) => void;
}) {
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
          {hits.map((hit) => (
            <button
              type="button"
              className="result-card"
              key={hit.address}
              onClick={() => onNavigate(hit.address)}
            >
              <span className="result-address">{hit.address}</span>
              <strong>{hit.title}</strong>
              <span className="result-snippet">{hit.snippet}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

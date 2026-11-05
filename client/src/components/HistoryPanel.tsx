import type { Visit } from "@/lib/types";

function relativeTime(value: string): string {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function HistoryPanel({
  visits,
  loading,
  onClose,
  onNavigate,
}: {
  visits: Visit[];
  loading: boolean;
  onClose: () => void;
  onNavigate: (address: string) => void;
}) {
  return (
    <div className="overlay history-overlay" onMouseDown={onClose}>
      <aside
        className="history-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <p className="eyebrow">YOUR TRAIL</p>
            <h2 id="history-title">History</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close history"
          >
            ×
          </button>
        </div>
        {loading ? (
          <p className="panel-message">Loading your history…</p>
        ) : visits.length === 0 ? (
          <p className="panel-message">Your visited pages will show up here.</p>
        ) : (
          <ol className="history-list">
            {visits.map((visit) => (
              <li key={visit.id}>
                <button
                  type="button"
                  className="history-item"
                  onClick={() => onNavigate(visit.address)}
                >
                  <span className="history-item-main">
                    <strong>{visit.title ?? visit.address}</strong>
                    <small>{visit.address}</small>
                  </span>
                  <span className="history-item-meta">
                    <small>{relativeTime(visit.at)}</small>
                    <small>{visit.via}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}

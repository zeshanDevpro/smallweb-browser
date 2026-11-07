import { FiX } from "react-icons/fi";
import { relativeTime } from "@/lib/helper";
import type { HistoryPanelProps } from "@/lib/types";

export function HistoryPanel({
  visits,
  loading,
  error,
  onClose,
  onNavigate,
}: HistoryPanelProps) {
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
            <FiX aria-hidden="true" focusable="false" size={30} className="hover:bg-gray-300 p-1 rounded" />
          </button>
        </div>
        {loading ? (
          <p className="panel-message">Loading your history…</p>
        ) : error ? (
          <p className="panel-message" role="alert">{error}</p>
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

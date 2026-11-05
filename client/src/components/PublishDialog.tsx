"use client";

import { useState, type FormEvent } from "react";
import { isValidAddress, normalizeAddress } from "@/lib/address";
import type { User } from "@/lib/types";

export type PublishValues = {
  address: string;
  title: string;
  body: string;
  authorId: string;
};

export function PublishDialog({
  users,
  currentUser,
  error,
  onClose,
  onPublish,
}: {
  users: User[];
  currentUser: User;
  error: string;
  onClose: () => void;
  onPublish: (values: PublishValues) => Promise<void>;
}) {
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorId, setAuthorId] = useState(currentUser.id);
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeAddress(address);
    if (!isValidAddress(normalized)) {
      setValidationError("Use a valid address ending in .zz.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setValidationError("Add a title and HTML body.");
      return;
    }
    setValidationError("");
    setSubmitting(true);
    try {
      await onPublish({ address: normalized, title, body, authorId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay dialog-overlay" onMouseDown={onClose}>
      <section
        className="publish-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <p className="eyebrow">ADD TO THE SMALLWEB</p>
            <h2 id="publish-title">Publish a page</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close publish dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <form className="publish-form" onSubmit={submit}>
          <label>
            Address
            <div className="publish-address-input">
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="your-page.zz"
                required
              />
              <span>.zz</span>
            </div>
          </label>
          <label>
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A page title"
              required
            />
          </label>
          <label>
            HTML body
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="<main><h1>Hello, smallweb</h1></main>"
              rows={7}
              required
            />
          </label>
          <label>
            Author
            <select
              value={authorId}
              onChange={(event) => setAuthorId(event.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          {(validationError || error) && (
            <p className="form-error" role="alert">
              {validationError || error}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish page"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

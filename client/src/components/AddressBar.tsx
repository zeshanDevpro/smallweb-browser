"use client";

import { useState, type FormEvent } from "react";
import { isValidAddress, normalizeAddress } from "@/lib/address";

type AddressBarProps = {
  address: string;
  onNavigate: (address: string) => void;
};

export function AddressBar({ address, onNavigate }: AddressBarProps) {
  const [value, setValue] = useState(address);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeAddress(value);
    if (!isValidAddress(normalized)) {
      setError("Enter an address ending in .zz");
      return;
    }
    setError("");
    setValue(normalized);
    onNavigate(normalized);
  }

  return (
    <form className="address-form" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="address-input">
        Address
      </label>
      <span className="address-lock" aria-hidden="true">
        ◈
      </span>
      <input
        id="address-input"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
        }}
        placeholder="Search or enter an address"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "address-error" : undefined}
        autoComplete="url"
        spellCheck={false}
      />
      <button className="go-button" type="submit">
        Go
      </button>
      {error && (
        <span className="field-error" id="address-error" role="alert">
          {error}
        </span>
      )}
    </form>
  );
}

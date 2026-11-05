export function NowherePage({ address }: { address: string }) {
  return (
    <section className="nowhere-page" aria-live="polite">
      <div className="nowhere-mark" aria-hidden="true">
        ?
      </div>
      <p className="eyebrow">This corner is quiet</p>
      <h1>No such address: {address}</h1>
      <p>There isn’t a smallweb page at this address yet.</p>
    </section>
  );
}

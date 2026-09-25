export function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="stars" aria-label={`${rating} van 5 sterren`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      <span className="muted">{"☆".repeat(5 - full - (half ? 1 : 0))}</span>
    </span>
  );
}

export function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  // Tap a star once for a full star, tap the same star again for a half star.
  return (
    <div className="rating-input" role="radiogroup" aria-label="Beoordeling">
      {[1, 2, 3, 4, 5].map((n) => {
        const half = value === n - 0.5;
        return (
          <button
            key={n}
            type="button"
            aria-label={`${n} sterren`}
            onClick={() => onChange(value === n ? n - 0.5 : n)}
          >
            <span style={half ? { opacity: 0.5 } : undefined}>{value >= n - 0.5 ? "★" : "☆"}</span>
          </button>
        );
      })}
    </div>
  );
}

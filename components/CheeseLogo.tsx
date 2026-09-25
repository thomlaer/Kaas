// Formatica's logo: a wedge of blue cheese. Plain SVG so it renders both in
// the app and in next/og ImageResponse (the home-screen icons).
export function CheeseLogo({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* top of the wedge */}
      <path d="M10 52 L66 22 L90 40 Z" fill="#eef4fc" />
      {/* front face */}
      <path d="M10 52 L90 40 L90 76 L10 84 Z" fill="#d9e6f7" />
      {/* rind along the back */}
      <path d="M66 22 L90 40 L90 76 L94 73 L94 37 L70 19 Z" fill="#b9cde8" />
      {/* blue veins */}
      <path d="M18 64 C26 60 30 70 38 66" stroke="#2c5fb8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M50 56 C56 62 62 54 70 60" stroke="#1f4a96" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M58 70 C64 74 72 66 82 70" stroke="#2c5fb8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40 40 C46 36 50 42 56 36" stroke="#3a70c9" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="74" r="3.5" fill="#1f4a96" />
      <circle cx="46" cy="72" r="2.5" fill="#3a70c9" />
      <circle cx="80" cy="54" r="3" fill="#1f4a96" />
      <circle cx="66" cy="34" r="2.5" fill="#2c5fb8" />
      <circle cx="30" cy="50" r="2" fill="#2c5fb8" />
    </svg>
  );
}

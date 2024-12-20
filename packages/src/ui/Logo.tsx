function Logo({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: isActive ? "none" : "grayscale(100%)" }}
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="#FFF1E6"
        stroke="#FF4D00"
        strokeWidth="2"
      />

      <path
        d="M25 50L38 25L50 50L62 25L75 50"
        stroke="#FF4D00"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <path
        d="M25 75Q50 90 75 75"
        stroke="#FF8C42"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      <circle cx="25" cy="75" r="5" fill="#FF4D00" />
      <circle cx="75" cy="75" r="5" fill="#FF4D00" />
    </svg>
  );
}

export default Logo;

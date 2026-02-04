import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        {/* Hexagonal outline F Logo */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 48 48"
          fill="none"
        >
          {/* Hexagon outline */}
          <path
            d="M24 3L43 14V34L24 45L5 34V14L24 3Z"
            fill="none"
            stroke="#00D4AA"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* F letter strokes */}
          <path d="M16 14H32" stroke="#00D4AA" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 14V34" stroke="#00D4AA" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 24H28" stroke="#00D4AA" strokeWidth="3" strokeLinecap="round" />
          {/* Accent dot */}
          <circle cx="35" cy="14" r="2.5" fill="#00D4AA" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

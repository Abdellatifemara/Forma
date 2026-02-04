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
          background: 'linear-gradient(135deg, #00D4AA 0%, #00E5BE 50%, #00F5D4 100%)',
          borderRadius: '6px',
        }}
      >
        {/* Stylized F Logo */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Top bar */}
          <rect x="4" y="3" width="16" height="3" rx="1.5" fill="white" />
          {/* Middle bar */}
          <rect x="4" y="10" width="12" height="3" rx="1.5" fill="white" />
          {/* Vertical bar */}
          <rect x="4" y="3" width="3" height="18" rx="1.5" fill="white" />
          {/* Arrow accent */}
          <path d="M16 15L20 12V18L16 15Z" fill="white" fillOpacity="0.85" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

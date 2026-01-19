import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'MigrateChart - Track Every Token Transition'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://migrate-chart.fun/logo/MC_Logo_BG.png"
            alt="MigrateChart Logo"
            width={200}
            height={200}
            style={{
              borderRadius: '24px',
            }}
          />

          {/* Title */}
          <span
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ffffff',
              letterSpacing: '-2px',
            }}
          >
            MigrateChart
          </span>

          {/* Tagline */}
          <div
            style={{
              fontSize: '32px',
              color: '#22c55e',
              fontWeight: '500',
            }}
          >
            Track Every Token Transition
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '24px',
              color: '#a1a1aa',
              maxWidth: '800px',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Unified price history across pool migrations
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: '20px',
              color: '#22c55e',
              marginTop: '20px',
              padding: '8px 24px',
              border: '1px solid #22c55e',
              borderRadius: '8px',
            }}
          >
            migrate-chart.fun
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

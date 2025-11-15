'use client';

interface PoolInputProps {
  index: number;
  pool: {
    tokenAddress: string;
    poolAddress: string;
    tokenSymbol: string;
    dexType: string;
    orderIndex: number;
  };
  onChange: (field: string, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
  primaryColor: string;
}

export default function PoolInput({
  index,
  pool,
  onChange,
  onRemove,
  canRemove,
  primaryColor,
}: PoolInputProps) {
  const rgb = hexToRgb(primaryColor);
  const rgbString = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  return (
    <div
      className="p-4 bg-black/60 border-2 rounded-lg space-y-3"
      style={{
        borderColor: `rgba(${rgbString}, 0.3)`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold" style={{ color: primaryColor }}>
          Pool {index + 1}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-400 text-xs font-bold transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/70 mb-1">Token Address *</label>
          <input
            type="text"
            value={pool.tokenAddress || ''}
            onChange={(e) => onChange('tokenAddress', e.target.value)}
            className="w-full px-3 py-2 bg-black/60 border-2 text-white text-sm rounded focus:outline-none transition-all"
            style={{
              borderColor: '#1F6338',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 12px rgba(${rgbString}, 0.3)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#1F6338';
              e.target.style.boxShadow = 'none';
            }}
            placeholder="Solana token mint address"
          />
        </div>

        <div>
          <label className="block text-xs text-white/70 mb-1">Pool Address *</label>
          <input
            type="text"
            value={pool.poolAddress || ''}
            onChange={(e) => onChange('poolAddress', e.target.value)}
            className="w-full px-3 py-2 bg-black/60 border-2 text-white text-sm rounded focus:outline-none transition-all"
            style={{
              borderColor: '#1F6338',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 12px rgba(${rgbString}, 0.3)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#1F6338';
              e.target.style.boxShadow = 'none';
            }}
            placeholder="Solana pool address"
          />
        </div>

        <div>
          <label className="block text-xs text-white/70 mb-1">Token Symbol *</label>
          <input
            type="text"
            value={pool.tokenSymbol || ''}
            onChange={(e) => onChange('tokenSymbol', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-black/60 border-2 text-white text-sm rounded focus:outline-none transition-all"
            style={{
              borderColor: '#1F6338',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 12px rgba(${rgbString}, 0.3)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#1F6338';
              e.target.style.boxShadow = 'none';
            }}
            placeholder="e.g., ZERA"
          />
        </div>

        <div>
          <label className="block text-xs text-white/70 mb-1">DEX Type *</label>
          <select
            value={pool.dexType || ''}
            onChange={(e) => onChange('dexType', e.target.value)}
            className="w-full px-3 py-2 bg-black/60 border-2 text-white text-sm rounded focus:outline-none transition-all"
            style={{
              borderColor: '#1F6338',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = primaryColor;
              e.target.style.boxShadow = `0 0 12px rgba(${rgbString}, 0.3)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#1F6338';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Select DEX</option>
            <option value="raydium">Raydium</option>
            <option value="meteora">Meteora</option>
            <option value="pump_fun">Pump.fun</option>
            <option value="orca">Orca</option>
            <option value="jupiter">Jupiter</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
}

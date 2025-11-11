import { NextRequest, NextResponse } from 'next/server';

// Working Solana RPC endpoint
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('address');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [walletAddress],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check for RPC error
    if (data.error) {
      console.error('RPC error:', data.error);
      return NextResponse.json(
        { error: 'Failed to fetch balance from RPC' },
        { status: 500 }
      );
    }

    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    const lamports = data.result?.value || 0;
    const sol = lamports / 1_000_000_000;

    return NextResponse.json(
      { balance: sol },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet balance' },
      { status: 500 }
    );
  }
}

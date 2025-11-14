import { NextRequest, NextResponse } from 'next/server';

// Working Solana RPC endpoint
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('address');
  const tokenMint = searchParams.get('mint');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    );
  }

  if (!tokenMint) {
    return NextResponse.json(
      { error: 'Token mint address is required' },
      { status: 400 }
    );
  }

  try {
    // Get all token accounts for the wallet
    const response = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          {
            mint: tokenMint,
          },
          {
            encoding: 'jsonParsed',
          },
        ],
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
        { error: 'Failed to fetch token balance from RPC' },
        { status: 500 }
      );
    }

    // Sum up all token accounts (usually there's just one)
    const accounts = data.result?.value || [];
    let totalBalance = 0;

    for (const account of accounts) {
      const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;
      if (tokenAmount) {
        // Use uiAmount which is already adjusted for decimals
        totalBalance += parseFloat(tokenAmount.uiAmount || '0');
      }
    }

    return NextResponse.json(
      { balance: totalBalance },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    );
  }
}

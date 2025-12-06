/**
 * Migrate.Fun Integration
 *
 * Fetches and decodes migration data from the migrate.fun platform
 * to automatically populate project configurations.
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Migrate.fun program ID
const MIGRATION_PROGRAM_ID = 'migK824DsBMp2eZXdhSBAWFS6PbvA6UN8DV15HfmstR';

// Metaplex Token Metadata Program
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export interface MigrationProject {
  migrationId: string;
  projectName: string;
  oldToken: TokenInfo;
  newToken: TokenInfo;
  startDate: Date;
  endDate: Date;
  exchangeRate: number;
  totalMigrated: number;
  status: 'active' | 'completed' | 'failed';
  migrateFunUrl: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  supply: string;
  imageUri?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

interface DecodedMigrationData {
  projectId: string;
  projectName: string;
  oldTokenMint: string;
  newTokenMint: string;
  startTimestamp: number;
  endTimestamp: number;
  exchangeRate: number;
}

/**
 * Extract migration ID from migrate.fun URL
 * Example: https://migrate.fun/claim/mig79 -> mig79
 */
export function extractMigrationId(url: string): string {
  const match = url.match(/\/claim\/(\w+)/);
  if (!match) {
    throw new Error('Invalid migrate.fun URL. Expected format: https://migrate.fun/claim/migXX');
  }
  return match[1];
}

/**
 * Fetch migration data by URL
 */
export async function fetchMigrationByUrl(url: string): Promise<MigrationProject> {
  const migrationId = extractMigrationId(url);
  return fetchMigrationById(migrationId);
}

/**
 * Fetch migration data by ID
 */
export async function fetchMigrationById(migrationId: string): Promise<MigrationProject> {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'
  );

  // 1. Derive migration account PDA
  const migrationPda = await getMigrationPda(migrationId);

  // 2. Fetch account data
  const accountInfo = await connection.getAccountInfo(migrationPda);

  if (!accountInfo) {
    throw new Error(`Migration ${migrationId} not found on-chain`);
  }

  // 3. Decode migration account data
  const migrationData = decodeMigrationAccount(accountInfo.data);

  // 4. Fetch token metadata in parallel
  const [oldTokenInfo, newTokenInfo, migrationStats] = await Promise.all([
    fetchTokenInfo(connection, migrationData.oldTokenMint),
    fetchTokenInfo(connection, migrationData.newTokenMint),
    getMigrationStats(connection, migrationPda, migrationData)
  ]);

  // 5. Determine migration status
  const now = Date.now();
  const status = getMigrationStatus(
    migrationData.startTimestamp * 1000,
    migrationData.endTimestamp * 1000,
    now
  );

  return {
    migrationId,
    projectName: migrationData.projectName,
    oldToken: oldTokenInfo,
    newToken: newTokenInfo,
    startDate: new Date(migrationData.startTimestamp * 1000),
    endDate: new Date(migrationData.endTimestamp * 1000),
    exchangeRate: migrationData.exchangeRate,
    totalMigrated: migrationStats.totalMigrated,
    status,
    migrateFunUrl: `https://migrate.fun/claim/${migrationId}`
  };
}

/**
 * Derive migration PDA address
 */
async function getMigrationPda(migrationId: string): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddress(
    [
      Buffer.from('migration'),
      Buffer.from(migrationId)
    ],
    new PublicKey(MIGRATION_PROGRAM_ID)
  );
  return pda;
}

/**
 * Decode migration account data from binary format
 * Based on analysis of HAR file base64 data
 */
function decodeMigrationAccount(data: Buffer): DecodedMigrationData {
  let offset = 0;

  // Skip discriminator (8 bytes)
  offset += 8;

  // Read project ID length (4 bytes, little-endian)
  const projectIdLength = data.readUInt32LE(offset);
  offset += 4;

  // Read project ID string
  const projectId = data.slice(offset, offset + projectIdLength).toString('utf8');
  offset += projectIdLength;

  // Read project name length (4 bytes)
  const projectNameLength = data.readUInt32LE(offset);
  offset += 4;

  // Read project name string
  const projectName = data.slice(offset, offset + projectNameLength).toString('utf8');
  offset += projectNameLength;

  // Read old token mint (32 bytes pubkey)
  const oldTokenMint = new PublicKey(data.slice(offset, offset + 32)).toString();
  offset += 32;

  // Read new token mint (32 bytes pubkey)
  const newTokenMint = new PublicKey(data.slice(offset, offset + 32)).toString();
  offset += 32;

  // Skip other fields to get to timestamps and rate
  // This may need adjustment based on actual program structure
  offset += 64; // Skip vaults and other pubkeys

  // Read start timestamp (8 bytes, i64)
  const startTimestamp = Number(data.readBigInt64LE(offset));
  offset += 8;

  // Read end timestamp (8 bytes, i64)
  const endTimestamp = Number(data.readBigInt64LE(offset));
  offset += 8;

  // Read exchange rate (8 bytes, u64)
  const exchangeRate = Number(data.readBigUInt64LE(offset)) / 1_000_000; // Assuming 6 decimals
  offset += 8;

  return {
    projectId,
    projectName,
    oldTokenMint,
    newTokenMint,
    startTimestamp,
    endTimestamp,
    exchangeRate
  };
}

/**
 * Fetch comprehensive token information
 */
async function fetchTokenInfo(
  connection: Connection,
  mintAddress: string
): Promise<TokenInfo> {
  const mintPubkey = new PublicKey(mintAddress);

  // 1. Get parsed mint account info
  const mintInfo = await connection.getParsedAccountInfo(mintPubkey);

  if (!mintInfo.value) {
    throw new Error(`Token ${mintAddress} not found`);
  }

  const parsedData = (mintInfo.value.data as any).parsed?.info;

  // 2. Get Metaplex metadata
  const [metadataPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintPubkey.toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  let metadata: any = {
    name: 'Unknown',
    symbol: 'UNKNOWN',
    imageUri: null,
    website: null,
    twitter: null,
    telegram: null
  };

  try {
    const metadataAccount = await connection.getAccountInfo(metadataPda);

    if (metadataAccount) {
      const decodedMetadata = decodeMetadata(metadataAccount.data);
      metadata = { ...metadata, ...decodedMetadata };

      // 3. Fetch from IPFS/Arweave if URI provided
      if (decodedMetadata.uri) {
        try {
          const response = await fetch(decodedMetadata.uri, {
            signal: AbortSignal.timeout(5000) // 5s timeout
          });
          const ipfsData = await response.json();

          metadata = {
            ...metadata,
            name: ipfsData.name || metadata.name,
            symbol: ipfsData.symbol || metadata.symbol,
            imageUri: ipfsData.image || metadata.imageUri,
            website: ipfsData.website || metadata.website,
            twitter: ipfsData.twitter || metadata.twitter,
            telegram: ipfsData.telegram || metadata.telegram
          };
        } catch (err) {
          console.warn(`Failed to fetch IPFS metadata: ${err}`);
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch Metaplex metadata for ${mintAddress}:`, err);
  }

  return {
    address: mintAddress,
    symbol: metadata.symbol,
    name: metadata.name,
    decimals: parsedData?.decimals || 9,
    supply: parsedData?.supply || '0',
    imageUri: metadata.imageUri,
    website: metadata.website,
    twitter: metadata.twitter,
    telegram: metadata.telegram
  };
}

/**
 * Decode Metaplex metadata account
 * Simplified version - may need borsh deserialization for production
 */
function decodeMetadata(data: Buffer): any {
  try {
    // Skip discriminator and parse string fields
    let offset = 1; // Skip key byte

    // Update authority (32 bytes)
    offset += 32;

    // Mint (32 bytes)
    offset += 32;

    // Name (4 bytes length + string)
    const nameLen = data.readUInt32LE(offset);
    offset += 4;
    const name = data.slice(offset, offset + nameLen).toString('utf8').replace(/\0/g, '');
    offset += nameLen;

    // Symbol (4 bytes length + string)
    const symbolLen = data.readUInt32LE(offset);
    offset += 4;
    const symbol = data.slice(offset, offset + symbolLen).toString('utf8').replace(/\0/g, '');
    offset += symbolLen;

    // URI (4 bytes length + string)
    const uriLen = data.readUInt32LE(offset);
    offset += 4;
    const uri = data.slice(offset, offset + uriLen).toString('utf8').replace(/\0/g, '');

    return { name, symbol, uri };
  } catch (err) {
    console.error('Failed to decode metadata:', err);
    return { name: 'Unknown', symbol: 'UNKNOWN', uri: null };
  }
}

/**
 * Get migration statistics
 */
async function getMigrationStats(
  connection: Connection,
  migrationPda: PublicKey,
  migrationData: DecodedMigrationData
): Promise<{ totalMigrated: number }> {
  try {
    // In a real implementation, would query user migration accounts
    // For now, derive from vault balance
    const oldTokenMint = new PublicKey(migrationData.oldTokenMint);

    // Get associated token account for migration vault
    // This is a simplified approach - actual implementation may differ
    const vaultAta = await connection.getTokenAccountBalance(migrationPda);

    return {
      totalMigrated: parseFloat(vaultAta.value.amount) / Math.pow(10, vaultAta.value.decimals)
    };
  } catch (err) {
    console.warn('Failed to fetch migration stats:', err);
    return { totalMigrated: 0 };
  }
}

/**
 * Determine migration status based on timestamps
 */
function getMigrationStatus(
  startMs: number,
  endMs: number,
  nowMs: number
): 'active' | 'completed' | 'failed' {
  if (nowMs < startMs) {
    return 'active'; // Scheduled
  }
  if (nowMs >= startMs && nowMs < endMs) {
    return 'active'; // In progress
  }
  return 'completed'; // Ended (could also check on-chain for failed status)
}

/**
 * Convert migration data to project configuration
 */
export function migrationToProjectConfig(migration: MigrationProject) {
  // Generate slug from token symbol (lowercase, remove special chars)
  const slug = migration.newToken.symbol
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return {
    name: migration.newToken.name || migration.projectName, // Use token name from metadata
    slug: slug || migration.migrationId.toLowerCase(), // Use token symbol as slug, fallback to migXXX
    migrate_fun_id: migration.migrationId,
    migrate_fun_url: migration.migrateFunUrl,
    migration_start_date: migration.startDate.toISOString(),
    migration_end_date: migration.endDate.toISOString(),
    exchange_rate: migration.exchangeRate,
    total_migrated: migration.totalMigrated,
    migration_status: migration.status,
    primary_color: '#8C5CFF', // Default purple, can be customized
    secondary_color: '#000000', // Default black
    logo_url: migration.newToken.imageUri, // Will be replaced with uploaded URL in import route
    loader_url: migration.newToken.imageUri, // Will be replaced with uploaded URL in import route
    enabled: true, // Enable by default
    is_active: false, // Start inactive for admin review
    burns_enabled: false, // Burns disabled by default
    token_decimals: migration.newToken.decimals
  };
}

/**
 * Convert migration data to pool configurations
 */
export function migrationToPoolConfigs(migration: MigrationProject) {
  return [
    // Old token pool (legacy)
    {
      token_address: migration.oldToken.address,
      pool_address: migration.oldToken.address, // Legacy pool uses token address
      token_symbol: migration.oldToken.symbol,
      pool_name: `${migration.oldToken.name} (Legacy)`, // Use full token name, not symbol
      dex_type: 'unknown' as const, // Would need to detect from pool
      fee_rate: 0,
      order_index: 0,
      is_legacy: true,
      migration_source: 'migrate_fun'
    },
    // New token pool
    {
      token_address: migration.newToken.address,
      pool_address: migration.newToken.address, // Will be updated with discovered pool
      token_symbol: migration.newToken.symbol,
      pool_name: migration.newToken.name, // Use full token name
      dex_type: 'raydium' as string, // Most migrate.fun projects use Raydium
      fee_rate: 0.008, // 0.8% typical
      order_index: 1,
      is_legacy: false
    }
  ];
}

/**
 * Convert migration data to migration config
 */
export function migrationToMigrationConfig(migration: MigrationProject) {
  return {
    label: `${migration.oldToken.symbol}<br/>-><br/>${migration.newToken.symbol}`, // Use symbols for compact display
    migration_timestamp: Math.floor(migration.endDate.getTime() / 1000)
    // from_pool_id and to_pool_id will be set after pools are created
  };
}

/**
 * Migrate.fun API Client
 *
 * Fetches token migration data from Solana blockchain via migrate.fun's RPC endpoint.
 * This client parses on-chain migration account data to extract:
 * - Migration status (Active, Claims, Upcoming)
 * - Start and end dates
 * - Old and new token mint addresses
 * - Migration progress (when available)
 */

export interface MigrationProject {
  index: number;
  pubkey: string;
  migrationId: string;
  projectName: string;
  oldTokenMint: string | null;
  newTokenMint: string | null;
  startDate: string | null;
  endDate: string | null;
  status: 'Active' | 'Claims' | 'Upcoming' | 'Unknown';
  tokensMigrated: string | null;
  totalSupply: string | null;
  percentMigrated: string | null;
}

export interface MigrationStats {
  total: number;
  active: number;
  claims: number;
  upcoming: number;
}

export class MigrateFunAPI {
  private readonly RPC_ENDPOINT = 'https://migrate.fun/api/rpc?cluster=mainnet';
  private readonly PROGRAM_ID = 'migK824DsBMp2eZXdhSBAWFS6PbvA6UN8DV15HfmstR';
  private readonly FILTER_BYTES = 'YSC6fNifLgY';

  /**
   * Fetch all migration projects from the Solana blockchain
   */
  async fetchAllProjects(): Promise<MigrationProject[]> {
    const response = await fetch(this.RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'solana-client': 'js/1.0.0-maintenance',
      },
      body: JSON.stringify({
        method: 'getProgramAccounts',
        jsonrpc: '2.0',
        params: [
          this.PROGRAM_ID,
          {
            encoding: 'base64',
            commitment: 'confirmed',
            filters: [
              {
                memcmp: {
                  offset: 0,
                  bytes: this.FILTER_BYTES,
                  encoding: 'base58',
                },
              },
            ],
          },
        ],
        id: crypto.randomUUID(),
      }),
    });

    const data = await response.json();

    if (!data.result) {
      throw new Error('No results from RPC');
    }

    return data.result.map((item: any, index: number) =>
      this.parseProject(item, index + 1)
    );
  }

  /**
   * Get only active migration projects
   */
  async fetchActiveProjects(): Promise<MigrationProject[]> {
    const projects = await this.fetchAllProjects();
    return projects.filter(p => p.status === 'Active');
  }

  /**
   * Get recent claims (last N days)
   */
  async fetchRecentClaims(daysAgo: number = 30): Promise<MigrationProject[]> {
    const projects = await this.fetchAllProjects();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return projects.filter(p => {
      if (p.status !== 'Claims' || !p.endDate) return false;
      return new Date(p.endDate) > cutoffDate;
    });
  }

  /**
   * Get migration statistics
   */
  async getStats(): Promise<MigrationStats> {
    const projects = await this.fetchAllProjects();

    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'Active').length,
      claims: projects.filter(p => p.status === 'Claims').length,
      upcoming: projects.filter(p => p.status === 'Upcoming').length,
    };
  }

  /**
   * Get a specific project by pubkey
   */
  async getProject(pubkey: string): Promise<MigrationProject | null> {
    const projects = await this.fetchAllProjects();
    return projects.find(p => p.pubkey === pubkey) || null;
  }

  /**
   * Search projects by name
   */
  async searchProjects(query: string): Promise<MigrationProject[]> {
    const projects = await this.fetchAllProjects();
    const lowerQuery = query.toLowerCase();

    return projects.filter(p =>
      p.projectName.toLowerCase().includes(lowerQuery) ||
      p.migrationId.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Parse a single project from RPC response
   */
  private parseProject(item: any, index: number): MigrationProject {
    const base64Data = item.account.data[0];
    const buffer = this.base64ToBuffer(base64Data);

    try {
      // Read migration ID (at byte 12)
      const migIdLength = this.readUInt32LE(buffer, 8);
      const migrationId = this.bufferToString(buffer, 12, 12 + migIdLength);

      // Read project name
      const nameStart = 12 + migIdLength + 4;
      const nameLength = this.readUInt32LE(buffer, 12 + migIdLength);
      const projectName = this.bufferToString(buffer, nameStart, nameStart + nameLength);

      // Token mint addresses (32 bytes each)
      const oldTokenMintOffset = nameStart + nameLength;
      const newTokenMintOffset = oldTokenMintOffset + 32;

      let oldTokenMint: string | null = null;
      let newTokenMint: string | null = null;

      try {
        oldTokenMint = this.bufferToBase58(
          buffer.slice(oldTokenMintOffset, oldTokenMintOffset + 32)
        );
        newTokenMint = this.bufferToBase58(
          buffer.slice(newTokenMintOffset, newTokenMintOffset + 32)
        );
      } catch (e) {
        // Ignore parsing errors
      }

      // Find timestamps
      const timestamps = this.scanForTimestamps(buffer);
      const { startDate, endDate } = this.extractDates(timestamps);

      // Determine status
      const status = this.determineStatus(startDate, endDate);

      return {
        index,
        pubkey: item.pubkey,
        migrationId,
        projectName,
        oldTokenMint,
        newTokenMint,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        status,
        tokensMigrated: null,
        totalSupply: null,
        percentMigrated: null,
      };
    } catch (e) {
      return {
        index,
        pubkey: item.pubkey,
        migrationId: 'unknown',
        projectName: 'Unknown',
        oldTokenMint: null,
        newTokenMint: null,
        startDate: null,
        endDate: null,
        status: 'Unknown',
        tokensMigrated: null,
        totalSupply: null,
        percentMigrated: null,
      };
    }
  }

  /**
   * Scan buffer for valid Unix timestamps
   */
  private scanForTimestamps(buffer: Uint8Array): Array<{ offset: number; value: bigint; date: Date }> {
    const minTimestamp = 1577836800n; // 2020-01-01
    const maxTimestamp = 1893456000n; // 2030-01-01
    const timestamps: Array<{ offset: number; value: bigint; date: Date }> = [];

    for (let offset = 0; offset < buffer.length - 8; offset++) {
      try {
        const value = this.readBigUInt64LE(buffer, offset);
        if (value >= minTimestamp && value <= maxTimestamp) {
          const date = new Date(Number(value) * 1000);
          timestamps.push({ offset, value, date });
        }
      } catch (e) {
        continue;
      }
    }

    return timestamps;
  }

  /**
   * Extract start and end dates from timestamps
   */
  private extractDates(timestamps: Array<{ offset: number; value: bigint; date: Date }>): {
    startDate: Date | null;
    endDate: Date | null;
  } {
    // Remove duplicates
    const uniqueTimestamps = timestamps.filter((ts, index, self) =>
      index === self.findIndex(t => t.value === ts.value)
    );

    // Sort by value
    uniqueTimestamps.sort((a, b) => Number(a.value) - Number(b.value));

    if (uniqueTimestamps.length >= 2) {
      return {
        startDate: uniqueTimestamps[0].date,
        endDate: uniqueTimestamps[1].date,
      };
    } else if (uniqueTimestamps.length === 1) {
      return {
        startDate: null,
        endDate: uniqueTimestamps[0].date,
      };
    }

    return { startDate: null, endDate: null };
  }

  /**
   * Determine migration status based on dates
   */
  private determineStatus(
    startDate: Date | null,
    endDate: Date | null
  ): 'Active' | 'Claims' | 'Upcoming' | 'Unknown' {
    if (!endDate) return 'Unknown';

    const now = new Date();

    if (startDate && now < startDate) {
      return 'Upcoming';
    } else if (now <= endDate) {
      return 'Active';
    } else {
      return 'Claims';
    }
  }

  // Buffer utility methods

  private base64ToBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private readUInt32LE(buffer: Uint8Array, offset: number): number {
    return (
      buffer[offset] |
      (buffer[offset + 1] << 8) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 3] << 24)
    ) >>> 0;
  }

  private readBigUInt64LE(buffer: Uint8Array, offset: number): bigint {
    const low =
      buffer[offset] |
      (buffer[offset + 1] << 8) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 3] << 24);
    const high =
      buffer[offset + 4] |
      (buffer[offset + 5] << 8) |
      (buffer[offset + 6] << 16) |
      (buffer[offset + 7] << 24);
    return (BigInt(high) << 32n) | BigInt(low >>> 0);
  }

  private bufferToString(buffer: Uint8Array, start: number, end: number): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer.slice(start, end));
  }

  private bufferToBase58(buffer: Uint8Array): string {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const base58: string[] = [];

    // Convert buffer to BigInt
    let num = 0n;
    for (let i = 0; i < buffer.length; i++) {
      num = num * 256n + BigInt(buffer[i]);
    }

    // Convert to base58
    while (num > 0n) {
      const remainder = Number(num % 58n);
      base58.unshift(ALPHABET[remainder]);
      num = num / 58n;
    }

    // Add leading 1s for leading zeros in buffer
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
      base58.unshift('1');
    }

    return base58.join('');
  }
}

// Export singleton instance
export const migrateFunApi = new MigrateFunAPI();

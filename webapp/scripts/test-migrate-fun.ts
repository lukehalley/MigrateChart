/**
 * Test script for migrate.fun API integration
 *
 * Usage:
 *   npx tsx scripts/test-migrate-fun.ts
 */

import { MigrateFunAPI } from '../lib/migrateFunApi';

async function main() {
  console.log('🔍 Testing Migrate.fun API Integration\n');

  const api = new MigrateFunAPI();

  try {
    // Test 1: Fetch all projects
    console.log('📊 Fetching all migration projects...');
    const allProjects = await api.fetchAllProjects();
    console.log(`✓ Found ${allProjects.length} total migrations\n`);

    // Test 2: Get statistics
    console.log('📈 Getting migration statistics...');
    const stats = await api.getStats();
    console.log('✓ Statistics:');
    console.log(`  - Total: ${stats.total}`);
    console.log(`  - Active: ${stats.active}`);
    console.log(`  - Claims: ${stats.claims}`);
    console.log(`  - Upcoming: ${stats.upcoming}\n`);

    // Test 3: Fetch active projects
    console.log('🔥 Fetching active migrations...');
    const active = await api.fetchActiveProjects();
    console.log(`✓ Found ${active.length} active migration(s)\n`);

    if (active.length > 0) {
      console.log('Active Migrations:');
      active.forEach(project => {
        console.log(`\n  📦 ${project.projectName}`);
        console.log(`     ID: ${project.migrationId}`);
        console.log(`     PubKey: ${project.pubkey}`);
        console.log(`     Old Token: ${project.oldTokenMint}`);
        console.log(`     New Token: ${project.newTokenMint}`);
        console.log(`     Start: ${project.startDate}`);
        console.log(`     End: ${project.endDate}`);
        console.log(`     URL: https://migrate.fun/migrate/${project.migrationId}`);
      });
      console.log('');
    }

    // Test 4: Fetch recent claims
    console.log('⏰ Fetching recent claims (last 30 days)...');
    const recentClaims = await api.fetchRecentClaims(30);
    console.log(`✓ Found ${recentClaims.length} recent claim(s)\n`);

    if (recentClaims.length > 0) {
      console.log('Recent Claims:');
      recentClaims.slice(0, 5).forEach(project => {
        console.log(`  - ${project.projectName} (ended ${project.endDate})`);
      });
      console.log('');
    }

    // Test 5: Search for a specific project
    console.log('🔎 Searching for "MEMEVERSE"...');
    const searchResults = await api.searchProjects('MEMEVERSE');
    console.log(`✓ Found ${searchResults.length} result(s)\n`);

    if (searchResults.length > 0) {
      const project = searchResults[0];
      console.log('Search Result:');
      console.log(`  Name: ${project.projectName}`);
      console.log(`  Status: ${project.status}`);
      console.log(`  End Date: ${project.endDate}\n`);
    }

    // Test 6: Get specific project by pubkey
    if (active.length > 0) {
      const pubkey = active[0].pubkey;
      console.log(`🎯 Getting project by pubkey: ${pubkey.slice(0, 10)}...`);
      const project = await api.getProject(pubkey);
      if (project) {
        console.log(`✓ Found: ${project.projectName}\n`);
      }
    }

    console.log('✅ All tests passed successfully!');
  } catch (error) {
    console.error('❌ Error testing API:', error);
    process.exit(1);
  }
}

main();

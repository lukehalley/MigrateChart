#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '../.env' }); // Also check parent .env
const axios = require('axios');
const fs = require('fs');

const BEARER_TOKEN = process.env.X_BEARER_TOKEN;
const TARGET_HANDLE = process.env.MIGRATE_FUN_HANDLE || 'MigrateFun';

// X API v2 endpoints
const BASE_URL = 'https://api.twitter.com/2';

async function getUserId(username) {
  const url = `${BASE_URL}/users/by/username/${username}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });

    return response.data.data.id;
  } catch (error) {
    console.error('Error fetching user ID:', error.response?.data || error.message);
    throw error;
  }
}

async function fetchTweets(userId, maxResults = 100) {
  const url = `${BASE_URL}/users/${userId}/tweets`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      },
      params: {
        'max_results': maxResults,
        'tweet.fields': 'created_at,public_metrics,entities',
        'expansions': 'referenced_tweets.id'
      }
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching tweets:', error.response?.data || error.message);
    throw error;
  }
}

function extractProjects(tweets) {
  const projects = [];
  const projectHandles = new Set();

  // Patterns to match
  const supportPattern = /excited to support @(\w+)/i;
  const migrationPattern = /@(\w+)(?:'s| )migration/i;
  const claimPattern = /claim.*@(\w+)/i;
  const mentionPattern = /@(\w+)/g;

  tweets.forEach(tweet => {
    const text = tweet.text;
    const date = tweet.created_at;
    const metrics = tweet.public_metrics;

    // Try to extract project handle
    let projectHandle = null;
    let type = null;

    // Pattern 1: "excited to support @Project"
    const supportMatch = text.match(supportPattern);
    if (supportMatch) {
      projectHandle = supportMatch[1];
      type = 'announcement';
    }

    // Pattern 2: "@Project's migration" or "@Project migration"
    if (!projectHandle) {
      const migrationMatch = text.match(migrationPattern);
      if (migrationMatch && migrationMatch[1] !== TARGET_HANDLE) {
        projectHandle = migrationMatch[1];
        type = 'update';
      }
    }

    // Pattern 3: "claim your @Project tokens"
    if (!projectHandle) {
      const claimMatch = text.match(claimPattern);
      if (claimMatch && claimMatch[1] !== TARGET_HANDLE) {
        projectHandle = claimMatch[1];
        type = 'completion';
      }
    }

    // Extract migration dates
    let migrationDate = null;
    const datePattern = /(?:December|Dec|January|Jan)\s+(\d{1,2})(?:th|st|nd|rd)?/g;
    const dates = [...text.matchAll(datePattern)];
    if (dates.length > 0) {
      migrationDate = dates.map(d => d[0]).join(', ');
    }

    // Extract migration URLs
    let migrationUrl = null;
    const urlPattern = /migrate\.fun\/(?:project|migrate|claim)\/(mig\d+)/;
    const urlMatch = text.match(urlPattern);
    if (urlMatch) {
      migrationUrl = `https://migrate.fun/project/${urlMatch[1]}`;
    }

    if (projectHandle && !projectHandles.has(projectHandle)) {
      projectHandles.add(projectHandle);

      projects.push({
        projectHandle: `@${projectHandle}`,
        type,
        migrationDate,
        migrationUrl,
        tweetDate: date,
        engagement: {
          views: metrics.impression_count,
          likes: metrics.like_count,
          retweets: metrics.retweet_count,
          replies: metrics.reply_count
        },
        tweetText: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        tweetUrl: `https://x.com/${TARGET_HANDLE}/status/${tweet.id}`
      });
    }
  });

  return projects.sort((a, b) => {
    // Sort by engagement (views)
    return (b.engagement.views || 0) - (a.engagement.views || 0);
  });
}

async function main() {
  console.log('🚀 Fetching tweets from @' + TARGET_HANDLE);

  if (!BEARER_TOKEN) {
    console.error('❌ X_BEARER_TOKEN not found in .env.local');
    console.error('Please add your Bearer Token to outreach/.env.local');
    process.exit(1);
  }

  try {
    // Step 1: Get user ID
    console.log('📡 Looking up user ID...');
    const userId = await getUserId(TARGET_HANDLE);
    console.log(`✅ Found user ID: ${userId}`);

    // Step 2: Fetch tweets
    console.log('📥 Fetching tweets...');
    const tweets = await fetchTweets(userId, 100);
    console.log(`✅ Fetched ${tweets.length} tweets`);

    // Step 3: Extract projects
    console.log('🔍 Extracting project mentions...');
    const projects = extractProjects(tweets);
    console.log(`✅ Found ${projects.length} unique projects`);

    // Step 4: Save results
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `leads-${timestamp}.json`;

    const output = {
      fetchedAt: new Date().toISOString(),
      source: `@${TARGET_HANDLE}`,
      totalTweets: tweets.length,
      projectsFound: projects.length,
      projects: projects
    };

    fs.writeFileSync(filename, JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved to ${filename}`);

    // Print summary
    console.log('\n📊 Top 10 Projects by Engagement:\n');
    projects.slice(0, 10).forEach((p, i) => {
      console.log(`${i + 1}. ${p.projectHandle}`);
      console.log(`   Type: ${p.type || 'unknown'}`);
      console.log(`   Views: ${p.engagement.views?.toLocaleString() || 'N/A'}`);
      console.log(`   Date: ${p.migrationDate || 'Not specified'}`);
      if (p.migrationUrl) console.log(`   URL: ${p.migrationUrl}`);
      console.log('');
    });

    console.log('✅ Done! Check ' + filename + ' for full data.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

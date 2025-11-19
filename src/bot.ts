import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';
import { Client4 } from '@mattermost/client';
import { Config, Schedule } from './types';

/**
 * Load and parse the configuration file
 */
function loadConfig(configPath: string): Config {
  try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const config: Config = JSON.parse(configData);
    
    // Validate required fields
    if (!config.mattermostUrl || !config.botToken) {
      throw new Error('Missing required configuration fields: mattermostUrl or botToken');
    }
    
    if (!config.schedules || !Array.isArray(config.schedules)) {
      throw new Error('Schedules must be an array');
    }
    
    // Validate each schedule has a channelId
    config.schedules.forEach((schedule, index) => {
      if (!schedule.channelId) {
        throw new Error(`Schedule ${index + 1} is missing channelId`);
      }
    });
    
    console.log('✓ Configuration loaded successfully');
    console.log(`  Server: ${config.mattermostUrl}`);
    console.log(`  Schedules: ${config.schedules.length} total, ${config.schedules.filter(s => s.enabled).length} enabled`);
    
    return config;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(`Error: Configuration file not found at ${configPath}`);
      console.error('Please create a config.json file. See config.example.json for reference.');
    } else if (error instanceof SyntaxError) {
      console.error('Error: Invalid JSON in configuration file');
      console.error(error.message);
    } else {
      console.error('Error loading configuration:', error);
    }
    process.exit(1);
  }
}

/**
 * Initialize the Mattermost client
 */
function initializeMattermostClient(config: Config): Client4 {
  const client = new Client4();
  client.setUrl(config.mattermostUrl);
  client.setToken(config.botToken);
  
  console.log('✓ Mattermost client initialized');
  
  return client;
}

/**
 * Send a message to a specific channel
 */
async function sendMessage(client: Client4, channelId: string, message: string): Promise<void> {
  try {
    await client.createPost({
      channel_id: channelId,
      message: message,
    } as any);
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✓ Message sent to channel ${channelId}: "${message}"`);
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ✗ Failed to send message to channel ${channelId}:`, error);
    
    if ((error as any).status_code === 401) {
      console.error('Authentication failed. Please check your bot token.');
    } else if ((error as any).status_code === 403) {
      console.error('Permission denied. The bot may not have access to the channel.');
    } else if ((error as any).status_code === 404) {
      console.error('Channel not found. Please check your channel ID.');
    }
  }
}

/**
 * Validate a cron expression
 */
function validateCronExpression(expression: string): boolean {
  return cron.validate(expression);
}

/**
 * Set up scheduled tasks based on configuration
 */
function setupSchedules(client: Client4, config: Config): void {
  const enabledSchedules = config.schedules.filter(schedule => schedule.enabled);
  
  if (enabledSchedules.length === 0) {
    console.warn('⚠ No enabled schedules found. The bot will run but send no messages.');
    return;
  }
  
  console.log('\nSetting up schedules:');
  
  enabledSchedules.forEach((schedule: Schedule, index: number) => {
    if (!validateCronExpression(schedule.cronExpression)) {
      console.error(`✗ Invalid cron expression for schedule ${index + 1}: "${schedule.cronExpression}"`);
      return;
    }
    
    cron.schedule(schedule.cronExpression, () => {
      sendMessage(client, schedule.channelId, schedule.message);
    });
    
    console.log(`  ${index + 1}. Schedule: ${schedule.cronExpression}`);
    console.log(`     Channel: ${schedule.channelId}`);
    console.log(`     Message: "${schedule.message}"`);
  });
  
  console.log(`\n✓ ${enabledSchedules.length} schedule(s) set up successfully`);
}

/**
 * Main function to start the bot
 */
async function main(): Promise<void> {
  console.log('=== Mattermost Scheduler Bot ===\n');
  
  // Determine config file path
  const configPath = process.env.CONFIG_PATH || path.join(process.cwd(), 'config.json');
  
  // Load configuration
  const config = loadConfig(configPath);
  
  // Initialize Mattermost client
  const client = initializeMattermostClient(config);
  
  // Test connection by attempting to get user info
  try {
    await client.getMe();
    console.log('✓ Successfully connected to Mattermost server');
  } catch (error) {
    console.error('✗ Failed to connect to Mattermost server:', error);
    console.error('Please check your mattermostUrl and botToken in config.json');
    process.exit(1);
  }
  
  // Set up scheduled tasks
  setupSchedules(client, config);
  
  console.log('\n🤖 Bot is now running. Press Ctrl+C to stop.');
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down bot...');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\n👋 Shutting down bot...');
    process.exit(0);
  });
}

// Start the bot
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


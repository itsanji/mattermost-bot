/**
 * Represents a scheduled message configuration
 */
export interface Schedule {
  /**
   * Cron expression defining when the message should be sent
   * Examples:
   * - "0 9 * * *" - Daily at 9:00 AM
   * - "0 * * * *" - Every hour
   * - "0 9 * * 1-5" - Weekdays at 9:00 AM
   */
  cronExpression: string;
  
  /**
   * The ID of the channel to send this message to
   */
  channelId: string;
  
  /**
   * The message content to send
   */
  message: string;
  
  /**
   * Whether this schedule is enabled
   */
  enabled: boolean;
}

/**
 * Main configuration structure for the Mattermost scheduler bot
 */
export interface Config {
  /**
   * The URL of the Mattermost server (e.g., "https://mattermost.example.com")
   */
  mattermostUrl: string;
  
  /**
   * Bot access token for authentication
   */
  botToken: string;
  
  /**
   * Array of scheduled message configurations
   */
  schedules: Schedule[];
}


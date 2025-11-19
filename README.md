# Mattermost Scheduler Bot

A TypeScript-based bot that sends scheduled messages to Mattermost channels at specified times using cron expressions.

## Features

- 🕐 Schedule messages using flexible cron expressions
- 📝 Support for multiple scheduled messages
- ⚙️ Easy configuration via JSON file
- 🔄 Enable/disable individual schedules without removing them
- 🛡️ Type-safe configuration with TypeScript
- 📊 Clear logging for monitoring and debugging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Mattermost server
- A bot account with an access token

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Configuration

### Step 1: Create Configuration File

Copy the example configuration file:
```bash
cp config.example.json config.json
```

### Step 2: Get Your Bot Token

1. Log in to your Mattermost server as an admin
2. Go to **System Console** → **Integrations** → **Bot Accounts**
3. Click **Add Bot Account**
4. Fill in the bot details (name, description, etc.)
5. After creating, copy the **Access Token** (you'll need this for the config)

### Step 3: Get Your Channel ID

There are several ways to get a channel ID:

**Method 1: From URL**
- Open the channel in Mattermost
- Look at the URL: `https://your-server.com/team-name/channels/CHANNEL_ID`
- The last part is your channel ID

**Method 2: Using API**
- Use the Mattermost API to list channels
- Find your channel in the response

**Method 3: Developer Tools**
- Open browser developer tools (F12)
- Navigate to the channel
- In the Network tab, look for API calls containing the channel ID

### Step 4: Configure config.json

Edit `config.json` with your values:

```json
{
  "mattermostUrl": "https://your-mattermost-server.com",
  "botToken": "your-bot-token-here",
  "channelId": "your-channel-id-here",
  "schedules": [
    {
      "cronExpression": "0 9 * * *",
      "message": "Good morning team!",
      "enabled": true
    }
  ]
}
```

## Configuration Options

### Main Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mattermostUrl` | string | Yes | The URL of your Mattermost server |
| `botToken` | string | Yes | Bot access token for authentication |
| `channelId` | string | Yes | ID of the channel to send messages to |
| `schedules` | array | Yes | Array of scheduled message configurations |

### Schedule Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cronExpression` | string | Yes | Cron expression defining when to send the message |
| `message` | string | Yes | The message content to send |
| `enabled` | boolean | Yes | Whether this schedule is active |

## Cron Expression Examples

Cron expressions follow the format: `* * * * *` (minute hour day month weekday)

| Expression | Description |
|------------|-------------|
| `0 9 * * *` | Every day at 9:00 AM |
| `0 */2 * * *` | Every 2 hours |
| `30 8 * * 1-5` | Weekdays at 8:30 AM |
| `0 12 * * 1` | Every Monday at 12:00 PM |
| `0 0 1 * *` | First day of every month at midnight |
| `*/15 * * * *` | Every 15 minutes |

Use [crontab.guru](https://crontab.guru/) to help create and understand cron expressions.

## Usage

### Run the Bot

**Production mode (compiled):**
```bash
npm start
```

**Development mode (with ts-node):**
```bash
npm run dev
```

**Build and watch for changes:**
```bash
npm run watch
```

### Using a Different Config File

You can specify a custom config file path using the `CONFIG_PATH` environment variable:

```bash
CONFIG_PATH=/path/to/custom-config.json npm start
```

### Running as a Service

For production deployment, consider running the bot as a system service.

**Using systemd (Linux):**

Create `/etc/systemd/system/mattermost-bot.service`:

```ini
[Unit]
Description=Mattermost Scheduler Bot
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/mm-bot-rebecca
ExecStart=/usr/bin/node /path/to/mm-bot-rebecca/dist/bot.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mattermost-bot
sudo systemctl start mattermost-bot
sudo systemctl status mattermost-bot
```

**Using PM2:**

```bash
npm install -g pm2
pm2 start dist/bot.js --name mattermost-scheduler-bot
pm2 save
pm2 startup
```

## Troubleshooting

### Bot fails to connect

- Verify your `mattermostUrl` is correct and accessible
- Check that your `botToken` is valid and hasn't expired
- Ensure the bot account is active in Mattermost

### Messages not being sent

- Verify the bot has permission to post in the target channel
- Check that the `channelId` is correct
- Ensure at least one schedule is enabled
- Verify cron expressions are valid
- Check the console logs for error messages

### Authentication errors (401)

- Your bot token may be invalid or expired
- Generate a new token in Mattermost and update `config.json`

### Permission errors (403)

- The bot doesn't have permission to post in the channel
- Add the bot to the channel in Mattermost
- Check channel privacy settings

### Channel not found (404)

- The channel ID is incorrect
- The channel may have been deleted
- Double-check the channel ID in your config

## Development

### Project Structure

```
mm-bot-rebecca/
├── src/
│   ├── bot.ts          # Main bot logic
│   └── types.ts        # TypeScript type definitions
├── dist/               # Compiled JavaScript (generated)
├── config.json         # Your configuration (not in git)
├── config.example.json # Example configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

### Building

```bash
npm run build
```

### Adding New Schedules

1. Edit `config.json`
2. Add a new object to the `schedules` array
3. Restart the bot

The bot will automatically pick up the new schedules on restart.

## Security Notes

- Keep your `config.json` file secure (it's in `.gitignore` by default)
- Never commit your bot token to version control
- Use environment variables for sensitive data in production
- Regularly rotate your bot tokens
- Ensure the bot only has necessary permissions

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Mattermost bot documentation
3. Open an issue in this repository


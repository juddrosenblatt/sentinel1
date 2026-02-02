# Development Environment Setup

## Quick Start Development

```bash
# Install dependencies
npm install

# Start in development mode with hot reload
npm run dev

# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format
```

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Logging
SENTINEL_LOG_LEVEL=debug

# Detection Settings
SENTINEL_THREAT_THRESHOLD=7.0
SENTINEL_ENABLE_ML=true
SENTINEL_ENABLE_ANOMALY=true

# Response Settings
SENTINEL_AUTO_RESPOND=true
SENTINEL_MAX_INCIDENTS=10

# Data Sources
SIEM_API_KEY=your_siem_key_here
EDR_API_KEY=your_edr_key_here

# Integrations
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SMTP_HOST=smtp.example.com
SMTP_USER=notifications@example.com
SMTP_PASSWORD=your_password_here
PAGERDUTY_KEY=your_pagerduty_key_here
```

## Project Structure

```
sentinel/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── cli.ts                   # CLI interface
│   ├── core/
│   │   └── event-system.ts      # Event management
│   ├── detection/
│   │   ├── threat-engine.ts     # Threat detection
│   │   └── anomaly-detector.ts  # Anomaly detection
│   ├── response/
│   │   └── orchestrator.ts      # Response orchestration
│   └── utils/
│       ├── logger.ts            # Logging utility
│       └── config.ts            # Configuration loader
├── config/
│   └── sentinel.config.json     # Default configuration
├── tests/                       # Test files
├── dist/                        # Compiled output
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

## Key Modules

### Sentinel (Core)
- Main orchestrator
- Lifecycle management
- Event emission
- Status tracking

### Threat Detection Engine
- Signature-based detection
- ML-powered threat identification
- Pattern matching
- Event analysis

### Anomaly Detector
- Statistical baseline tracking
- Deviation detection
- Real-time metrics analysis
- ML-based anomaly identification

### Incident Response Orchestrator
- Automated response execution
- Playbook management
- Action sequencing
- Incident tracking

## Adding New Features

### Adding a New Detection Method

1. Create module in `src/detection/`
2. Extend `EventEmitter` for event support
3. Implement initialization and analysis methods
4. Integrate with main Sentinel class
5. Add tests in `tests/`
6. Update README documentation

### Adding a New Response Action

1. Create action handler in `src/response/`
2. Add to orchestrator's action executors
3. Implement error handling
4. Add logging for audit trail
5. Test with sample incidents

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- src/detection/threat-engine.test.ts
```

## Debugging

### Enable Debug Logging

Set environment variable:
```bash
SENTINEL_LOG_LEVEL=debug npm run dev
```

### VS Code Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "SENTINEL",
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "args": ["src/index.ts"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Performance Testing

```bash
# Monitor memory usage
node --max-old-space-size=4096 dist/index.js

# Profile execution
node --prof dist/index.js
node --prof-process isolate-*.log > profile.txt
```

## Deployment

### Building for Production

```bash
# Build TypeScript
npm run build

# Verify build
npm run type-check

# Run production
NODE_ENV=production npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
CMD ["npm", "start"]
```

## Troubleshooting

### Module Not Found Errors
```bash
# Rebuild TypeScript
npm run build

# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Port Already in Use
```bash
# Find and kill process
lsof -ti:8080 | xargs kill -9
```

### Memory Issues
- Increase Node.js heap size
- Review event listener cleanup
- Check for memory leaks in tests

## Support

- Check existing issues and discussions
- Review code comments and JSDoc
- Consult the main README
- Open a new issue if stuck

Happy coding! 🚀

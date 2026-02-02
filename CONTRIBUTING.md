# CONTRIBUTING

We welcome contributions to SENTINEL! Here's how to get started.

## Code of Conduct

Be respectful and constructive. We're all here to improve security together.

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Include reproduction steps
3. Attach relevant logs or screenshots
4. Describe expected vs actual behavior

### Suggesting Features

1. Check existing discussions
2. Explain the use case and benefit
3. Provide examples or mockups if applicable
4. Consider backwards compatibility

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Add tests: `npm test`
5. Run linting: `npm run lint`
6. Format code: `npm run format`
7. Commit with clear messages
8. Push to your fork
9. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Run in dev mode with auto-reload
npm run dev

# Run tests with coverage
npm run test:coverage

# Check types
npm run type-check
```

## Code Style

- TypeScript strict mode enabled
- ESLint rules enforced
- Prettier formatting required
- JSDoc comments for public APIs
- 80% test coverage minimum

## Testing

All changes must include tests:

```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add threat correlation engine
fix: resolve memory leak in anomaly detector
docs: update API reference
test: add integration tests for response orchestrator
```

## Pull Request Process

1. Update README if needed
2. Add tests for new features
3. Ensure CI passes
4. Request review from maintainers
5. Address feedback promptly
6. Maintain a clean commit history

## Questions?

- Open a discussion: https://github.com/yourusername/sentinel/discussions
- Review documentation: https://docs.example.com
- Contact security team

Thank you for contributing!

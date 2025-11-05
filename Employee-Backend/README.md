# Employee TimeCard Backend

This is the backend API service for the Employee TimeCard System.

## Features

- RESTful API using Express.js and TypeScript
- MongoDB database integration
- JWT Authentication
- Input validation
- Error handling middleware
- Testing with Jest
- ESLint and Prettier for code formatting

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Application entry point
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Start production server:
   ```bash
   npm start
   ```

## Testing

Run tests:
```bash
npm test
```

## API Documentation

Will be added soon.

## License

MIT
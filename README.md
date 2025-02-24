# AI-Powered E-Commerce Aggregator

An AI-powered shopping assistant that aggregates and compares products across multiple e-commerce platforms.

## Architecture

The project follows a distributed scraping architecture:
1. Backend (FastAPI) generates search URLs for different e-commerce platforms
2. Frontend (React Native) handles page loading and scraping using AI agents in WebViews
3. This approach helps avoid bot detection and provides a more reliable scraping solution

## Project Structure

```
.
├── backend/               # FastAPI backend service
│   ├── app/              # Application code
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core configurations
│   │   ├── models/       # Data models
│   │   └── services/     # Business logic
│   └── requirements.txt  # Python dependencies
│
└── mobile/               # React Native mobile app
    ├── app/             # Application screens
    ├── components/      # Reusable components
    ├── constants/       # App constants
    └── hooks/          # Custom React hooks
```

## Setup & Running

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create .env file:
```bash
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your-secret-key-here
```

5. Start the server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS/Android:
- Press 'i' for iOS simulator
- Press 'a' for Android emulator
- Scan QR code with Expo Go app for physical device

## Features

### Phase 1 (Current)
- Product search across e-commerce platforms (Amazon India, Flipkart)
- AI-powered web scraping using WebViews
- Product comparison with prices, ratings, and reviews
- Responsive grid layout for search results
- Dark/Light theme support

### Upcoming Phases
- Price tracking and alerts
- Cross-platform shopping cart
- User authentication
- More e-commerce platforms
- Enhanced AI features

## Development

### Backend Development

- API documentation available at http://localhost:8000/docs
- New endpoints should be added in `backend/app/api/v1/`
- Follow existing patterns for models and services

### Mobile Development

- Uses Expo and React Native
- New screens should be added in `mobile/app/`
- Reusable components go in `mobile/components/`
- Follow existing patterns for styling and theming

## Testing

TODO: Add testing instructions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

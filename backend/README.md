# AI Commerce Aggregator Backend

This is the backend service for the AI-powered e-commerce aggregator. It provides APIs for generating search URLs for multiple e-commerce platforms (currently supporting Amazon India and Flipkart).

## Architecture

The system follows a distributed scraping architecture:
1. Backend generates search URLs for different e-commerce platforms
2. Frontend (React Native) handles the actual page loading and scraping using AI agents
3. This approach helps avoid bot detection and provides a more reliable scraping solution

## Features

- Generate search URLs for multiple e-commerce platforms
- Platform configuration management
- MongoDB integration for data persistence
- FastAPI-based REST API
- Health check endpoints

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URL=mongodb://localhost:27017
JWT_SECRET=your-secret-key-here
```

3. Start MongoDB:
Make sure MongoDB is running locally or update the MONGODB_URL in .env to point to your MongoDB instance.

## Running the Server

From the backend directory:
```bash
uvicorn app.main:app --reload
```

The server will start at http://localhost:8000

## API Documentation

Once the server is running, you can access:
- Interactive API docs: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

## API Endpoints

### Health Check
```
GET /health
```
Returns the health status of the service and its database connection.

### Get Search Links
```
POST /api/v1/products/search-links
```
Generate search URLs for supported e-commerce platforms.

Request body:
```json
{
  "query": "search term",
  "platform": "amazon",
  "page": 1
}
```

Response:
```json
{
  "links": [
    {
      "platform": "amazon",
      "search_url": "https://www.amazon.in/s?k=search+term",
      "base_url": "https://www.amazon.in"
    }
  ],
  "page": 1,
  "platform": "amazon"
}
```

### Get Supported Platforms
```
GET /api/v1/products/supported-platforms
```
Get a list of supported e-commerce platforms and their configurations.

Response:
```json
{
  "platforms": [
    {
      "id": "amazon",
      "name": "Amazon India",
      "base_url": "https://www.amazon.in"
    },
    {
      "id": "flipkart",
      "name": "Flipkart",
      "base_url": "https://www.flipkart.com"
    }
  ]
}
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── products.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── product.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── product_service.py
│   ├── __init__.py
│   └── main.py
├── requirements.txt
└── .env
```

## Development

### Adding New Platforms

1. Add platform configuration in `app/core/config.py`
2. Update platform-specific URL generation in `app/services/product_service.py` if needed
3. Test the new platform integration

### Adding New Features

1. Add new models in `app/models/`
2. Create new services in `app/services/`
3. Add new endpoints in `app/api/v1/`
4. Update configuration in `app/core/config.py` if needed

### Testing

TODO: Add testing instructions

## Future Enhancements

- Add support for more e-commerce platforms
- Implement caching for better performance
- Add user authentication and authorization
- Add rate limiting
- Add platform-specific search parameters
- Add price tracking metadata

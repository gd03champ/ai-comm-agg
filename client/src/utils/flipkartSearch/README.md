# Flipkart Search API

This module provides a simple and flexible API for searching Flipkart products within the app.

## Basic Usage

```javascript
import flipkartSearch from '../utils/flipkartSearch';

// In a React component with a WebView reference
const MyComponent = () => {
  const webViewRef = useRef(null);
  
  const searchProducts = async () => {
    try {
      const products = await flipkartSearch.search({
        query: 'smartphone',
        maxResults: 10,
        webViewRef: webViewRef,
        onProgress: (message, progress) => {
          console.log(`${progress}%: ${message}`);
        }
      });
      
      console.log('Found products:', products);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };
  
  return (
    <View>
      <WebView
        ref={webViewRef}
        source={{ uri: flipkartSearch.getUrl('initial search') }}
        style={{ height: 0, width: 0 }}
        // WebView must have javaScriptEnabled set to true
        javaScriptEnabled={true}
      />
      <Button title="Search" onPress={searchProducts} />
    </View>
  );
};
```

## API Reference

### `search(options)`

Searches Flipkart for products based on the query.

**Parameters:**

- `options` (Object): Search configuration
  - `query` (String): Search term
  - `maxResults` (Number, optional): Maximum number of results to return (default: 10)
  - `webViewRef` (WebView Ref): Reference to a React Native WebView component
  - `onProgress` (Function, optional): Callback for progress updates (message, percentComplete)
  - `onComplete` (Function, optional): Callback when search completes with results

**Returns:**

- Promise that resolves to an array of product objects

**Example Product Object:**

```json
{
  "title": "Samsung Galaxy S21 5G (Phantom Gray, 128 GB)",
  "price": "₹49,999",
  "rating": "4.3",
  "reviewCount": "3,456",
  "imageUrl": "https://rukminim1.flixcart.com/image/...",
  "url": "https://www.flipkart.com/samsung-galaxy-s21-5g/p/...",
  "asin": "/samsung-galaxy-s21-5g/p/itm48c...",
  "sponsored": false
}
```

### `getUrl(query)`

Returns a properly formatted Flipkart search URL.

**Parameters:**

- `query` (String): Search term

**Returns:**

- String with Flipkart search URL

## Implementation Notes

- This API uses a WebView component to interact with Flipkart, which must be provided by the calling component.
- The WebView can be visually hidden (width and height set to 0) but must be present in the component tree.
- The API handles all scraping logic internally, so you don't need to understand the inner workings to use it.
- For best results, handle any errors that might occur during the search process.
- Enhanced logging is included to make it easier to debug HTML structure issues.

## Common Issues

- **CAPTCHA Detection**: If Flipkart detects automated access, it may show a CAPTCHA. The API will log this situation for debugging purposes.
- **Changing Selectors**: Flipkart may update their site structure. The API includes multiple backup selectors for each field to improve resilience.
- **Mobile vs Desktop View**: The API attempts to handle both layouts, but may need updating as Flipkart evolves.

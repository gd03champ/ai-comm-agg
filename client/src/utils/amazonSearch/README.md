# Amazon Search API

This module provides a simple and flexible API for searching Amazon products within the app.

## Basic Usage

```javascript
import amazonSearch from '../utils/amazonSearch';

// In a React component with a WebView reference
const MyComponent = () => {
  const webViewRef = useRef(null);
  
  const searchProducts = async () => {
    try {
      const products = await amazonSearch.search({
        query: 'wireless headphones',
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
        source={{ uri: amazonSearch.getUrl('initial search') }}
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

Searches Amazon for products based on the query.

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
  "title": "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
  "price": "₹24,990",
  "rating": "4.5",
  "reviewCount": "12,345",
  "imageUrl": "https://m.media-amazon.com/images/I/...",
  "url": "https://www.amazon.in/Sony-WH-1000XM4-Cancelling-Headphones-Multi-Point/dp/...",
  "sponsored": false
}
```

### `getUrl(query)`

Returns a properly formatted Amazon search URL.

**Parameters:**

- `query` (String): Search term

**Returns:**

- String with Amazon search URL

## Implementation Notes

- This API uses a WebView component to interact with Amazon, which must be provided by the calling component.
- The WebView can be visually hidden (width and height set to 0) but must be present in the component tree.
- The API handles all scraping logic internally, so you don't need to understand the inner workings to use it.
- For best results, handle any errors that might occur during the search process.

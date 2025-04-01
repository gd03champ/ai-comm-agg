/**
 * Amazon Search API
 * 
 * Provides a clean interface for searching Amazon products
 */

import { searchAmazon, extractProductData } from './core/scraper';

/**
 * Format URL for Amazon search
 * @param {string} query - Search term 
 * @returns {string} URL for Amazon search
 */
const getSearchUrl = (query) => {
  return `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
};

/**
 * Search Amazon and return product results
 * 
 * @example
 * // Basic usage
 * const products = await amazonSearch.search({
 *   query: 'iphone',
 *   webViewRef: webViewRef,
 *   onProgress: (message, progress) => console.log(`${progress}%: ${message}`)
 * });
 * 
 * @param {object} options - Search options
 * @param {string} options.query - Search term
 * @param {number} options.maxResults - Maximum number of results (default: 10)
 * @param {WebView} options.webViewRef - Reference to WebView component
 * @param {function} options.onProgress - Progress callback (message, percentComplete)
 * @param {function} options.onComplete - Callback when search completes with results
 * @returns {Promise<Array>} Promise resolving to products array
 */
const search = async (options) => {
  try {
    const {
      query,
      maxResults = 10,
      webViewRef,
      onProgress,
      onComplete
    } = options;

    // Validate parameters
    if (!query) {
      throw new Error('Search query is required');
    }

    if (!webViewRef?.current) {
      throw new Error('Valid WebView reference is required');
    }

    return new Promise((resolve, reject) => {
      // Set up a flag to track if we've resolved yet
      let hasResolved = false;
      
      // Create message processing function that works with existing event handlers
      const processMessage = (event) => {
        try {
          // Skip if we've already resolved
          if (hasResolved) return false;
          
          // Make sure we have data to parse
          if (!event?.nativeEvent?.data) return false;
          
          const data = JSON.parse(event.nativeEvent.data);
          
          // Handle progress updates
          if (data.type === 'status' && onProgress) {
            onProgress(data.message, data.progress);
            return false; // Don't intercept status messages
          }
          
          // Handle search results
          else if (data.type === 'products' || data.type === 'amazon_search_results') {
            // Mark as resolved so we don't process more messages
            hasResolved = true;
            
            // Resolve the promise with the products data
            if (typeof onComplete === 'function') {
              onComplete(data.products);
            }
            resolve(data.products);
            return true; // Signal that we've handled this message
          }
          
          // Handle errors
          else if (data.type === 'error') {
            hasResolved = true;
            reject(new Error(data.message || 'Failed to search Amazon'));
            return true; // Signal that we've handled this message
          }
          
          return false; // Signal that we've not fully handled this message
        } catch (error) {
          console.error('Error processing WebView message:', error);
          return false; // Let other handlers try to process it
        }
      };
      
      // We won't override the webview's onMessage directly, instead we'll
      // rely on the component's existing onMessage to receive events
      
      // Create the injection script for searching - unchanged functionality
      const injectionScript = `
        ${searchAmazon}
        ${extractProductData}
        
        // Start the search and scraping process
        (async () => {
          try {
            if (typeof updateStatus === 'function') {
              updateStatus('Starting search process...', 10);
            }
            
            await performAmazonSearch();
            
            if (typeof updateStatus === 'function') {
              updateStatus('Extracting product data...', 50);
            }
            
            const products = await scrapeProductData(${maxResults});
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'amazon_search_results',
              products: products
            }));
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.toString()
            }));
          }
        })();
        
        true; // Required for injectedJavaScript
      `;
      
      // Inject the search script
      webViewRef.current.injectJavaScript(injectionScript);
    });
  } catch (error) {
    console.error('Amazon search failed:', error);
    throw error;
  }
};

// Public API
export { search, getSearchUrl as getUrl };

// Default export
export default {
  search,
  getUrl: getSearchUrl
};

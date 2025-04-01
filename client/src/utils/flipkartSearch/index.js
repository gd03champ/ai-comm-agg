/**
 * Flipkart Search API
 * 
 * Provides a clean interface for searching Flipkart products
 */

import { searchFlipkart, extractProductData } from './core/scraper';

/**
 * Format URL for Flipkart search
 * @param {string} query - Search term 
 * @returns {string} URL for Flipkart search
 */
const getSearchUrl = (query) => {
  return `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
};

/**
 * Search Flipkart and return product results
 * 
 * @example
 * // Basic usage
 * const products = await flipkartSearch.search({
 *   query: 'smartphone',
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
          else if (data.type === 'products' || data.type === 'flipkart_search_results') {
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
            reject(new Error(data.message || 'Failed to search Flipkart'));
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
      
      // Create the injection script for searching
      const injectionScript = `
        ${searchFlipkart}
        ${extractProductData}
        
        // Start the search and scraping process
        (async () => {
          try {
            if (typeof updateStatus === 'function') {
              updateStatus('Starting Flipkart search...', 10);
            }
            
            // For debugging mobile layout - log the full page HTML immediately
            if (typeof logHTML === 'function') {
              logHTML('html', 'Initial page structure for debugging');
            }
            
            // Wait a bit longer for mobile layout to fully render
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await performFlipkartSearch();
            
            if (typeof updateStatus === 'function') {
              updateStatus('Extracting product data...', 50);
            }
            
            const products = await scrapeProductData(${maxResults});
            
            // If we couldn't find any products, manually create some from any product links
            if (products.length === 0) {
              if (typeof logDebug === 'function') {
                logDebug('No products found with standard extraction, attempting direct extraction');
              }
              
              // Find all product links on the page
              const productLinks = document.querySelectorAll('a[href*="/p/"]');
              if (productLinks && productLinks.length > 0) {
                const manualProducts = [];
                
                for (let i = 0; i < Math.min(productLinks.length, ${maxResults}); i++) {
                  const link = productLinks[i];
                  const href = link.getAttribute('href');
                  let productContainer = link.parentElement;
                  
                  // Try to find a parent that might contain more product info
                  for (let j = 0; j < 4; j++) {
                    if (productContainer.parentElement) {
                      productContainer = productContainer.parentElement;
                    }
                  }
                  
                  // Extract basic info
                  const title = link.textContent.trim() || 
                                link.querySelector('span')?.textContent.trim() || 
                                'Unknown product';
                  
                  // Find price (look for ₹ symbol)
                  let price = null;
                  const textContent = productContainer.textContent;
                  const priceMatch = textContent.match(/₹\\s?([\\d,]+)/);
                  if (priceMatch) {
                    price = '₹' + priceMatch[1];
                  }
                  
                  // Find image
                  const img = productContainer.querySelector('img');
                  const imageUrl = img?.src || '';
                  
                  // Create product object
                  manualProducts.push({
                    title: title,
                    url: href.startsWith('/') ? 'https://www.flipkart.com' + href : href,
                    imageUrl: imageUrl,
                    price: price,
                    asin: href
                  });
                }
                
                if (manualProducts.length > 0) {
                  if (typeof logDebug === 'function') {
                    logDebug('Manually extracted products', { products: manualProducts });
                  }
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'flipkart_search_results',
                    products: manualProducts
                  }));
                  return;
                }
              }
            }
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'flipkart_search_results',
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
    console.error('Flipkart search failed:', error);
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

/**
 * Amazon Search Scraper
 * 
 * Core scraping logic for extracting product data from Amazon search results
 */

// Amazon search and product extraction scripts
export const searchAmazon = `
  // Execution flags to prevent duplicates
  let hasScraped = false;
  let debugMode = true;

  // Debug helper functions
  function logDebug(message, data = null) {
    if (debugMode) {
      const debugInfo = { 
        type: 'debug', 
        message: message,
        timestamp: new Date().toISOString()
      };
      if (data) debugInfo.data = data;
      window.ReactNativeWebView.postMessage(JSON.stringify(debugInfo));
    }
  }
  
  // Enhanced HTML logging with prettified output
  function logHTML(selector = 'body', context = 'Current HTML Structure', maxLength = 40000) {
    try {
      if (!debugMode) return;
      
      const elements = document.querySelectorAll(selector);
      if (!elements || elements.length === 0) {
        logDebug(\`Element not found: \${selector}\`);
        return;
      }
      
      // Get all matching elements
      const results = Array.from(elements).slice(0, 10).map((element, index) => {
        let html = element.outerHTML;
        if (html.length > maxLength) {
          html = html.substring(0, maxLength) + '...(truncated)';
        }
        
        return {
          index,
          html,
          textContent: element.textContent.substring(0, 200) + (element.textContent.length > 200 ? '...' : '')
        };
      });
      
      logDebug(context, { 
        selector,
        count: elements.length,
        elements: results
      });
      
    } catch (e) {
      logDebug('Error logging HTML', { error: e.toString() });
    }
  }

  // Status update function
  function updateStatus(message, progress) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'status',
      message,
      progress
    }));
    logDebug(message);
  }
  
  // Wait for elements to appear on the page
  function waitForElement(selectors, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Check if any selector already exists
      for (const selector of selectors) {
        if (document.querySelector(selector)) {
          const element = document.querySelector(selector);
          logDebug(\`Found element immediately: \${selector}\`);
          
          return resolve({
            element: element,
            foundSelector: selector
          });
        }
      }
      
      logDebug('Setting up mutation observer to wait for elements', { selectors });
      
      const observer = new MutationObserver(() => {
        for (const selector of selectors) {
          if (document.querySelector(selector)) {
            const element = document.querySelector(selector);
            const timeElapsed = Date.now() - startTime;
            
            observer.disconnect();
            logDebug(\`Element appeared after \${timeElapsed}ms: \${selector}\`);
            
            return resolve({
              element: element,
              foundSelector: selector,
              timeElapsed
            });
          }
        }
      });
      
      // Observe the entire document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });
      
      // Reject if no element appears within timeout
      setTimeout(() => {
        observer.disconnect();
        logDebug('Timeout waiting for selectors', { selectors, timeout });
        reject(new Error(\`None of the elements [\${selectors.join(', ')}] found within \${timeout}ms\`));
      }, timeout);
    });
  }

  // Scroll down to load more content
  function scrollDown() {
    return new Promise(resolve => {
      // Record metrics before scrolling
      const previousHeight = document.documentElement.scrollHeight;
      const previousPosition = window.scrollY;
      
      // Perform the scroll
      window.scrollTo(0, document.documentElement.scrollHeight);
      
      logDebug('Scrolling down to load more products');
      
      // Wait for content to load after scrolling
      setTimeout(() => {
        const newHeight = document.documentElement.scrollHeight;
        const newPosition = window.scrollY;
        const didScroll = (newPosition > previousPosition) || (newHeight > previousHeight);
        
        resolve({
          didScroll,
          previousHeight,
          newHeight,
          previousPosition,
          newPosition,
        });
      }, 1500); // Allow time for content to load
    });
  }

  // Amazon search function
  async function performAmazonSearch() {
    try {
      updateStatus('Waiting for search results to load...', 30);
      
      // Log the current URL
      logDebug('Current page URL', { url: window.location.href });
      
      // Wait for search results container
      await waitForElement([
        '.s-main-slot.s-result-list',
        '.s-search-results',
        '#search'
      ]);
      
      // Wait for actual product elements
      await waitForElement([
        '.s-result-item[data-component-type="s-search-result"]',
        '.s-search-result',
        '[data-component-type="s-search-result"]'
      ]);
      
      updateStatus('Search results loaded successfully', 40);
      return true;
    } catch (error) {
      logDebug('Error loading search results', { error: error.toString() });
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        message: 'Error loading search results: ' + error.message
      }));
      return false;
    }
  }
`;

// Function to extract product data from search results
export const extractProductData = `
  async function scrapeProductData(maxResults = 10) {
    try {
      if (hasScraped) {
        logDebug('Products already scraped, skipping duplicate extraction');
        return []; // Prevent duplicate scraping
      }
      
      hasScraped = true;
      updateStatus('Starting product extraction...', 60);
      
      // Get products with scrolling if needed
      const products = await extractProductsWithScrolling(maxResults);
      
      // Log the full JSON output for copying
      logDebug('Full JSON product data', {
        type: 'json',
        json: products
      });
      
      updateStatus('Data extraction complete', 100);
      return products;
    } catch (error) {
      logDebug('Error in scrapeProductData', { error: error.toString() });
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        message: 'Error extracting products: ' + error.message
      }));
      return [];
    }
  }
  
  // Improved extraction with better scrolling logic
  async function extractProductsWithScrolling(maxResults = 10) {
    let products = [];
    let scrollAttempts = 0;
    let processedAsins = new Set(); // Track processed ASINs to avoid duplicates
    const MAX_SCROLL_ATTEMPTS = 10;
    const REQUIRED_PRODUCTS = maxResults;
    
    // Keep scrolling until we get desired number of products
    while (products.length < REQUIRED_PRODUCTS && scrollAttempts < MAX_SCROLL_ATTEMPTS) {
      // Find all product items
      const productElements = document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]');
      logDebug(\`Found \${productElements.length} product elements after scroll \${scrollAttempts}\`);
      
      // Filter out elements without ASINs and ads
      const validProductElements = Array.from(productElements).filter(el => {
        const asin = el.getAttribute('data-asin');
        const isAd = el.querySelector('.s-sponsored-label-info-icon');
        return asin && asin.length > 0 && !processedAsins.has(asin) && !isAd;
      });
      
      // Process each new product
      for (let i = 0; i < validProductElements.length; i++) {
        if (products.length >= REQUIRED_PRODUCTS) break;
        
        const element = validProductElements[i];
        const asin = element.getAttribute('data-asin');
        
        if (processedAsins.has(asin)) continue;
        processedAsins.add(asin);
        
        const currentIndex = products.length + 1;
        updateStatus(\`Processing product \${currentIndex} of \${REQUIRED_PRODUCTS}\`, 60 + (currentIndex * 4));
        
        const product = extractProductInfo(element);
        
        if (product && product.title && product.url) {
          products.push(product);
        }
      }
      
      // If we still need more products, scroll down to load more
      if (products.length < REQUIRED_PRODUCTS) {
        updateStatus(\`Scrolling to find more products (\${products.length}/\${REQUIRED_PRODUCTS})\`, 60);
        const scrollResult = await scrollDown();
        
        // If scroll didn't change height, we've reached the bottom
        if (!scrollResult.didScroll) {
          logDebug('Reached bottom of page, cannot load more products');
          break;
        }
        
        scrollAttempts++;
        
        // Brief pause to let content load
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Return up to the max requested products
    return products.slice(0, REQUIRED_PRODUCTS);
  }
  
  // Extract info from a product element
  function extractProductInfo(element) {
    try {
      // Initialize product object
      const asin = element.getAttribute('data-asin') || '';
      
      const product = {
        title: '',
        url: '',
        imageUrl: '',
        price: null,
        rating: null,
        reviewCount: null,
        asin: asin,
        sponsored: !!element.querySelector('.s-sponsored-label-info-icon')
      };
      
      // Extract title with multiple selectors
      const titleSelectors = [
        'h2 a span',
        'h2 a',
        '.a-size-medium.a-color-base.a-text-normal',
        '.a-size-base-plus.a-color-base.a-text-normal',
        '.a-color-base.a-text-normal',
        '.a-link-normal .a-text-normal'
      ];
      
      for (const selector of titleSelectors) {
        const titleElement = element.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) {
          product.title = titleElement.textContent.trim();
          break;
        }
      }
      
      // Build a clean URL directly from ASIN
      if (asin) {
        // Create a clean Amazon URL with just the ASIN
        const domain = window.location.hostname;
        product.url = \`https://\${domain}/dp/\${asin}\`;
      }
      
      // Extract image with fallbacks
      const imageSelectors = [
        '.s-image',
        '.s-product-image-container img',
        'img.product-image'
      ];
      
      for (const selector of imageSelectors) {
        const imgElement = element.querySelector(selector);
        if (imgElement && imgElement.src) {
          product.imageUrl = imgElement.src;
          break;
        }
      }
      
      // Extract price with multiple possible selectors
      const priceSelectors = [
        '.a-price .a-offscreen',
        '.a-price-whole',
        '.a-color-price',
        '.a-price'
      ];
      
      for (const selector of priceSelectors) {
        const priceElement = element.querySelector(selector);
        if (priceElement && priceElement.textContent.trim()) {
          product.price = priceElement.textContent.trim();
          break;
        }
      }
      
      // Extract rating
      const ratingSelectors = [
        '.a-icon-star-small',
        '.a-icon-star',
        '[data-hook="review-star-rating"]'
      ];
      
      for (const selector of ratingSelectors) {
        const ratingElement = element.querySelector(selector);
        if (ratingElement && ratingElement.textContent.trim()) {
          // Extract just the number from the rating text
          const ratingMatch = ratingElement.textContent.trim().match(/(\\d+(\\.\\d+)?)/);
          if (ratingMatch) {
            product.rating = ratingMatch[1];
            break;
          }
        }
      }
      
      // Extract review count
      const reviewCountSelectors = [
        '.a-size-base.s-underline-text',
        '.a-size-small.a-link-normal'
      ];
      
      for (const selector of reviewCountSelectors) {
        const reviewElement = element.querySelector(selector);
        if (reviewElement) {
          const reviewText = reviewElement.textContent.trim();
          // Extract only numbers
          const matches = reviewText.match(/(\\d+[,\\d]*)/);
          if (matches && matches[0]) {
            product.reviewCount = matches[0].replace(/,/g, '');
            break;
          }
        }
      }
      
      return product;
    } catch (error) {
      logDebug('Error extracting product data', { error: error.toString() });
      return null;
    }
  }
`;

/**
 * Flipkart Search Scraper
 * 
 * Core scraping logic for extracting product data from Flipkart search results
 */

// Flipkart search and product extraction scripts
export const searchFlipkart = `
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
        
        // Log the current page HTML for debugging
        logHTML('body', 'Full page HTML at timeout');
        
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

  // Flipkart search function
  async function performFlipkartSearch() {
    try {
      updateStatus('Waiting for search results to load...', 30);
      
      // Log the current URL
      logDebug('Current page URL', { url: window.location.href });
      
      // Log the entire page HTML for debugging
      logHTML('html', 'Initial page HTML');
      
      // Wait for search results container - Flipkart selectors
      const possibleContainerSelectors = [
        '._1YokD2._3Mn1Gg', // Main search results container
        '.DUFPUZ', // Alternative container
        '._1AtVbE', // Product grid container
        '.MIXNux' // Mobile view container
      ];
      
      await waitForElement(possibleContainerSelectors);
      logDebug('Search container found');
      
      // Wait for actual product elements - Flipkart selectors
      const possibleProductSelectors = [
        '._1AtVbE._2GoDe3', // Product cards
        '._4rR01T', // Product title elements
        '._2kHMtA', // Product container
        '._1xHGtK._373qXS' // Mobile product cards
      ];
      
      await waitForElement(possibleProductSelectors);
      logDebug('Product elements found');
      
      // Log the structure of the search results page
      for (const selector of possibleContainerSelectors) {
        if (document.querySelector(selector)) {
          logHTML(selector, 'Search results container structure');
          break;
        }
      }
      
      // Log one complete product item for detailed inspection
      for (const selector of possibleProductSelectors) {
        const firstProduct = document.querySelector(selector);
        if (firstProduct) {
          logDebug('First product element structure', {
            fullHTML: firstProduct.outerHTML
          });
          break;
        }
      }
      
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
      
      // Log the entire page HTML for debugging
      logHTML('html', 'Page HTML before extraction');
      
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
    let processedIds = new Set(); // Track processed products to avoid duplicates
    const MAX_SCROLL_ATTEMPTS = 10;
    const REQUIRED_PRODUCTS = maxResults;
    
  // Identify the correct product container based on page structure
  function findProductElements() {
    logDebug('Searching for product elements in current page structure');
    
    // Try both desktop and mobile selectors
    // Desktop selectors
    const desktopSelectors = [
      '._1AtVbE._2GoDe3', // Standard product cards
      '._2kHMtA', // Alternative product container
      '._1xHGtK._373qXS', // Mobile product cards
      '.CXW8mj' // Another product container
    ];
    
    // Mobile app selectors (React Native Web)
    const mobileSelectors = [
      '.css-175oi2r.r-1pi2tsx', // Mobile view container with product items
      '.css-175oi2r[style*="flex-direction: column"]', // Product containers in mobile view
      'div[data-observerid]', // Observable product items
      'div[data-observerid] > div > div > div' // Inner product containers
    ];
    
    // Log entire page HTML to debug console 
    logHTML('body', 'Current page HTML structure');
    
    // First try desktop selectors
    for (const selector of desktopSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        logDebug(\`Found product elements using desktop selector: \${selector}\`);
        return Array.from(elements);
      }
    }
    
    // Then try mobile selectors
    let productElements = [];
    
    // Check for product links which are the most reliable indicator of products
    const productLinks = document.querySelectorAll('a[href*="/p/"]');
    if (productLinks && productLinks.length > 0) {
      logDebug(\`Found \${productLinks.length} product links in mobile view\`);
      
      // For each link, find its container - walk up the DOM until finding a suitable container
      productElements = Array.from(productLinks).map(link => {
        // Go up 4 levels to get the full product container
        let container = link;
        for (let i = 0; i < 4; i++) {
          if (container.parentElement) {
            container = container.parentElement;
          }
        }
        return container;
      });
      
      // Filter out duplicates
      const uniqueElements = [];
      const seenElements = new Set();
      
      productElements.forEach(el => {
        // Use outerHTML as a simple hash
        const hash = el.outerHTML.substring(0, 100);
        if (!seenElements.has(hash)) {
          seenElements.add(hash);
          uniqueElements.push(el);
        }
      });
      
      if (uniqueElements.length > 0) {
        logDebug(\`Found \${uniqueElements.length} unique product containers from links\`);
        return uniqueElements;
      }
    }
    
    // If no products found from links, try specific mobile containers
    for (const selector of mobileSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        // Filter elements that likely contain products (having images and price info)
        const productContainers = Array.from(elements).filter(el => {
          // Check if element contains an image and price text (contains ₹)
          const hasImage = el.querySelector('img') !== null;
          const hasPrice = el.textContent.includes('₹');
          return hasImage && hasPrice;
        });
        
        if (productContainers.length > 0) {
          logDebug(\`Found \${productContainers.length} product elements using mobile selector: \${selector}\`);
          return productContainers;
        }
      }
    }
    
    logDebug('No product elements found with any known selector');
    return [];
  }
    
    // Keep scrolling until we get desired number of products
    while (products.length < REQUIRED_PRODUCTS && scrollAttempts < MAX_SCROLL_ATTEMPTS) {
      // Find all product items
      const productElements = findProductElements();
      logDebug(\`Found \${productElements.length} product elements after scroll \${scrollAttempts}\`);
      
      if (productElements.length === 0 && scrollAttempts === 0) {
        // Log the page structure if no products found on first attempt
        logHTML('body', 'Page structure when no products found');
      }
      
      // Process each product element
      for (let i = 0; i < productElements.length; i++) {
        if (products.length >= REQUIRED_PRODUCTS) break;
        
        const element = productElements[i];
        
        // Generate a unique ID for this product
        // Use href if available, otherwise use the element's content hash
        let productId = null;
        const linkElement = element.querySelector('a[href]');
        
        if (linkElement) {
          productId = linkElement.getAttribute('href');
        } else {
          // Create a simple hash from the element's content
          productId = element.textContent.trim().substring(0, 100);
        }
        
        if (!productId || processedIds.has(productId)) continue;
        processedIds.add(productId);
        
        const currentIndex = products.length + 1;
        updateStatus(\`Processing product \${currentIndex} of \${REQUIRED_PRODUCTS}\`, 60 + (currentIndex * 4));
        
        // Log the structure of the current product element
        if (currentIndex <= 3) { // Log only first 3 to avoid too much data
          logHTML(element.outerHTML, \`Product \${currentIndex} structure\`);
        }
        
        const product = extractProductInfo(element, productId);
        
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
  function extractProductInfo(element, productId) {
    try {
      // Initialize product object
      const product = {
        title: '',
        url: '',
        imageUrl: '',
        price: null,
        rating: null,
        reviewCount: null,
        asin: productId, // Use the product ID as ASIN equivalent
        sponsored: false
      };
      
      // Log the element we're extracting from for debugging
      logDebug('Extracting product from element', {
        html: element.outerHTML.substring(0, 500) + '...'
      });
      
      // First check if this is a sponsored element
      product.sponsored = element.textContent.includes('Sponsored');
      
      // ===== TITLE EXTRACTION =====
      // For desktop view
      const desktopTitleSelectors = [
        '._4rR01T',
        '.s1Q9rs',
        '.IRpwTa',
        '._2WkVRV'
      ];
      
      // For mobile view
      const mobileTitleSelectors = [
        '.css-1qaijid', // Mobile title span
        'a[href*="/p/"] span', // Link title span
        'a[href*="/p/"]', // Fallback to link itself
      ];
      
      // Try desktop selectors first
      for (const selector of desktopTitleSelectors) {
        const titleElement = element.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) {
          product.title = titleElement.textContent.trim();
          break;
        }
      }
      
      // If no title found, try mobile selectors
      if (!product.title) {
        for (const selector of mobileTitleSelectors) {
          const titleElement = element.querySelector(selector);
          if (titleElement && titleElement.textContent.trim()) {
            product.title = titleElement.textContent.trim();
            break;
          }
        }
      }
      
      // If still no title, try getting from image alt text
      if (!product.title) {
        const img = element.querySelector('img');
        if (img && img.alt) {
          product.title = img.alt.trim();
        }
      }
      
      // ===== URL EXTRACTION =====
      // Find any link that looks like a product link
      const linkElement = element.querySelector('a[href*="/p/"]');
      if (linkElement) {
        const href = linkElement.getAttribute('href');
        if (href) {
          // Make sure we have an absolute URL
          if (href.startsWith('http')) {
            product.url = href;
          } else if (href.startsWith('/')) {
            product.url = \`https://www.flipkart.com\${href}\`;
          }
        }
      }
      
      // ===== IMAGE EXTRACTION =====
      // First try to find image in this element
      const imgElement = element.querySelector('img');
      if (imgElement && imgElement.src) {
        product.imageUrl = imgElement.src;
      }
      
      // ===== PRICE EXTRACTION =====
      // Look for price in the HTML - both desktop and mobile patterns
      // Desktop price selectors
      const desktopPriceSelectors = [
        '._30jeq3',
        '._1_WHN1',
        '.a-price-whole',
        '._3I9_wc'
      ];
      
      // Mobile price selectors
      const mobilePriceSelectors = [
        '.css-1rynq56[style*="color:rgba(17,17,18,1.00)"]', // Current price
        '.css-1rynq56[style*="font-family:inter_semi_bold"]', // Bold price
        '.css-1rynq56' // Any text as last resort
      ];
      
      // Try desktop price selectors
      for (const selector of desktopPriceSelectors) {
        const priceElement = element.querySelector(selector);
        if (priceElement && priceElement.textContent.trim()) {
          product.price = priceElement.textContent.trim();
          break;
        }
      }
      
      // If no price found, try mobile selectors
      if (!product.price) {
        for (const selector of mobilePriceSelectors) {
          const elements = element.querySelectorAll(selector);
          for (const el of elements) {
            const text = el.textContent.trim();
            // Look for text that contains the ₹ symbol and isn't a crossed-out price
            if (text.includes('₹') && !el.style.textDecorationLine) {
              product.price = text;
              break;
            }
          }
          if (product.price) break;
        }
      }
      
      // If still no price found, do a more general search for price pattern
      if (!product.price) {
        // Extract text content and find any price pattern
        const text = element.textContent;
        const priceMatch = text.match(/₹\s?[\d,]+/);
        if (priceMatch) {
          product.price = priceMatch[0];
        }
      }
      
      // ===== RATING EXTRACTION =====
      // For mobile view, search for rating pattern in text
      const fullText = element.textContent;
      
      // Look for rating pattern in the element content
      const ratingMatch = fullText.match(/(\d+(\.\d+)?)\s*(?:out of 5 stars|star)/i);
      if (ratingMatch) {
        product.rating = ratingMatch[1];
      }
      
      // Log the extracted product data
      logDebug('Extracted product info', {
        title: product.title,
        price: product.price,
        url: product.url,
        imageUrl: product.imageUrl ? product.imageUrl.substring(0, 100) + '...' : 'none',
        rating: product.rating
      });
      
      return product;
    } catch (error) {
      logDebug('Error extracting product data', { error: error.toString() });
      return null;
    }
  }
`;

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import { ThemedText } from './ThemedText';

interface ProductWebViewProps {
  url: string;
  onProductData: (data: any) => void;
  onError: (error: string) => void;
}

export function ProductWebView({ url, onProductData, onError }: ProductWebViewProps) {
  const webViewRef = useRef<WebView>(null);

  // AI agent script to extract product data
  const extractionScript = `
    (function() {
      try {
        // Function to extract product data based on platform
        function extractProductData() {
          const isAmazon = window.location.hostname.includes('amazon');
          const isFlipkart = window.location.hostname.includes('flipkart');
          
          let products = [];
          
          if (isAmazon) {
            // Extract Amazon products
            const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');
            productElements.forEach(element => {
              try {
                const title = element.querySelector('h2')?.textContent?.trim();
                const priceElement = element.querySelector('.a-price-whole');
                const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : null;
                const imageUrl = element.querySelector('.s-image')?.src;
                const ratingElement = element.querySelector('.a-icon-alt');
                const rating = ratingElement ? parseFloat(ratingElement.textContent.split(' ')[0]) : null;
                const reviewsElement = element.querySelector('.a-size-base.s-underline-text');
                const reviews = reviewsElement ? parseInt(reviewsElement.textContent.replace(/[^0-9]/g, '')) : null;
                
                if (title && price) {
                  products.push({
                    title,
                    price,
                    imageUrl,
                    rating,
                    reviews,
                    platform: 'amazon'
                  });
                }
              } catch (err) {
                console.error('Error extracting product:', err);
              }
            });
          } else if (isFlipkart) {
            // Extract Flipkart products
            const productElements = document.querySelectorAll('div[data-id]._1AtVbE');
            productElements.forEach(element => {
              try {
                const title = element.querySelector('div._4rR01T')?.textContent?.trim();
                const priceElement = element.querySelector('div._30jeq3._1_WHN1');
                const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : null;
                const imageUrl = element.querySelector('img._396cs4')?.src;
                const ratingElement = element.querySelector('div._3LWZlK');
                const rating = ratingElement ? parseFloat(ratingElement.textContent) : null;
                const reviewsElement = element.querySelector('span._2_R_DZ');
                const reviews = reviewsElement ? parseInt(reviewsElement.textContent.replace(/[^0-9]/g, '')) : null;
                
                if (title && price) {
                  products.push({
                    title,
                    price,
                    imageUrl,
                    rating,
                    reviews,
                    platform: 'flipkart'
                  });
                }
              } catch (err) {
                console.error('Error extracting product:', err);
              }
            });
          }
          
          return products;
        }
        
        // Extract data and send it back to React Native
        const products = extractProductData();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PRODUCTS_EXTRACTED',
          data: products
        }));
      } catch (error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          error: error.message
        }));
      }
    })();
  `;

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'PRODUCTS_EXTRACTED') {
        onProductData(message.data);
      } else if (message.type === 'ERROR') {
        onError(message.error);
      }
    } catch (error) {
      onError('Failed to parse message from WebView');
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onMessage={handleMessage}
        onLoadEnd={() => {
          webViewRef.current?.injectJavaScript(extractionScript);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          onError(`WebView error: ${nativeEvent.description}`);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Switch,
  Clipboard,
  Platform,
  Alert,
} from 'react-native';

// Import styles
import { CommonStyles } from '../styles/CommonStyles';
import { DebugStyles } from '../styles/DebugStyles';
import { AmazonSearchScreenStyles } from '../styles/AmazonSearchScreenStyles';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
// Import the new streamlined Amazon search API 
import amazonSearch from '../utils/amazonSearch';

const AmazonSearchScreen = ({ route, navigation }) => {
  const { searchQuery } = route.params || {};
  const webViewRef = useRef(null);
  const [status, setStatus] = useState('Loading Amazon...');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [productsData, setProductsData] = useState(null);
  const [error, setError] = useState(null);
  const [searchComplete, setSearchComplete] = useState(false);
  
  // Debug-related state
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [htmlContent, setHtmlContent] = useState(null);
  const [showDebugModal, setShowDebugModal] = useState(false);

  // Copy text to clipboard function
  const copyToClipboard = (text) => {
    if (!text) return;
    
    Clipboard.setString(text);
    
    // Show feedback based on platform
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', 'Content copied to clipboard!');
    }
  };

  // Helper function to check if a URL is an Amazon search results page
  const isSearchResultsPage = (url) => {
    // Amazon search results usually have /s? in the URL path
    return /\/s\?/i.test(url);
  };

  // Handle WebView navigation state changes
  const handleNavigationStateChange = (navState) => {
    console.log('WebView navigation state changed:', navState.url);
    
    // If the page has finished loading
    if (navState.loading === false && isSearchResultsPage(navState.url)) {
      console.log('On search results page - normal search process continues');
    }
  };

  // Handle messages from the WebView
  const handleMessage = (event) => {
    try {
      if (!event?.nativeEvent?.data) return;
      
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'debug') {
        // Handle debug message
        const timestamp = new Date().toLocaleTimeString();
        const newLog = {
          timestamp,
          message: data.message,
          data: data.data
        };
        
        setDebugLogs(logs => [newLog, ...logs]);
        
        // Handle JSON data for copying
        if (data.data && data.data.type === 'json') {
          setHtmlContent(JSON.stringify(data.data.json, null, 2));
        }
        // Handle HTML content
        else if (data.data && data.data.html) {
          setHtmlContent(data.data.html);
        }
        
        console.log(`[DEBUG] ${data.message}`, data.data || '');
      }
      
      // Handle status updates
      else if (data.type === 'status') {
        setStatus(data.message);
        setProgress(data.progress);
      }
      
      // Handle search results directly (in case they arrive outside of the promise in amazonSearch)
      else if (data.type === 'amazon_search_results' || data.type === 'products') {
        if (!searchComplete && data.products) {
          setProductsData(data.products);
          setStatus('Product data extracted!');
          setProgress(100);
          setIsLoading(false);
          setSearchComplete(true);
          saveProductsToFile(data.products);
        }
      }
      
      // Handle errors
      else if (data.type === 'error') {
        setError(data.message || 'An error occurred during search');
        setStatus(`Error: ${data.message}`);
        setProgress(0);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
      setError('Failed to process data from Amazon');
      setIsLoading(false);
    }
  };

  // Save product data to a file
  const saveProductsToFile = async (products, filePrefix = 'amazon_products') => {
    try {
      const fileName = `${filePrefix}_${new Date().getTime()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(products, null, 2)
      );
      
      console.log(`Products saved to: ${filePath}`);
    } catch (err) {
      console.error('Error saving products to file:', err);
    }
  };

  // Handle WebView load completion
  const handleWebViewLoadEnd = () => {
    // Start the search process once the page has loaded
    setStatus('Amazon loaded, starting search...');
    
    // Use our utility function to search Amazon
    amazonSearch.search({
      query: searchQuery,
      maxResults: 10,
      webViewRef: webViewRef,
      onProgress: (message, progressValue) => {
        setStatus(message);
        setProgress(progressValue);
      }
    })
      .then(products => {
        // This will be called when the search completes and products are ready
        setProductsData(products);
        setStatus('Product data extracted!');
        setProgress(100);
        setIsLoading(false);
        setSearchComplete(true);
        
        // Save the data to a file
        saveProductsToFile(products);
      })
      .catch(err => {
        // Only set error if we haven't already handled it via message event
        if (!error) {
          setError(err.message);
          setStatus(`Error: ${err.message}`);
          setProgress(0);
          setIsLoading(false);
        }
      });
  };

  // Render debug logs item
  const renderDebugItem = (log, index) => {
    return (
      <View key={index} style={DebugStyles.debugItem}>
        <Text style={DebugStyles.debugTimestamp}>{log.timestamp}</Text>
        <Text style={DebugStyles.debugMessage}>{log.message}</Text>
        {log.data && (
          <View style={DebugStyles.debugItemActions}>
            <TouchableOpacity 
              onPress={() => {
                setHtmlContent(log.data.html || JSON.stringify(log.data, null, 2));
                setShowDebugModal(true);
              }}
              style={DebugStyles.viewDataButton}
            >
              <Text style={DebugStyles.viewDataButtonText}>View Data</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                copyToClipboard(log.data.html || JSON.stringify(log.data, null, 2));
              }}
              style={DebugStyles.copyDataButton}
            >
              <Text style={DebugStyles.copyDataButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={CommonStyles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={CommonStyles.header}>
        <TouchableOpacity
          style={CommonStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={CommonStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={CommonStyles.headerTitle}>Amazon Search</Text>
        
        {/* Debug Switch */}
        <View style={DebugStyles.debugSwitchContainer}>
          <Text style={DebugStyles.debugSwitchLabel}>Debug</Text>
          <Switch
            value={showDebug}
            onValueChange={setShowDebug}
            trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
            thumbColor={showDebug ? '#2196F3' : '#f4f3f4'}
          />
        </View>
      </View>
      
      {/* Main Content Area - Either WebView, Results, or Debug Console */}
      {!showDebug ? (
        <>
          {/* WebView - Shown during initial search */}
          {!searchComplete && (
            <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            source={{ uri: amazonSearch.getUrl(searchQuery) }}
            style={CommonStyles.webview}
            onMessage={(event) => {
              // This ensures all messages are processed by our handleMessage function
              // which updates debug logs and state even while the search is active
              handleMessage(event);
            }}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadEnd={handleWebViewLoadEnd}
            onError={(e) => {
              setError(`WebView error: ${e.nativeEvent.description}`);
              setIsLoading(false);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
            </View>
          )}
          
          {/* Results View - Shown after search is complete and not in debug mode */}
          {searchComplete && productsData && (
            <View style={{flex: 1}}>
              <ScrollView style={AmazonSearchScreenStyles.resultsView}>
                <View style={AmazonSearchScreenStyles.resultsHeader}>
                  <Text style={AmazonSearchScreenStyles.resultsTitle}>Search Results</Text>
                  <Text style={AmazonSearchScreenStyles.resultsSubtitle}>
                    Found {productsData.length} products for "{searchQuery}"
                  </Text>
                  
                  {/* Copy Results Button */}
                  <TouchableOpacity 
                    style={AmazonSearchScreenStyles.copyResultsButton}
                    onPress={() => copyToClipboard(JSON.stringify(productsData, null, 2))}
                  >
                    <Text style={AmazonSearchScreenStyles.copyResultsButtonText}>Copy JSON</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={AmazonSearchScreenStyles.jsonData}>
                  {JSON.stringify(productsData, null, 2)}
                </Text>
              </ScrollView>
            </View>
          )}
        </>
      ) : (
        /* Debug Console - Full screen when debug is enabled */
        <View style={DebugStyles.debugConsoleFullScreen}>
          <View style={DebugStyles.debugHeader}>
            <Text style={DebugStyles.debugTitle}>Debug Console</Text>
            <View style={DebugStyles.debugActions}>
              <TouchableOpacity 
                style={DebugStyles.clearButton}
                onPress={() => setDebugLogs([])}
              >
                <Text style={DebugStyles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={DebugStyles.debugLogs}>
            {debugLogs.length > 0 ? (
              debugLogs.map(renderDebugItem)
            ) : (
              <Text style={DebugStyles.noLogsText}>No logs yet. Waiting for debug data...</Text>
            )}
          </ScrollView>
        </View>
      )}
      
      {/* Progress Overlay - Only visible while loading */}
      {isLoading && (
        <View style={CommonStyles.overlay}>
          <View style={CommonStyles.progressContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={CommonStyles.statusText}>{status}</Text>
            <View style={CommonStyles.progressBarContainer}>
              <View 
                style={[CommonStyles.progressBar, { width: `${progress}%` }]} 
              />
            </View>
            <Text style={CommonStyles.progressText}>{progress}%</Text>
          </View>
        </View>
      )}
      
      {/* Enhanced Debug Data Modal - Full Screen */}
      <Modal
        visible={showDebugModal}
        animationType="slide"
        onRequestClose={() => setShowDebugModal(false)}
      >
        <SafeAreaView style={DebugStyles.debugModalContainer}>
          <View style={DebugStyles.debugModalHeader}>
            <Text style={DebugStyles.debugModalTitle}>Debug Data</Text>
            <View style={DebugStyles.debugModalActions}>
              <TouchableOpacity
                style={DebugStyles.copyButton}
                onPress={() => copyToClipboard(htmlContent)}
              >
                <Text style={DebugStyles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDebugModal(false)}
                style={DebugStyles.closeButton}
              >
                <Text style={DebugStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={DebugStyles.debugDataContainer}>
            {htmlContent && htmlContent.includes('<') ? (
              <Text style={DebugStyles.htmlContent}>{htmlContent}</Text>
            ) : htmlContent ? (
              <Text style={DebugStyles.jsonContent}>{htmlContent}</Text>
            ) : (
              <Text style={DebugStyles.noContentText}>No content to display</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {/* Error Display */}
      {error && !isLoading && (
        <View style={CommonStyles.errorContainer}>
          <Text style={CommonStyles.errorTitle}>Error</Text>
          <Text style={CommonStyles.errorText}>{error}</Text>
          <TouchableOpacity
            style={CommonStyles.buttonPrimary}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              setSearchComplete(false);
              webViewRef.current?.reload();
            }}
          >
            <Text style={CommonStyles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AmazonSearchScreen;

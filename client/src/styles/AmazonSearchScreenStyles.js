import { StyleSheet } from 'react-native';

export const AmazonSearchScreenStyles = StyleSheet.create({
  // Results view styles
  resultsView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  resultsHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  copyResultsButton: {
    backgroundColor: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  copyResultsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  jsonData: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    marginBottom: 50,
  },
  
  // Product detail specific styles
  productDetailButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productDetailButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productDetailProgressContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  productDetailProgressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  productDetailProgressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  productDetailProgressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  
  // Tab navigation for basic/detailed results
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

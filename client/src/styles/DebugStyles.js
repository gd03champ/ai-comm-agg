import { StyleSheet } from 'react-native';

export const DebugStyles = StyleSheet.create({
  // Debug switch styles
  debugSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugSwitchLabel: {
    marginRight: 5,
    fontSize: 14,
    color: '#555',
  },

  // Debug console styles - Full screen version
  debugConsoleFullScreen: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e6e6e6',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  debugTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  debugActions: {
    flexDirection: 'row',
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#666',
  },
  debugLogs: {
    flex: 1,
    padding: 10,
  },
  debugItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  debugTimestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  debugMessage: {
    fontSize: 14,
    color: '#333',
  },
  debugItemActions: {
    flexDirection: 'row',
    marginTop: 5,
  },
  viewDataButton: {
    backgroundColor: '#ddf',
    padding: 5,
    borderRadius: 4,
    marginRight: 8,
  },
  viewDataButtonText: {
    color: '#338',
    fontSize: 12,
  },
  copyDataButton: {
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 4,
  },
  copyDataButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  noLogsText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },

  // Debug modal styles for full screen display
  debugModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  debugModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f0f0f0',
  },
  debugModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  debugModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  copyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  debugDataContainer: {
    flex: 1,
    padding: 15,
  },
  htmlContent: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  jsonContent: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  noContentText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

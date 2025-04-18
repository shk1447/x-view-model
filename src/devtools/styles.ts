export const styles = {
  devTools: {
    position: 'fixed' as const,
    bottom: 0,
    right: 0,
    width: '300px',
    height: '400px',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: '10px',
    boxSizing: 'border-box' as const,
    fontFamily: 'monospace',
    fontSize: '12px',
    overflow: 'auto',
    zIndex: 9999,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: '1px solid #333',
  },
  title: {
    margin: 0,
    fontSize: '14px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
  },
  section: {
    marginBottom: '15px',
  },
  sectionTitle: {
    margin: '0 0 5px 0',
    fontSize: '12px',
    color: '#888',
  },
  state: {
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  },
  components: {
    maxHeight: '100px',
    overflow: 'auto',
    backgroundColor: '#2a2a2a',
    padding: '5px',
    borderRadius: '3px',
  },
  component: {
    padding: '3px',
    borderBottom: '1px solid #333',
    fontSize: '11px',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
  },
  metric: {
    padding: '5px',
    backgroundColor: '#2a2a2a',
    borderRadius: '3px',
  },
  history: {
    maxHeight: '150px',
    overflow: 'auto',
  },
  historyItem: {
    padding: '5px',
    borderBottom: '1px solid #333',
    fontSize: '11px',
  },
}; 
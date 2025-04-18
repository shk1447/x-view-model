import React from 'react';
import { useDevTools } from './useDevTools';
import { styles } from './styles';
import { DevToolsHandler } from '../core/handler/DevToolsHandler';

interface DevToolsProps {
  devTools: DevToolsHandler;
}

export const DevTools: React.FC<DevToolsProps> = ({ devTools }) => {
  const { isOpen, toggleDevTools } = useDevTools();

  if (!isOpen) return null;

  const components = devTools.getComponents();
  const history = devTools.getHistory();
  const updates = devTools.getUpdates();

  return (
    <div style={styles.devTools}>
      <div style={styles.header}>
        <h3 style={styles.title}>x-view-model DevTools</h3>
        <button style={styles.closeButton} onClick={toggleDevTools}>
          ×
        </button>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Components ({components.length})</h4>
        <div style={styles.components}>
          {components.map((componentId: string) => (
            <div key={componentId} style={styles.component}>
              {componentId}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Metrics</h4>
        <div style={styles.metrics}>
          <div style={styles.metric}>
            <div>Updates: {updates}</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>History</h4>
        <div style={styles.history}>
          {history.map((item: any, index: number) => (
            <div key={index} style={styles.historyItem}>
              {item.type}: {JSON.stringify(item.payload)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 
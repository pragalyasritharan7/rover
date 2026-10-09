import React, { useState, useEffect, useCallback } from 'react';
import type { BackendHealthResponse } from '../types/mission';

interface BackendHealthIndicatorProps {
  apiBaseUrl?: string;
  onSyncTelemetry?: (data: unknown) => void;
}

export const BackendHealthIndicator: React.FC<BackendHealthIndicatorProps> = ({
  apiBaseUrl = 'http://127.0.0.1:8000',
  onSyncTelemetry,
}) => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: BackendHealthResponse = await response.json();
      setHealth(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      setHealth(null);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const syncStateFromBackend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/mission/initial-state`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      onSyncTelemetry?.(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Telemetry sync failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBaseUrl}/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: BackendHealthResponse) => {
        if (!cancelled) {
          setHealth(data);
          setLastChecked(new Date().toLocaleTimeString());
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setHealth(null);
          setError(err instanceof Error ? err.message : 'Connection failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  return (
    <div className="telemetry-card">
      <div className="card-header">
        <span className="card-title">BACKEND SYSTEM TELEMETRY</span>
        <button
          className="btn-refresh"
          onClick={checkHealth}
          disabled={loading}
          title="Ping FastAPI /health endpoint"
        >
          {loading ? 'PINGING...' : 'PING HEALTH'}
        </button>
      </div>

      <div className="health-status-row">
        <div className="status-indicator">
          <span
            className={`status-dot ${
              health?.status === 'ok' ? 'status-online' : 'status-offline'
            }`}
          />
          <span className="status-label">
            {health?.status === 'ok' ? 'FASTAPI ONLINE' : 'DISCONNECTED'}
          </span>
        </div>
        <span className="timestamp">
          {lastChecked ? `Checked ${lastChecked}` : 'Connecting...'}
        </span>
      </div>

      {health ? (
        <div className="health-details">
          <div className="detail-item">
            <span className="detail-key">Service:</span>
            <span className="detail-val">{health.service}</span>
          </div>
          <div className="detail-item">
            <span className="detail-key">Version:</span>
            <span className="detail-val">v{health.version}</span>
          </div>
          <div className="detail-item">
            <span className="detail-key">Endpoint:</span>
            <span className="detail-val code-text">{apiBaseUrl}/health</span>
          </div>
          {onSyncTelemetry && (
            <button
              className="btn-sync"
              onClick={syncStateFromBackend}
              disabled={loading}
            >
              Sync Mission State from Backend
            </button>
          )}
        </div>
      ) : (
        <div className="health-error-box">
          <p className="error-msg">⚠️ Unable to reach FastAPI backend.</p>
          <p className="hint-msg">
            Verify the server is running on <code>http://127.0.0.1:8000</code>.
          </p>
          {error && <p className="raw-err">Details: {error}</p>}
        </div>
      )}
    </div>
  );
};

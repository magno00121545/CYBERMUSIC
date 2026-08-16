import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.js';
import { AppNotification } from '../types/index.js';

interface RealtimeContextType {
  isConnected: boolean;
  lastCatalogUpdate: number;
  notifications: AppNotification[];
  triggerCatalogRefresh: () => void;
  toastMessage: { title: string; message: string; type?: string } | null;
  clearToast: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastCatalogUpdate, setLastCatalogUpdate] = useState<number>(Date.now());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type?: string } | null>(null);

  const showToast = useCallback((title: string, message: string, type = 'info') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.title === title ? null : prev));
    }, 6000);
  }, []);

  const triggerCatalogRefresh = useCallback(() => {
    setLastCatalogUpdate(Date.now());
  }, []);

  useEffect(() => {
    const url = user ? `/api/events?userId=${user.id}` : '/api/events';
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.addEventListener('CONNECTED', (e: any) => {
          setIsConnected(true);
        });

        // Catalog updated in real-time by admin
        eventSource.addEventListener('CATALOG_UPDATED', (e: any) => {
          try {
            const data = JSON.parse(e.data);
            setLastCatalogUpdate(Date.now());
            if (data.action === 'PACKAGE_CREATED') {
              showToast('🔥 Novo Pacote Disponível!', `O pacote "${data.title || 'Exclusivo'}" acaba de ser publicado no catálogo.`, 'success');
            } else if (data.action === 'PACKAGE_UPDATED') {
              showToast('⚡ Catálogo Atualizado!', `O pacote "${data.title}" foi atualizado pelo produtor.`, 'info');
            }
          } catch {}
        });

        // Instant payment confirmation event
        eventSource.addEventListener('PAYMENT_SUCCESS', (e: any) => {
          try {
            const data = JSON.parse(e.data);
            showToast('🎉 Pagamento PIX Confirmado!', `Seu pedido #${data.orderNumber} foi aprovado. Download liberado em "Minhas Compras"!`, 'success');
            setLastCatalogUpdate(Date.now());
          } catch {}
        });

        // Global Push Notifications from Admin
        eventSource.addEventListener('GLOBAL_NOTIFICATION', (e: any) => {
          try {
            const data = JSON.parse(e.data);
            showToast(data.title, data.message, data.type === 'PROMO' ? 'promo' : 'info');
            setNotifications(prev => [data, ...prev]);
          } catch {}
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Auto reconnect in 5 seconds
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.warn('SSE connection failed:', err);
      }
    };

    connectSSE();

    return () => {
      clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user, showToast]);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        lastCatalogUpdate,
        notifications,
        triggerCatalogRefresh,
        toastMessage,
        clearToast: () => setToastMessage(null),
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within a RealtimeProvider');
  return context;
};

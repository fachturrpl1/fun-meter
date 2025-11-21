// components/providers/WsProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { ws, setWsBase } from "@/lib/ws";
import { CONFIG } from "@/lib/config";
import io from "socket.io-client";

type IOSocket = ReturnType<typeof io>;

interface WsWrapper {
  socket: IOSocket;
  on: (ev: string, fn: (...args: unknown[]) => void) => void;
  off: (ev: string, fn: (...args: unknown[]) => void) => void;
  once: (ev: string, fn: (...args: unknown[]) => void) => void;
  emit: (ev: string, payload?: unknown) => void;
  emitAck: (ev: string, payload?: unknown, timeoutMs?: number) => Promise<unknown>;
  release: () => void;
  close: () => void;
}

const WsContext = createContext<WsWrapper | null>(null);

interface WsProviderProps {
  children: ReactNode;
}

interface WsState {
  sockRoot: WsWrapper | null;
  isInitialized: boolean;
}

export function WsProvider({ children }: WsProviderProps) {
  const [state, setState] = useState<WsState>({
    sockRoot: null,
    isInitialized: false,
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only initialize on client side and only once
    if (typeof window === "undefined" || initializedRef.current) return;
    
    initializedRef.current = true;
    
    // Configure WS base and create a persistent root socket
    setWsBase(CONFIG.WS_API);
    const SockRoot = ws("", { autoReconnect: true, autoRelease: false });
    
    // Use setTimeout to defer state update and avoid direct setState in effect
    const timeoutId = setTimeout(() => {
      setState(prevState => ({ ...prevState, sockRoot: SockRoot, isInitialized: true }));
    }, 0);
    
    console.log("[WS_PROVIDER] WebSocket initialized:", CONFIG.WS_API);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup on unmount
      if (SockRoot) {
        console.log("[WS_PROVIDER] Closing WebSocket connection");
        SockRoot.close();
      }
    };
  }, []);

  return (
    <WsContext.Provider value={state.sockRoot}>
      {children}
    </WsContext.Provider>
  );
}

export function useWsRoot(): WsWrapper | null {
  return useContext(WsContext);
}

// Hook untuk membuat koneksi WS baru atau menggunakan root
interface UseWsOptions {
  url?: string;
  on?: Record<string, (...args: unknown[]) => void>;
  opts?: Record<string, unknown>;
  root?: boolean;
}

export function useWs(options: UseWsOptions = {}): WsWrapper | null {
  const { url, on = {}, opts = {}, root = false } = options;
  const sockRoot = useWsRoot();
  const [sock, setSock] = useState<WsWrapper | null>(null);

  // Store event handlers in ref, but update it in useEffect to avoid render-time updates
  const eventHandlersRef = useRef(on);

  useEffect(() => {
    // Update event handlers ref in effect, not during render
    eventHandlersRef.current = on;
    
    const newSock = root && sockRoot ? sockRoot : ws(url || "", { opts });
    
    // Use setTimeout to defer state update
    const timeoutId = setTimeout(() => {
      setSock(newSock);
    }, 0);

    // Bind events yang diminta komponen ini
    const currentHandlers = eventHandlersRef.current;
    for (const [ev, fn] of Object.entries(currentHandlers)) {
      newSock?.on(ev, fn);
    }

    return () => {
      clearTimeout(timeoutId);
      // Cleanup
      if (root && sockRoot) {
        // Kalau root: cukup lepas event yang halaman ini pasang
        for (const [ev, fn] of Object.entries(currentHandlers)) {
          newSock?.off(ev, fn);
        }
      } else {
        // Kalau halaman sendiri: release ref (pool akan nutup kalau ref=0)
        newSock?.release();
      }
    };
  }, [url, root, sockRoot, opts, on]);

  return sock;
}
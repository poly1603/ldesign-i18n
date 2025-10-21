/**
 * Real-time Translation Synchronization
 * WebSocket-based real-time sync for collaborative translation editing
 */
import { EventEmitter } from 'node:events';
interface SyncConfig {
    url: string;
    autoReconnect: boolean;
    reconnectDelay: number;
    heartbeatInterval: number;
    maxReconnectAttempts: number;
    enableOfflineQueue: boolean;
    conflictResolution: 'latest' | 'merge' | 'manual';
}
interface TranslationUpdate {
    id: string;
    locale: string;
    key: string;
    value: string;
    oldValue?: string;
    timestamp: number;
    userId: string;
    userName?: string;
    version: number;
    checksum?: string;
}
interface SyncState {
    connected: boolean;
    syncing: boolean;
    lastSync: number;
    pendingUpdates: number;
    conflicts: number;
    peers: Map<string, PeerInfo>;
}
interface PeerInfo {
    id: string;
    name: string;
    locale?: string;
    activeKeys: Set<string>;
    lastSeen: number;
    cursor?: CursorPosition;
}
interface CursorPosition {
    key: string;
    position: number;
    selection?: {
        start: number;
        end: number;
    };
}
interface Conflict {
    key: string;
    locale: string;
    local: TranslationUpdate;
    remote: TranslationUpdate;
    resolution?: 'local' | 'remote' | 'merged';
    mergedValue?: string;
}
interface OperationalTransform {
    type: 'insert' | 'delete' | 'replace';
    position: number;
    content?: string;
    length?: number;
    version: number;
}
export declare class RealtimeSync extends EventEmitter {
    private config;
    private ws;
    private state;
    private reconnectAttempts;
    private reconnectTimer;
    private heartbeatTimer;
    private offlineQueue;
    private versionMap;
    private conflictQueue;
    private transformQueue;
    private localUserId;
    private localUserName;
    private maxQueueSize;
    private maxTransformQueueSize;
    constructor(config?: Partial<SyncConfig>);
    connect(): Promise<void>;
    disconnect(): void;
    private handleConnect;
    private handleDisconnect;
    private handleError;
    private handleMessage;
    private handleRemoteUpdate;
    private handlePeerJoin;
    private handlePeerLeave;
    private handlePeerCursor;
    private handleSyncRequest;
    private handleSyncResponse;
    private handleConflict;
    private handleTransform;
    updateTranslation(locale: string, key: string, value: string, oldValue?: string): void;
    broadcastCursor(key: string, position: number, selection?: {
        start: number;
        end: number;
    }): void;
    requestSync(keys?: string[], locale?: string, since?: number): void;
    private detectAndResolveConflict;
    private autoResolveConflict;
    private mergeTranslations;
    private applyConflictResolution;
    private applyUpdate;
    private applyTransform;
    private gatherLocalTranslations;
    private getLocalTranslation;
    private flushOfflineQueue;
    private scheduleReconnect;
    private startHeartbeat;
    private send;
    private generateUserId;
    private generateUpdateId;
    private getNextVersion;
    private calculateChecksum;
    getState(): SyncState;
    getPeers(): PeerInfo[];
    getConflicts(): Conflict[];
    resolveConflict(conflict: Conflict, resolution: 'local' | 'remote' | 'merged', mergedValue?: string): void;
    setUserInfo(userId: string, userName: string): void;
    lockTranslation(locale: string, key: string): void;
    unlockTranslation(locale: string, key: string): void;
    sendComment(locale: string, key: string, comment: string): void;
    destroy(): void;
}
export declare const realtimeSync: RealtimeSync;
export type { Conflict, CursorPosition, OperationalTransform, PeerInfo, SyncConfig, SyncState, TranslationUpdate };

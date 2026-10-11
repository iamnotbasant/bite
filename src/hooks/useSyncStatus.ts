import { useEffect, useState } from 'react';
import { loadSyncState, subscribeSync, type SyncState } from '../utils/syncEngine';

export function useSyncStatus(): SyncState {
  const [state, setState] = useState<SyncState>(() => loadSyncState());
  useEffect(() => subscribeSync(setState), []);
  return state;
}

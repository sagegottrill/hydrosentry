import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Alert } from '@/types/hydrosentry';
import { mapAlertsTableRowToAlert, type AlertsTableRow } from '@/lib/alertsTableMapping';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const FIELD_ALERTS_HYDRATE_LIMIT = 40;

/**
 * If the user submitted a warden report while the dashboard was unmounted, Realtime
 * will not have delivered the INSERT. Pull recent `field` rows once on mount.
 */
function useFieldWardenAlertsHydrate(setAlerts: Dispatch<SetStateAction<Alert[]>>) {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let cancelled = false;

    void (async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('alert_source', 'field')
        .order('created_at', { ascending: false })
        .limit(FIELD_ALERTS_HYDRATE_LIMIT);

      if (cancelled || error || !data?.length) return;

      setAlerts((prev) => {
        const ids = new Set(prev.map((a) => a.id));
        const fresh: Alert[] = [];
        for (const row of data) {
          try {
            const alert = mapAlertsTableRowToAlert(row as AlertsTableRow);
            if (!ids.has(alert.id)) {
              ids.add(alert.id);
              fresh.push(alert);
            }
          } catch {
            /* skip bad rows */
          }
        }
        if (fresh.length === 0) return prev;
        return [...fresh, ...prev];
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [setAlerts]);
}

/**
 * Prepends new `alerts` table rows onto ops state for the Action Dispatcher feed.
 * State is owned by `useAlerts` on the dashboard (same hook the dispatcher reads).
 */
export function useOpsAlertsRealtimePrepend(setAlerts: Dispatch<SetStateAction<Alert[]>>) {
  useFieldWardenAlertsHydrate(setAlerts);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('hydrosentry-alerts-dispatch')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          const row = payload.new as AlertsTableRow;
          if (!row?.id) return;
          try {
            const alert = mapAlertsTableRowToAlert(row);
            setAlerts((prev) => {
              if (prev.some((a) => a.id === alert.id)) return prev;
              return [alert, ...prev];
            });
          } catch {
            /* ignore malformed payloads */
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [setAlerts]);
}

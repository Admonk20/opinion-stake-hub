import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useRealtimeUpdates = () => {
  const [realtimeData, setRealtimeData] = useState({
    markets: null,
    trades: null,
    prices: null,
  });

  useEffect(() => {
    // Subscribe to market updates
    const marketsChannel = supabase
      .channel('markets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'markets'
        },
        (payload) => {
          console.log('Market update:', payload);
          setRealtimeData(prev => ({
            ...prev,
            markets: payload
          }));
        }
      )
      .subscribe();

    // Subscribe to trade updates
    const tradesChannel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades'
        },
        (payload) => {
          console.log('New trade:', payload);
          setRealtimeData(prev => ({
            ...prev,
            trades: payload
          }));
        }
      )
      .subscribe();

    // Subscribe to price updates
    const pricesChannel = supabase
      .channel('prices-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_outcomes'
        },
        (payload) => {
          console.log('Price update:', payload);
          setRealtimeData(prev => ({
            ...prev,
            prices: payload
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(marketsChannel);
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(pricesChannel);
    };
  }, []);

  return realtimeData;
};
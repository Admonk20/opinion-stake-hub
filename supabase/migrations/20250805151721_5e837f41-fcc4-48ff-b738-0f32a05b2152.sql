-- Enable realtime for markets and market_outcomes tables
ALTER PUBLICATION supabase_realtime ADD TABLE markets;
ALTER PUBLICATION supabase_realtime ADD TABLE market_outcomes;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
ALTER PUBLICATION supabase_realtime ADD TABLE user_balances;

-- Set replica identity to full for real-time updates
ALTER TABLE markets REPLICA IDENTITY FULL;
ALTER TABLE market_outcomes REPLICA IDENTITY FULL;
ALTER TABLE trades REPLICA IDENTITY FULL;
ALTER TABLE user_balances REPLICA IDENTITY FULL;
-- trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column_websites()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on any update to the websites table
CREATE TRIGGER set_updated_at_websites
BEFORE UPDATE ON websites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column_websites();
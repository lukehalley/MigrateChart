#!/usr/bin/env python3
"""
Upload Holder Snapshots to Supabase

Reads the holder_backfill_data.json file and inserts all records
into the holder_snapshots table in Supabase.
"""

import json
import os

# Configuration
PROJECT_ID = "49fd8ab1-e85b-445f-9f92-defa0d46363a"
TOKEN_ADDRESS = "8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA"
INPUT_FILE = "output/holder_backfill_data.json"


def generate_insert_sql(data_records):
    """Generate SQL INSERT statement for all records"""

    values = []
    for record in data_records:
        timestamp = record['timestamp']
        holder_count = record['holder_count']

        # Escape single quotes in strings
        project_id_escaped = PROJECT_ID.replace("'", "''")
        token_address_escaped = TOKEN_ADDRESS.replace("'", "''")

        values.append(
            f"('{project_id_escaped}', '{token_address_escaped}', {holder_count}, {timestamp})"
        )

    # Join all values
    values_sql = ",\n  ".join(values)

    # Create full INSERT statement with ON CONFLICT to skip duplicates
    sql = f"""INSERT INTO holder_snapshots (project_id, token_address, holder_count, timestamp)
VALUES
  {values_sql}
ON CONFLICT (project_id, token_address, timestamp) DO NOTHING;"""

    return sql


def main():
    """Main execution"""
    print("\n" + "="*70)
    print("UPLOAD HOLDER SNAPSHOTS TO SUPABASE")
    print("="*70 + "\n")

    # Load the JSON data
    print(f"Loading data from: {INPUT_FILE}")

    if not os.path.exists(INPUT_FILE):
        print(f"✗ Error: File not found: {INPUT_FILE}")
        print("  Please run telegram_holder_backfill.py first.")
        return

    with open(INPUT_FILE, 'r') as f:
        backfill_data = json.load(f)

    records = backfill_data['data']
    print(f"✓ Loaded {len(records)} records")
    print(f"  Date range: {backfill_data['date_range']['start']} to {backfill_data['date_range']['end']}\n")

    # Generate SQL
    print("Generating SQL INSERT statement...")
    sql = generate_insert_sql(records)

    # Save to file
    sql_file = "output/insert_holder_snapshots.sql"
    with open(sql_file, 'w') as f:
        f.write(sql)

    print(f"✓ SQL saved to: {sql_file}")
    print(f"  Total records: {len(records)}")
    print(f"  Table: holder_snapshots")
    print(f"  Project ID: {PROJECT_ID}")
    print(f"  Token Address: {TOKEN_ADDRESS}\n")

    print("="*70)
    print("SQL PREVIEW (first 10 records):")
    print("="*70)
    preview_sql = generate_insert_sql(records[:10])
    print(preview_sql)
    print("...")
    print("="*70)

    print("\nTo insert into Supabase, run this SQL query in your database:")
    print(f"  cat {sql_file}\n")
    print("Or copy the SQL and execute it via Supabase dashboard or psql.")
    print("="*70 + "\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()

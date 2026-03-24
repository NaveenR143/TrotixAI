#!/bin/bash
# run_migrations.sh
# Run all migrations in order against your PostgreSQL database.
#
# Usage:
#   chmod +x run_migrations.sh
#   ./run_migrations.sh
#
# Or with a custom database URL:
#   DATABASE_URL=postgresql://user:pass@host:5432/dbname ./run_migrations.sh

set -e  # exit on first error

DB_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/trotixai"}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TrotixAI — PostgreSQL Migration Runner"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Target: $DB_URL"
echo ""

# Create DB if it doesn't exist
psql "${DB_URL%/*}" -c "CREATE DATABASE trotixai;" 2>/dev/null || true

MIGRATIONS=(
    "001_extensions_and_enums.sql"
    "002_users_and_companies.sql"
    "003_jobseeker_profiles_and_resumes.sql"
    "004_jobs_and_applications.sql"
    "005_ai_features_and_credits.sql"
    "006_payments_and_notifications.sql"
    "007_functions_and_triggers.sql"
)

for file in "${MIGRATIONS[@]}"; do
    echo "▶  Running $file ..."
    psql "$DB_URL" -f "migrations/$file"
    echo "✓  $file done"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ All migrations completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

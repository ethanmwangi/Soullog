#!/usr/bin/env bash
# Exit on error
set -o errexit

# -- Install Python Dependencies --
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# -- Install Node.js Dependencies and Build React App --
echo "Installing Node.js dependencies and building React app..."
cd Frontend
npm install
npm run build -- --output-path=../_build # Specify output path
cd ..

# -- Collect Static Files and Run Migrations --
echo "Collecting static files and running database migrations..."
python backend/manage.py collectstatic --no-input
python backend/manage.py migrate

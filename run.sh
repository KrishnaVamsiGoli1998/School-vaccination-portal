#!/bin/bash

# Function to display help message
show_help() {
  echo "School Vaccination Portal - Run Script"
  echo ""
  echo "Usage: ./run.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start       Start the application using Docker Compose"
  echo "  stop        Stop the application"
  echo "  restart     Restart the application"
  echo "  logs        Show logs from all containers"
  echo "  server-logs Show logs from the server container"
  echo "  client-logs Show logs from the client container"
  echo "  db-logs     Show logs from the database container"
  echo "  setup-db    Initialize the database with sample data"
  echo "  help        Show this help message"
  echo ""
}

# Check if Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker and Docker Compose before running this script"
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed or not in PATH"
    echo "Please install Docker Compose before running this script"
    exit 1
  fi
}

# Start the application
start_app() {
  echo "Starting School Vaccination Portal..."
  docker-compose up -d
  echo "Application started!"
  echo "Client: http://localhost:3000"
  echo "Server: http://localhost:5000"
}

# Stop the application
stop_app() {
  echo "Stopping School Vaccination Portal..."
  docker-compose down
  echo "Application stopped!"
}

# Restart the application
restart_app() {
  echo "Restarting School Vaccination Portal..."
  docker-compose restart
  echo "Application restarted!"
}

# Show logs from all containers
show_logs() {
  docker-compose logs -f
}

# Show logs from the server container
show_server_logs() {
  docker-compose logs -f server
}

# Show logs from the client container
show_client_logs() {
  docker-compose logs -f client
}

# Show logs from the database container
show_db_logs() {
  docker-compose logs -f postgres
}

# Initialize the database with sample data
setup_db() {
  echo "Setting up the database..."
  docker-compose exec postgres psql -U postgres -d vaccination_portal -f /docker-entrypoint-initdb.d/db_setup.sql
  echo "Database setup complete!"
}

# Main script logic
check_docker

case "$1" in
  start)
    start_app
    ;;
  stop)
    stop_app
    ;;
  restart)
    restart_app
    ;;
  logs)
    show_logs
    ;;
  server-logs)
    show_server_logs
    ;;
  client-logs)
    show_client_logs
    ;;
  db-logs)
    show_db_logs
    ;;
  setup-db)
    setup_db
    ;;
  help|*)
    show_help
    ;;
esac
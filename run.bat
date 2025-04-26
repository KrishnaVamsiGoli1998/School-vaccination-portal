@echo off
setlocal

REM Function to display help message
:show_help
echo School Vaccination Portal - Run Script
echo.
echo Usage: run.bat [command]
echo.
echo Commands:
echo   start       Start the application using Docker Compose
echo   stop        Stop the application
echo   restart     Restart the application
echo   logs        Show logs from all containers
echo   server-logs Show logs from the server container
echo   client-logs Show logs from the client container
echo   db-logs     Show logs from the database container
echo   setup-db    Initialize the database with sample data
echo   help        Show this help message
echo.
goto :eof

REM Check if Docker is installed
:check_docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Docker is not installed or not in PATH
  echo Please install Docker and Docker Compose before running this script
  exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Docker Compose is not installed or not in PATH
  echo Please install Docker Compose before running this script
  exit /b 1
)
goto :eof

REM Start the application
:start_app
echo Starting School Vaccination Portal...
docker-compose up -d
echo Application started!
echo Client: http://localhost:3000
echo Server: http://localhost:5000
goto :eof

REM Stop the application
:stop_app
echo Stopping School Vaccination Portal...
docker-compose down
echo Application stopped!
goto :eof

REM Restart the application
:restart_app
echo Restarting School Vaccination Portal...
docker-compose restart
echo Application restarted!
goto :eof

REM Show logs from all containers
:show_logs
docker-compose logs -f
goto :eof

REM Show logs from the server container
:show_server_logs
docker-compose logs -f server
goto :eof

REM Show logs from the client container
:show_client_logs
docker-compose logs -f client
goto :eof

REM Show logs from the database container
:show_db_logs
docker-compose logs -f postgres
goto :eof

REM Initialize the database with sample data
:setup_db
echo Setting up the database...
docker-compose exec postgres psql -U postgres -d vaccination_portal -f /docker-entrypoint-initdb.d/db_setup.sql
echo Database setup complete!
goto :eof

REM Main script logic
call :check_docker

if "%1"=="" goto show_help
if "%1"=="help" goto show_help
if "%1"=="start" goto start_app
if "%1"=="stop" goto stop_app
if "%1"=="restart" goto restart_app
if "%1"=="logs" goto show_logs
if "%1"=="server-logs" goto show_server_logs
if "%1"=="client-logs" goto show_client_logs
if "%1"=="db-logs" goto show_db_logs
if "%1"=="setup-db" goto setup_db

goto show_help
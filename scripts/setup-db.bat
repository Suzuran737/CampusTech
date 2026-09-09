@echo off
setlocal EnableExtensions

REM CampusTech database setup
REM Usage: scripts\setup-db.bat
REM Requires: backend\.env with DATABASE_URL configured

set "ROOT=%~dp0.."
set "BACKEND=%ROOT%\backend"
set "ENV_FILE=%BACKEND%\.env"
set "PSQL=D:\PostgreSQL17\bin\psql.exe"
set "SCRIPT_DIR=%~dp0"

if not exist "%ENV_FILE%" (
  echo [ERROR] Missing backend\.env
  echo Copy backend\.env.example to backend\.env and set DATABASE_URL first.
  exit /b 1
)

if not exist "%PSQL%" (
  echo [ERROR] psql not found at %PSQL%
  echo Update PSQL path in scripts\setup-db.bat if needed.
  exit /b 1
)

set "NPM_CONFIG_CACHE=%USERPROFILE%\.npm-cache"

for /f "usebackq delims=" %%I in (`node "%SCRIPT_DIR%parse-db-env.js"`) do set "PARSED=%%I"

if not defined PARSED (
  echo [ERROR] Failed to read DATABASE_URL from backend\.env
  exit /b 1
)

for /f "tokens=1,2 delims=|" %%A in ("%PARSED%") do (
  set "PGPASSWORD=%%A"
  set "DBNAME=%%B"
)

if not defined DBNAME set "DBNAME=campustech"

echo Creating database '%DBNAME%' if it does not exist...
"%PSQL%" -U postgres -h localhost -c "CREATE DATABASE %DBNAME%;" >nul 2>&1
echo Database step finished (existing database is OK).

echo Running Prisma migrate...
pushd "%BACKEND%"
call npx prisma migrate dev --name init
set "MIGRATE_EXIT=%ERRORLEVEL%"
popd

if not "%MIGRATE_EXIT%"=="0" (
  echo [ERROR] Prisma migrate failed.
  exit /b %MIGRATE_EXIT%
)

echo Done.
exit /b 0

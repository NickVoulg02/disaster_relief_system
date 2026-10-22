@echo off
set "PATH=%PATH%;%USERPROFILE%\.dotnet\tools"
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="1" (
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        echo Starting XAMPP MySQL Server on port 3307...
        start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
    )
)
echo Starting Disaster Relief System on http://localhost:3000 ...
node node_modules/next/dist/bin/next dev


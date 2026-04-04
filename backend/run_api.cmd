@echo off
set "BACKEND_ROOT=%~dp0"
set "PYTHON_PATH=%BACKEND_ROOT%.venv\Scripts\python.exe"
if not exist "%PYTHON_PATH%" set "PYTHON_PATH=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
if not exist "%PYTHON_PATH%" set "PYTHON_PATH=python"

cd /d "%BACKEND_ROOT%"
set DEBUG=true
set PYTHONPATH=%~dp0
if "%API_PORT%"=="" set API_PORT=8001
"%PYTHON_PATH%" -m uvicorn app.main:app --host 127.0.0.1 --port %API_PORT%

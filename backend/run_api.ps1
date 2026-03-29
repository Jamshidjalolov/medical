$backendRoot = $PSScriptRoot
$venvPython = Join-Path $backendRoot ".venv\Scripts\python.exe"
$systemPython = Join-Path $env:LOCALAPPDATA "Programs\Python\Python313\python.exe"
$port = if ($env:API_PORT) { $env:API_PORT } else { "8000" }

if (Test-Path $venvPython) {
    $pythonPath = $venvPython
} elseif (Test-Path $systemPython) {
    $pythonPath = $systemPython
} else {
    $pythonPath = "python"
}

Set-Location $backendRoot

$env:DEBUG = "true"
$env:BACKEND_CORS_ORIGINS = '["http://localhost:5173","http://127.0.0.1:5173"]'
$env:DATABASE_URL = "postgresql+psycopg://postgres:jamshid4884@localhost:5432/latin_med_terms"
$env:PYTHONPATH = $backendRoot

& $pythonPath -m uvicorn app.main:app --host 127.0.0.1 --port $port

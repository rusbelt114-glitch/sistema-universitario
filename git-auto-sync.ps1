# ==============================================================================
# SCRIPT DE AUTOMATIZACIÓN DE SINCRONIZACIÓN CON GITHUB (POWERSHELL)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Green
Write-Host " Sincronizando Cambios del Sistema Universitario con GitHub... " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Green

# 1. Agregar todos los archivos modificados
git add .

# 2. Generar mensaje de commit con marca de tiempo
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = "Actualización automática de Notas y Control Académico - $timestamp"

Write-Host "[1/3] Registrando commit: '$commitMsg'..." -ForegroundColor Yellow
git commit -m "$commitMsg"

# 3. Subir cambios al repositorio remoto
Write-Host "[2/3] Subiendo cambios a GitHub (push origin main)..." -ForegroundColor Yellow
git push origin main

Write-Host "======================================================================" -ForegroundColor Green
Write-Host " ¡Sincronización completada con éxito en GitHub! " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green

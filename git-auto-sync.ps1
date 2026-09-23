# ==============================================================================
# SCRIPT DE AUTOMATIZACIÓN DE SINCRONIZACIÓN CON GITHUB (POWERSHELL)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Green
Write-Host " Sincronizando Cambios del Sistema Universitario... " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Green

# 1. Asegurar rama 'main'
git branch -M main

# 2. Agregar todos los archivos modificados
git add .

# 3. Generar mensaje de commit con marca de tiempo
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = "Actualizacion automatica de Notas y Control Academico - $timestamp"

Write-Host "[1/2] Registrando commit local: '$commitMsg'..." -ForegroundColor Yellow
git commit -m "$commitMsg"

# 4. Verificar si existe remote 'origin'
$remote = git remote get-url origin 2>$null

if ($remote) {
    Write-Host "[2/2] Subiendo cambios a GitHub ($remote)..." -ForegroundColor Yellow
    git push origin main
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host " ¡Sincronización completada con éxito en GitHub! " -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
}
else {
    Write-Host "======================================================================" -ForegroundColor Yellow
    Write-Host " ¡Guardado local completado! " -ForegroundColor Green
    Write-Host " Aún no has vinculado tu URL de GitHub. Para subir a tu GitHub ejecuta:" -ForegroundColor Yellow
    Write-Host " git remote add origin https://github.com/TU-USUARIO/SISTEMA-UNIVERSITARIO.git" -ForegroundColor Cyan
    Write-Host " git push -u origin main" -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Yellow
}
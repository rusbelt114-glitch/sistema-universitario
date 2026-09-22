@echo off
title Sincronizacion Automatica - Sistema Universitario
echo ======================================================================
echo  Sincronizando Cambios del Sistema Universitario...
echo ======================================================================

git branch -M main
git add .
git commit -m "Actualizacion automatica del Sistema Universitario - %date% %time%"

git remote get-url origin >nul 2>&1
if %errorlevel% == 0 (
    echo Subiendo cambios a GitHub (push origin main)...
    git push origin main
    echo ======================================================================
    echo  Sincronizacion completada con exito en GitHub!
    echo ======================================================================
) else (
    echo ======================================================================
    echo  Guardado local completado!
    echo  Para vincular tu GitHub por primera vez, ejecuta en consola:
    echo  git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
    echo  git push -u origin main
    echo ======================================================================
)

pause

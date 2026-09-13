@echo off
title Sincronización Automática con GitHub - Sistema Universitario
echo ======================================================================
echo  Sincronizando Cambios del Sistema Universitario con GitHub...
echo ======================================================================

git add .
git commit -m "Actualizacion automatica del Sistema Universitario - %date% %time%"
git push origin main

echo ======================================================================
echo  Sincronizacion completada con exito en GitHub!
echo ======================================================================
pause

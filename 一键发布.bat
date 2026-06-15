@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==========================================
echo   1ux4ry Blog 一键发布
echo ==========================================
echo.
echo 正在调用 publish.ps1 ...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish.ps1"
echo.
if errorlevel 1 (
  echo 发布失败，请查看上面的报错信息。
) else (
  echo 发布完成。
)
echo.
pause

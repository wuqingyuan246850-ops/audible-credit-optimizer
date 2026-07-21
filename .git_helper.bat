@echo off
cd /d "%~dp0"
if exist .git\index.lock del /f .git\index.lock
git add -A
if %errorlevel% equ 0 (
    git commit -m "fix: nav breakpoint 1024px, og cards, similar books, _routes.json"
)

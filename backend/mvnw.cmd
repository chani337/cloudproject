@REM Maven Wrapper script for Windows
@REM mvnw.cmd clean package -DskipTests

@echo off
setlocal

set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_OPTS=-Xmx256m

@REM Maven이 설치되어 있으면 직접 사용
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    mvn %*
) else (
    echo Maven is not installed. Please install Maven first.
    echo   Download from: https://maven.apache.org/download.cgi
    exit /b 1
)

endlocal

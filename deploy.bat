@echo off
echo Building the client...
cd client
npm run build

echo Moving files to root...
cd ..
xcopy /E /I /Y client\dist\* .

echo Deployment files are ready. Please commit and push to GitHub.

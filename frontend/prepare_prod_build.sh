echo 'Removing local build copy'
rm -rf build/

echo 'Generating newer build'
npm run-script build

echo 'Copy .htaccess into build'
cp .htaccess build/.htaccess

echo 'Zipping it'
# zip -r build.zip build/

echo 'Upload it via FTP'
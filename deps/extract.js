'use strict';
const fs = require('fs');
const path = require('path');
const tar = require('tar');

const dest = process.argv[2];
const source = path.join(__dirname, 'sqlcipher.tar.gz');

process.on('unhandledRejection', (err) => { throw err; });

/*
	This extracts the bundled sqlcipher.tar.gz file and places the resulting files
	into the directory specified by <$2>.
 */

tar.extract({ file: source, cwd: dest, onwarn: process.emitWarning })
	.then(() => {
		const filePath = path.join(dest, 'sqlite3.c')
		let fileContent = fs.readFileSync(filePath, 'utf-8');

		// Basically the fixes from https://www.sqlite.org/src/info/6c103aee6f146869
		// This will be needed until the next version of SQLite is released (some version higher than 3.46.1)
		fileContent = fileContent.replace(/30\.0\*86400\.0/g, '2592000.0');
		fileContent = fileContent.replace(/365\.0\*86400\.0/g, '31536000.0');

		// Write the updated content back to the file
		fs.writeFileSync(filePath, fileContent, 'utf-8');

		console.log(`Applied fixes for Windows ARM64 in ${filePath}`);

		process.exit(0)
	});

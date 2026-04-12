const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const sharedPackage = require(path.join(root, 'package.json'));
const functions = ['booking-lifecycle', 'reminder-dispatcher', 'order-lifecycle'];

for (const fnName of functions) {
  const fnDir = path.join(distDir, fnName);
  const indexPath = path.join(fnDir, 'index.js');

  if (!fs.existsSync(indexPath)) {
    throw new Error(`Expected compiled entrypoint at ${indexPath}`);
  }

  const pkg = {
    name: `${sharedPackage.name}-${fnName}`,
    version: sharedPackage.version,
    private: true,
    main: 'index.js',
    dependencies: sharedPackage.dependencies
  };

  fs.writeFileSync(path.join(fnDir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
}

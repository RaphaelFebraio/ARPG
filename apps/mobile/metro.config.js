const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const fs = require('node:fs');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

// DECISION: @grimoire/shared and @grimoire/server both import each other's
// raw TypeScript source directly (no build step). The server side runs
// under Node/tsx, which requires NodeNext-style relative imports to end in
// ".js" even when the real file is ".ts". Metro (this bundler) has no such
// rule and fails to resolve those same ".js" specifiers, since the on-disk
// file is ".ts" — so shared can't satisfy both consumers' resolution rules
// at once without a step like this. Rather than dropping the ".js"
// extensions (which would break the server/tsx side), teach Metro to fall
// back to ".ts"/".tsx" when a relative "*.js" import has no real .js file.
const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('.') && moduleName.endsWith('.js')) {
    const basePath = path.join(path.dirname(context.originModulePath), moduleName.slice(0, -3));
    for (const ext of ['.ts', '.tsx']) {
      if (fs.existsSync(basePath + ext)) {
        return context.resolveRequest(context, `${moduleName.slice(0, -3)}${ext}`, platform);
      }
    }
  }

  return previousResolveRequest
    ? previousResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });

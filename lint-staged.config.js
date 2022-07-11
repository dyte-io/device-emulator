const config = {
    '**/*.ts': () => ['npm run typecheck', 'npm run lint:fix'],
};

module.exports = config;

const config = {
    '**/*.ts': () => ['npm run build', 'npm run lint:fix'],
};

module.exports = config;

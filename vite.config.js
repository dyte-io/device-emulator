const pkg = require('./package');

const config = {
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
        },
        outDir: 'dist',
        rollupOptions: {
            external: Object.keys(pkg.dependencies),
        },
    },
};

module.exports = config;

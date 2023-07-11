import pkg from './package.json';

const config = {
    build: {
        emptyOutDir: true,
        lib: {
            entry: 'src/index.ts',
            formats: ['es', 'cjs'],
            fileName: (format: string) => `index.${format}.js`,
        },
        outDir: 'dist',
        rollupOptions: {
            external: Object.keys(pkg.dependencies),
        },
    },
};

export default config;

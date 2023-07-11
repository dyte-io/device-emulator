const config = {
    build: {
        emptyOutDir: false,
        lib: {
            entry: 'src/index.ts',
            formats: ['iife'],
            name: 'DyteDeviceEmulator',
            fileName: () => 'index.iife.js',
        },
        outDir: 'dist',
        target: 'esnext',
    },
};

export default config;

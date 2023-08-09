require('@babel/register')({
    presets: [
        '@babel/preset-react', 
        '@babel/preset-env', 
        '@babel/preset-typescript'
    ],
    extensions: [
        '.js', '.jsx', '.ts', '.tsx'
    ],
});

require('./server');
const path = require('path');
const fs = require('fs');
const os = require('os');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const homeDir = os.homedir();
const certDir = path.join(homeDir, '.office-addin-dev-certs');
const certPath = path.join(certDir, 'localhost.crt');
const keyPath = path.join(certDir, 'localhost.key');
const hasTrustedCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

module.exports = {
  entry: {
    taskpane: './src/taskpane/taskpane.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/taskpane/taskpane.html', to: 'taskpane.html' },
        { from: 'src/taskpane/taskpane.css', to: 'taskpane.css' }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    https: hasTrustedCert
      ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        }
      : true,
    port: 3000,
    host: 'localhost',
    hot: true
  }
};



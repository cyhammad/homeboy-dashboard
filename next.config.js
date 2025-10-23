/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Turbopack configuration
  experimental: {
    turbo: {
      rules: {
        '*.node': {
          loaders: ['file-loader'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Exclude Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        path: false,
        zlib: false,
        querystring: false,
        buffer: false,
        events: false,
        string_decoder: false,
        punycode: false,
        process: false,
        vm: false,
        constants: false,
        timers: false,
        console: false,
        domain: false,
        module: false,
        cluster: false,
        dgram: false,
        dns: false,
        readline: false,
        repl: false,
        tty: false,
        v8: false,
        worker_threads: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;

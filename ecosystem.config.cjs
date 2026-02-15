module.exports = {
    apps: [
        {
            name: 'fashion-fe',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            instances: 'max',
            exec_mode: 'cluster',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};

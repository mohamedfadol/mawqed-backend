module.exports = {
    apps: [
        {
            name: 'mawqed',
            cwd: '/var/www/apps/mawqed',
            script: 'src/server.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3001
            },
            error_file: '/var/www/apps/mawqed/logs/error.log',
            out_file: '/var/www/apps/mawqed/logs/output.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true
        }
    ]
};
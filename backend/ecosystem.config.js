module.exports = {
  apps: [
    {
      name: 'pich', // 给你的应用起个名字
      script: './dist/main.js',
      instances: 'max', // 实例数量（集群模式时可用'max'）
      autorestart: true, // 应用崩溃时自动重启
      watch: false, // 禁用文件监听（生产环境建议false）
      max_memory_restart: '1G', // 内存超过1G自动重启
      env: {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        PORT: 3000,
        NODE_ENV: 'development',
        MYSQL_SYNCHRONIZE: 'true',
        MYSQL_HOST: 'localhost',
        MYSQL_PORT: 3306,
        MYSQL_USERNAME: 'root',
        MYSQL_PASSWORD: 'Goupazhai<123',
        MYSQL_DATABASE: 'pich',
      },
      env_production: {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        PORT: 3000,
        NODE_ENV: 'production',
        MYSQL_SYNCHRONIZE: 'true',
        MYSQL_HOST: 'localhost',
        MYSQL_PORT: 3306,
        MYSQL_USERNAME: 'root',
        MYSQL_PASSWORD: 'Goupazhai<123',
        MYSQL_DATABASE: 'pich',
      },
      output: './logs/out.log', // 标准输出日志路径
      error: './logs/error.log', // 错误日志路径
      log: './logs/combined.log', // 合并日志路径
      time: true, // 日志中显示时间
    },
  ],
};

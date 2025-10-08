# pich

## pm2项目启动

```bash
# 构建
npm run build
# 启动
pm2 start ecosystem.config.js --env production
# 停止
pm2 stop pich
```

## docker项目启动

```bash
# 启动
docker-compose up -d --build
# 查看运行中的容器
docker-compose ps
# 查看日志
docker-compose logs [服务名]
# 停止容器
docker stop [容器名]
```
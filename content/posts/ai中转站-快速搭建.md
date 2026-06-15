+++
title = "AI中转站-快速搭建"
date = 2026-06-16T00:19:11+08:00
draft = false
description = "中转站简单搭建"
tags = ["AI", "中转站"]
categories = ["AI", "中转站"]
series = ["AI", "中转站"]
pin = false
+++
# 前置


```c

sudo mkdir -p /opt/sub2api && cd /opt/sub2api
curl -sSL https://raw.githubusercontent.com/Wei-Shaw/sub2api/main/deploy/docker-deploy.sh | bash
sudo docker compose up -d
sudo docker compose logs -f sub2api


sed -i 's/^ADMIN_PASSWORD=.*/ADMIN_PASSWORD=you_password
/' .env


sed -i 's/^SERVER_PORT=.*/SERVER_PORT=2390/' .env

http://38.76.203.187:2390/login

admin@sub2api.local\12SqweR@
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511234648049.png)

# 分组管理

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511234957640.png)

# 创建新分组

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235320699.png)

# 分组名称

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235336745.png)

# 选择平台

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235354950.png)


# 费率倍数

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235454464.png)


# 专属分组

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235824188.png)




# 保存分组

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235803908.png)


# 添加账号 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235853076.png)

# 添加新账号

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235912035.png)

# 账号名称

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235942147.png)


# 选择平台

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260511235953730.png)


# 授权方式

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000013888.png)

# 优先级

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000028977.png)

# 分配分组

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000047778.png)


# 保存账号

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000103331.png)

# 生成密钥

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000116785.png)


# 创建密钥

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000140044.png)


# 密钥名称

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000157002.png)

# 选择分组

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000212984.png)


# 生成并复制

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260512000232150.png)

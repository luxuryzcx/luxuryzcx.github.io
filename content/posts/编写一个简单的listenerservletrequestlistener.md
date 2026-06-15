+++
title = "编写一个简单的Listener（ServletRequestListener）"
date = 2026-06-15T19:58:50+08:00
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

import javax.servlet.ServletRequestEvent;
import javax.servlet.ServletRequestListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class TestListener implements ServletRequestListener {
    @Override
    public void requestInitialized(ServletRequestEvent sre) {
        System.out.println("TestListener requestInitialized");
    }

    @Override
    public void requestDestroyed(ServletRequestEvent sre) {
        System.out.println("TestListener requestDestroyed");
    }
}

```


# mvn  编译


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517162912863.png)



# 启动进行访问

发现listener已经开始起作用了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517163040539.png)






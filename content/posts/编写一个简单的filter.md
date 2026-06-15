+++
title = "编写一个简单的filter"
date = 2026-06-15T19:58:41+08:00
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
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;

@WebFilter("/test")
public class TestFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) {
        System.out.println("TestFilter init");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("TestFilter before");
        chain.doFilter(request, response);
        System.out.println("TestFilter after");
    }

    @Override
    public void destroy() {
        System.out.println("TestFilter destroy");
    }
}

```

# mvn  编译    放到webapps目录下  这个filter 和servlet 是一起的

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517160519626.png)
# 然后启动访问 


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517162113022.png)


# 查看tomcat的日志   可以发现报错语句  说明filter是已经执行的了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517162600990.png)




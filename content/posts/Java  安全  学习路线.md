+++
title = "Java  安全  学习路线"
date = 2026-06-15T20:00:00+08:00
draft = false
description = "由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。"
tags = ["Java安全", "安全研究"]
categories = ["安全研究"]
series = ["Java 安全 持续学习"]
pin = false
cover = "/images/posts/java-security-banner.svg"
+++
## 前言

由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。这一篇先把学习地图整理出来，后续每一个专题再逐步展开。

## 正文

IDEA-（IDEA安装，如何调试）

Mavem-(安装配置，常见BUG如何解决，如何加速，各种常见Maven插件，多模块项目是什么，了解Gradle)

JavaWeb-(Servlet Tomcat JSP,传统XML配置SSM/SSH,SpringBoot,SpringCloud(了解即可))

反射-（反射调用方法，反射修改字段，反射修改final的问题，进阶:高版本绕过反射限制）

ASM/Javassist-（字节码是什么，如何用ASM修改字节码，如何使用Javassist生成字节码）

JNDI攻击-（8u191以下如何攻击，8u191以上如何打“反序列化/本地工厂”，如何审计）

RMI攻击-（RMI是什么，攻击Server端，攻击Registry端，攻击Client端，攻击DGC）

Java Agent-(启动前与运行中Agent,RASP的原理，简单实现)

JMX/JDWP-（JMX/JDWP等利用）

反序列化基础-(URLDNS/CC/CB/7u21/8u20 分析,尝试阅读并魔改ysoserial,JEP 290是什么,JEP 290鸡肋绕过)

Fastjson反序列化-(1.2.47以前的分析和绕过,1.2.47到1.2.68的分析和绕过,1.2.80的分析,利用方面(出网以及不出网))

Weblogic-(反序列化漏洞,二次反序列化,14882绕过,XML Decoder,IIOP/T3,文件上传)

XStream/Jackson-(他们历史上有很多的Gadget重点放在如何去找新的Gadget)

Hessian-(dubbo历史上的一些洞)

SnakeYAML-(SnakeYAML的利用(Jar),SnakeYAML如何修复的,如何审计这种(SafeConstructor))

Shiro-(Shiro经典RCE,Shiro 721 Padding Oracle,如何检测(SimplePrincipalCollection),如何自己写利用工具(加密),如何通过Shiro注入内存马(内存马后面讲),如何通过Shiro漏洞修改KEY,请求头过大限制的办法,对请求头长度严格限制情况下的绕过思路)

Struts2-(几十个漏洞)

Spring-（Spring RCE分析，Spring EL相关漏洞(Gateway Function Data)，SpringBoot Actuator利用，Spring-Security相关的绕过）

Tomcat-（Tomcat PUT RCE，Tomcat CGI SERVLET RCE，Tomcat SESSION RCE，Tomcat AJP RCE，Tomcat 其他鸡肋洞）

内存马原理-（Servlet/Filter/Listener，Valve/WebSocket/Executor，Spring Controller/Interceptor，如何自己找内存马(核心context)，进阶内存马:Agent内存马，zhouyu内存马，内存马持久化，内存马反查杀(如何防止被检测到)）

内存马查杀-（c0ny1师傅的jsp查杀，核心:类名;存在文件，dump class查杀，sa-jdi dump agent）

Log4j2-（最初版RCE与RC1绕过姿势，2.15版本特殊绕过(特殊操作系统)，拒绝服务的原理，几种修复方案(以洞修洞)，Java Agent修复，如何编写Burp插件来检测）

其他组件漏洞-（Apache Solr，Apache Flink，Apache Spark，Apache Skywalking）

进阶-（tabby，codeql，自己分析字节码，自己写JM）

## 总结

这份 Java 安全学习路线会持续补充和细化，后续文章会围绕这里的主题逐步展开。

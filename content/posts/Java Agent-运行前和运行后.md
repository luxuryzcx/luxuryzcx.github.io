+++
title = "Java Agent-运行前和运行后"
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

由于很多框架是 Java 写的，所以研究 Java 安全刻不容缓。这篇文章收录在「Java 安全 持续学习」系列中，用来沉淀对应主题的分析与记录。

## 正文

## 什么是Java Agent


java 平台的一项强大功能  ，允许在程序运行过程中  甚至在main方法执行之前 动态修改字节码   


启动方式  

1.启动前加载    最常见   agent 在jvm通过-javaagent参数加载  
应用场景    代码审计  ，全局性能埋点  ，在类加载前修改类定义

核心方法  
public static void premain(String agentArgs, Instrumentation inst)


2.运行中加载   通过attach api 动态挂载到正在运行的Java进程中  程序运行的任何时刻
随时通过代码进行“热挂载”

核心方法
public static void agentmain(String agentArgs, Instrumentation inst)



## 关键接口

java.lang.instrument.Instrumentation   

这个接口 

功能   添加类转换器  类加载  有机会操作  字节码操作库   (asm,javassist或bytebuddy)
从而修改类的byte[]内容

retransformClasses重新转换已经加载的类。这是实现“热补丁”的关键。

getAllLoadedClasses  获取 JVM 当前内存中所有已加载的类


## 开发一个最简单的agent类


静态加载   动态加载

```java
package com.example;

  

import com.sun.tools.attach.VirtualMachine;

  

/**

 * 动态 Attach 工具：将 Agent 附加到运行中的目标 JVM

 *

 * 用法: java -cp .;%JAVA_HOME%/lib/tools.jar com.example.Attacher <PID>

 */

public class Attacher {

  

    public static void main(String[] args) throws Exception {

        if (args.length < 1) {

            System.out.println("用法: java -cp .;%JAVA_HOME%/lib/tools.jar com.example.Attacher <PID> [agent_jar_path]");

            return;

        }

  

        String pid = args[0];

        String agentPath = args.length >= 2 ? args[1] : "myagent.jar";

  

        System.out.println("[Attacher] 正在附加到 PID: " + pid);

        VirtualMachine vm = VirtualMachine.attach(pid);

        System.out.println("[Attacher] 附加成功，加载 Agent: " + agentPath);

  

        vm.loadAgent(agentPath, "greeting=hello");

        System.out.println("[Attacher] Agent 加载完成");

  

        vm.detach();

        System.out.println("[Attacher] 已分离");

    }

}
```


## 静态加载

java -javaagent:myagent.jar -jar testapp.jar

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604002900122.png)



## 动态加载

java -jar testapp.jar

此时pid  为  31372

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604003001336.png)

此时再开一个窗口

java -cp "attacher.jar;%JAVA_HOME%\lib\tools.jar" com.example.Attacher 31372


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604003804600.png)


再进行查看   发现已经被  agent动态加载了  被注入了 hello 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604003842838.png)



## 练习 demo 


### 练习一
**：写一个简单的类，在 `premain` 中打印 "Hello from Agent!"，然后通过 `-javaagent:your.jar` 运行你的程序

这是静态

1. 执行顺序：premain 在 main 之前执行，所以 "Hello from Agent!" 最先打印

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604004619606.png)

这是动态

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604004738013.png)


发现已经null的被注入到了word上去了

源码

SimpleAgent.java

```java
package com.example;

  

import java.lang.instrument.Instrumentation;

  

public class SimpleAgent {

  

    public static void premain(String agentArgs, Instrumentation inst) {

        System.out.println("Hello from Agent!");

        System.out.println("[Agent] premain args: " + agentArgs);

    }

}
```


SimpleApp.java

```java
package com.example;

  

public class SimpleApp {

    public static void main(String[] args) {

        System.out.println("[SimpleApp] Hello from Main!");

    }

}
```


### 练习二


利用 `ByteBuddy` 库（它是目前操作字节码最简单的方式）在 `premain` 中拦截 `com.example.TargetClass` 的 `test()` 方法，并修改其返回值



不带agent

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604005718651.png)



然后带agent 的话  发现已经成功了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260604010007189.png)

源码

ByteBuddyAgent.java      premain + AgentBuilder

```java
package com.example;

  

import net.bytebuddy.agent.builder.AgentBuilder;

import net.bytebuddy.implementation.FixedValue;

import net.bytebuddy.matcher.ElementMatchers;

  

import java.lang.instrument.Instrumentation;

  

import static net.bytebuddy.matcher.ElementMatchers.named;

  

public class ByteBuddyAgent {

  

    public static void premain(String agentArgs, Instrumentation inst) {

        System.out.println("[ByteBuddyAgent] premain started");

  

        new AgentBuilder.Default()

                // 只拦截 com.example.TargetClass

                .type(ElementMatchers.nameContains("com.example.TargetClass"))

                .transform((builder, typeDescription, classLoader, module, protectionDomain) ->

                        builder

                                // 拦截名为 "test" 的方法

                                .method(named("test"))

                                // 将返回值改为 "HACKED by ByteBuddy!"

                                .intercept(FixedValue.value("HACKED by ByteBuddy!"))

                )

                .installOn(inst);

  

        System.out.println("[ByteBuddyAgent] AgentBuilder installed");

    }

}
```


TargetClass.java      test() 返回 "original value"

```java
package com.example;

  

public class TargetClass {

  

    public String test() {

        return "original value";

    }

}
```


TestRunner.java

```java
package com.example;

  

public class TestRunner {

  

    public static void main(String[] args) {

        System.out.println("[TestRunner] Calling TargetClass.test()...");

  

        TargetClass target = new TargetClass();

        String result = target.test();

  

        System.out.println("[TestRunner] test() returned: " + result);

  

        // 验证结果

        if ("HACKED by ByteBuddy!".equals(result)) {

            System.out.println("[TestRunner] SUCCESS: method was intercepted!");

        } else {

            System.out.println("[TestRunner] FAIL: method was NOT intercepted.");

        }

    }

}
```

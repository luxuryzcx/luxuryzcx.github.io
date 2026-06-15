+++
title = "字节码-ASM-Javassist"
date = 2026-06-14T21:20:00+08:00
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

是Java代码   与  机器代码之间的中间人  

字节码  -》  .class文件

## ASM


刚开始一个非常简单的类     只有一行打印hello world 

```java
package com.example;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```


使用ASM  进行劫持注入  然后就能弹出计算机

```java
package com.example;

import org.objectweb.asm.*;
import org.objectweb.asm.commons.AdviceAdapter;
import java.io.FileOutputStream;
import java.io.InputStream;

public class AsmCalcModifier {

    public static void main(String[] args) throws Exception {
        // 1. 读取原本的 Main.class
        String className = "com.example.Main";
        InputStream is = AsmCalcModifier.class.getClassLoader().getResourceAsStream(className.replace('.', '/') + ".class");
        
        ClassReader cr = new ClassReader(is);
        ClassWriter cw = new ClassWriter(cr, ClassWriter.COMPUTE_FRAMES | ClassWriter.COMPUTE_MAXS);

        // 2. 转换字节码
        ClassVisitor cv = new ClassVisitor(Opcodes.ASM9, cw) {
            @Override
            public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
                MethodVisitor mv = super.visitMethod(access, name, descriptor, signature, exceptions);
                
                // 拦截 main 方法
                if ("main".equals(name) && "([Ljava/lang/String;)V".equals(descriptor)) {
                    return new AdviceAdapter(Opcodes.ASM9, mv, access, name, descriptor) {
                        @Override
                        protected void onMethodEnter() {
                            // ---- 注入弹出计算器字节码开始 ----
                            
                            // 1. 调用 Runtime.getRuntime()
                            mv.visitMethodInsn(
                                    Opcodes.INVOKESTATIC, 
                                    "java/lang/Runtime", 
                                    "getRuntime", 
                                    "()Ljava/lang/Runtime;", 
                                    false
                            );
                            
                            // 2. 将命令字符串 "calc" 压入栈顶
                            mv.visitLdcInsn("calc");
                            
                            // 3. 调用 runtime 实例的 exec 方法：runtime.exec("calc")
                            mv.visitMethodInsn(
                                    Opcodes.INVOKEVIRTUAL, 
                                    "java/lang/Runtime", 
                                    "exec", 
                                    "(Ljava/lang/String;)Ljava/lang/Process;", 
                                    false
                            );
                            
                            // 4. 把 exec 返回的 Process 对象从栈顶弹出，保持栈平衡
                            mv.visitInsn(Opcodes.POP);
                            
                            // ---- 注入弹出计算器字节码结束 ----
                        }
                    };
                }
                return mv;
            }
        };

        cr.accept(cv, ClassReader.EXPAND_FRAMES);

        // 3. 将新字节码写出到磁盘
        byte[] modifiedByte = cw.toByteArray();
        try (FileOutputStream fos = new FileOutputStream("Main.class")) {
            fos.write(modifiedByte);
        }
        
        System.out.println("成功！包含弹出计算器指令的 Main.class 已生成在项目根目录下。");
    }
}
```


让我们来看一下  效果咋样

第一步：运行 AsmCalcModifier，读取原始 Main.class，用 ASM 在 main 方法入口注入 Runtime.getRuntime().exec("calc")，输出修改后的 Main.class 到磁盘：


第二步：运行被修改的 Main.class，触发弹计算器：（也就是可以执行任意命令了）


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260524224525237.png)


总结  

```c
 核心代码说明

  AsmCalcModifier 使用 AdviceAdapter.onMethodEnter() 在 main 方法进入时注入4条字节码指令：
  ┌────────────────────────────────────┬─────────────────────────────────┐
  │                指令                │              作用               │
  ├────────────────────────────────────┼─────────────────────────────────┤
  │ INVOKESTATIC Runtime.getRuntime()  │ 获取 Runtime 实例               │
  ├────────────────────────────────────┼─────────────────────────────────┤
  │ LDC "calc"                         │ 将命令字符串压栈                │
  ├────────────────────────────────────┼─────────────────────────────────┤
  │ INVOKEVIRTUAL Runtime.exec(String) │ 执行命令                        │
  ├────────────────────────────────────┼─────────────────────────────────┤
  │ POP                                │ 弹出 Process 返回值，保持栈平衡 │
  └────────────────────────────────────┴─────────────────────────────────┘
```





## Javassist

优点   Javassist 只需一行 Java 源码字符串  ASM 需要手写字节码指令（4条）


```java
package com.example;

  import javassist.*;

  public class JavassistCalcModifier {

      public static void main(String[] args) throws Exception {
          // 1. 获取 ClassPool（类容器）
          ClassPool pool = ClassPool.getDefault();

          // 2. 获取目标类
          CtClass ctClass = pool.get("com.example.Main");

          // 3. 获取目标方法 main
          CtMethod mainMethod = ctClass.getDeclaredMethod("main");

          // 4. 在 main 方法开头注入代码
          mainMethod.insertBefore(
                  "Runtime.getRuntime().exec(\"calc\");"
          );

          // 5. 将修改后的类写出到磁盘
          ctClass.writeFile();
          // 也可以指定输出目录: ctClass.writeFile("输出目录路径")

          System.out.println("成功！包含弹出计算器指令的 Main.class 已生成。");
      }
  }
```


尝试运行 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260524232536256.png)





## 总结


```c
 二、关键差异
  ┌──────────┬────────────────────────────────────────────────────────┬──────────────────────────────────────────────┐
  │   维度   │                          ASM                           │                  Javassist                   │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 注入方式 │ 手写 JVM 字节码指令                                    │ 写 Java 源码字符串                           │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 代码量   │ 多（需要4条指令才能完成一次 exec 调用）                │ 少（一行字符串搞定）                         │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 学习门槛 │ 高，需掌握字节码指令、操作数栈、方法描述符             │ 低，会写 Java 就能用                         │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ API 模型 │ 访问者模式（ClassReader → ClassVisitor → ClassWriter） │ 反射式 API（ClassPool → CtClass → CtMethod） │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 注入位置 │ onMethodEnter() / onMethodExit()                       │ insertBefore() / insertAfter() / insertAt()  │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 性能     │ 快，直接操作字节码，无编译开销                         │ 稍慢，内部需要编译 Java 源码片段             │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 灵活性   │ 极高，可精确控制每一条指令                             │ 受限，复杂逻辑源码字符串写起来麻烦           │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 依赖体积 │ 小（asm.jar ~125KB）                                   │ 较大（javassist.jar ~700KB）                 │
  ├──────────┼────────────────────────────────────────────────────────┼──────────────────────────────────────────────┤
  │ 适用场景 │ 高性能 Agent、框架底层、需要精细控制                   │ 快速原型、安全研究、简单注入                 │
  └──────────┴────────────────────────────────────────────────────────┴──────────────────────────────────────────────┘
  ---
  三、本质原理

  两者做的是同一件事——修改 .class 文件的字节码，但抽象层级不同：

  ASM:     你 ──────────────────→ 字节码指令 ──→ .class 文件
                （你自己写每条指令）

  Javassist: 你 ──→ Java源码字符串 ──→ 内置编译器 ──→ 字节码 ──→ .class 文件
                （Javassist 帮你翻译成字节码）

  - ASM 是底层操作，你直接和 JVM 指令打交道，能力最强但最繁琐
  - Javassist 是上层封装，你写 Java 代码它帮你编译成字节码，简单但受限

  ---
  四、安全研究中的选择

  - 快速验证漏洞/写 POC → Javassist，几行代码出结果
  - 编写通用 Agent/内存马/防御工具 → ASM，性能好、体积小、控制精细
  - 实际攻击场景（如反序列化利用链） → 两者都常见，取决于目标环境是否有对应依赖
```

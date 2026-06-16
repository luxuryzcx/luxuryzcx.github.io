+++
title = "ctfshow-misc"
date = 2026-06-16T16:09:58+08:00
draft = false
description = "ctfshow-misc(1-56题)"
tags = ["CTF", "Misc"]
categories = ["CTF", "Misc"]
series = ["CTF", "Misc"]
pin = false
+++
# misc1（基础操作）

直接打开就是图片

也就是flag
# misc2

可以看到是png头部

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112170202066.png)

然后改一下文件后缀就行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112170316615.png)


# misc3

没看懂，bpg图片格式，需要特定的工具才能打开

# misc4

打开是6个文本文档   
然后打开那个文件头就可以发现是各个文件的文件头，然后依次进行修改就好了

89 50 4E 47 0D 0A 1A 0A 是png文件头
FF D8 FF E1 04 53 45 78  是jpg文件头
4749 4638  是gif 文件头
49 49 2a 00 是tiff文件头
52 49 46 46 
5249 4646 6c03 0000 5745 4250 是Webp图片文件头


# misc5（信息附加）

拉到末尾 ，或者cat试试？

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112200247556.png)

# misc6

字符串进行搜索

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112200901522.png)


# misc7

依旧字符串进行搜索
![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112201120470.png)

# misc8

看到里面藏了一个png

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112201417247.png)


kali  进行分离

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112201355388.png)


# misc9

直接就搜到了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112201703456.png)


# misc10


拉进去没有看懂明显的特征，所以我们此时binwalk一下就行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112202113343.png)



# misc11

提示flag在另一张图里，我们可以删掉第二个IDAT数据


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112205135808.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260112205229960.png)




# misc12

需要用到工具   **[PNG Debugger](https://github.com/rvong/png-debugger)**


# misc13

没看懂  
wp是这样说的
群里师傅讨论里学到的。看到这地方差不多是flag的样子，隔一个字节取一个数

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113153032143.png)



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113153226011.png)


然后我们写一个脚本，只要跳过偶数位就行


# misc14

```c
┌──(root㉿kali)-[/home/kali/桌面/volatility-2.6.1]
└─# binwalk -e '/home/kali/桌面/misc14.jpg'  --run-as=root

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------

WARNING: One or more files failed to extract: either no utility was found or it's unimplemented

                                                                                                                                                                               
┌──(root㉿kali)-[/home/kali/桌面/volatility-2.6.1]
└─# binwalk  '/home/kali/桌面/misc14.jpg'  --run-as=root 

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, EXIF standard
12            0xC             TIFF image data, big-endian, offset of first image directory: 8
1681          0x691           TIFF image data, big-endian, offset of first image directory: 8
2103          0x837           JPEG image data, JFIF standard 1.01

```

发现加上-e就不行  不加就可以显示出来，但是foremost 和binwalk命令都不好提取这种jpg里面又嵌套jpg的，所以我们用dd来手动切出来

但是binwalk可以显示这里面在2103处又有一个jpg，就很方便


```c
┌──(root㉿kali)-[/home/kali/桌面/volatility-2.6.1]
└─# dd if="/home/kali/桌面/misc14.jpg" of="/home/kali/桌面/extract_0x837.jpg" bs=1 skip=2103 status=progress

输入了 26231+0 块记录
输出了 26231+0 块记录
26231 字节 (26 kB, 26 KiB) 已复制，0.0885978 s，296 kB/s
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113162328399.png)


确实可以看到是jpg文件的


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113162507922.png)


# misc15

直接010搜索或者strings一下

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113163008775.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113163138068.png)



# misc16

```c
┌──(root㉿kali)-[/home/kali/桌面/volatility-2.6.1]
└─# binwalk -e  "/home/kali/桌面/misc16.png"
```

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113165658001.png)





# misc17

发现数据在zsteg里面
我们用zsteg命令尝试一下

```c
┌──(root㉿kali)-[/home/kali/桌面/volatility-2.6.1]
└─# zsteg -a  '/home/kali/桌面/misc17.png' 
[?] 3544 bytes of extra data after zlib stream
extradata:0         .. 
    00000000: e1 1f 30 53 86 4f c5 a4  1b f5 e6 e5 c7 46 0a 92  |..0S.O.......F..|
    00000010: 9b ee 72 e7 c9 9e b9 a7  74 de 92 4d ad 61 5b 58  |..r.....t..M.a[X|
    00000020: f2 98 65 77 2b d2 d3 85  32 fc 08 83 86 1f 0f 1e  |..ew+...2.......|
    00000030: cb ab ac 9c 4b ca 02 20  e2 ce e4 ae 60 1a 2c c6  |....K.. ....`.,.|
    00000040: 7b c8 9a 77 31 2f 9e 67  db d9 3e 53 fe 17 a5 50  |{..w1/.g..>S...P|
    00000050: 20 e5 1d 8c d5 49 4e 52  a5 54 31 cb 8b c5 3b 09  | ....INR.T1...;.|
    00000060: a2 a6 fe 5b da 4f 9e 78  9c 5d 46 d6 e2 6b 6b 2a  |...[.O.x.]F..kk*|
    00000070: f2 62 0c ba 70 19 a0 27  f3 84 77 99 02 77 05 79  |.b..p..'..w..w.y|
    00000080: 5b 44 b7 79 b3 54 11 a1  f3 54 34 56 7e ff 55 d1  |[D.y.T...T4V~.U.|
    00000090: c6 39 90 c8 21 7f 26 39  44 58 78 c3 ed 37 4a 7c  |.9..!.&9DXx..7J||
    000000a0: 50 24 e8 79 7b 4b 9c fa  2a 2c bb e8 b9 fb 40 2c  |P$.y{K..*,....@,|
    000000b0: 50 05 21 4c 3b 29 65 b4  60 1c 27 bb 4c 16 bf f1  |P.!L;)e.`.'.L...|
    000000c0: 77 c0 55 04 5e 25 0e 18  1e 58 ab 0f 13 11 f2 3f  |w.U.^%...X.....?|
    000000d0: cf a0 32 b1 f5 a8 1b 99  a7 4b 46 89 cf 85 89 50  |..2......KF....P|
    000000e0: 88 20 8f 4f fd e2 97 55  68 73 b4 96 ba dd 25 a3  |. .O...Uhs....%.|
    000000f0: 83 72 3f 99 77 9e 0a 08  50 4f 11 8f 87 65 c0 29  |.r?.w...PO...e.)|
```


然后用命令把他给贴导出来

```c
zsteg -E misc17.png "extradata:0" > 1.png
```

然后再binwalk就可以


# misc18


在属性里面的

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113170526914.png)

依次拼接即可

ctfshow{325d60c208f728ac17e5f02d4cf5a839}


# misc19

直接拖到010里面去查看，发现找到了，而且前后是不连续的，需要拼接


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113171643043.png)



ctfshow{dfdcf08038cd446a5eb50782f8d3605d}


# misc20

exiftool 文件    就行 

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113173002136.png)


然后手敲就可以



# misc21



发现文件里面的ctfshow{}显示不全

![](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113173610917.png)


看了网上的wp才知道需要hash解密

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113173732352.png)


hex(X&Ys),发现这个是位与运算，然后简单的打印一下就行


```python
print(hex(3902939465)[2:]+hex(2371618619)[2:]+hex(1082452817)[2:]+hex(2980145261)[2:])
```

解释

```c
逐段解释：

- `hex(3902939465)` 把十进制转成十六进制字符串，结果形如：`'0xe8a00009'`
    
- `[2:]` 是把前面的 `'0x'` 去掉，只保留纯十六进制：`'e8a00009'`
    

所以整句：

`print(   hex(3902939465)[2:]   + hex(2371618619)[2:]   + hex(1082452817)[2:]   + hex(2980145261)[2:] )`

等价于：

1. 分别得到 4 段 hex（去掉 `0x`）
    
2. 把这 4 段字符串直接 **拼在一起**
    
3. 打印拼接后的长串
    

这 4 个数转 hex 分别是：

- 3902939465 → `e8a00009`
    
- 2371618619 → `8d62df7b`
    
- 1082452817 → `40824531`
    
- 2980145261 → `b19f64cd`
    

拼接后的输出就是：

`e8a000098d62df7b40824531b19f64cd`

如果题目要 flag，常见写法是再包一层：

`ctfshow{e8a000098d62df7b40824531b19f64cd}`
```

ctfshow{e8a221498d5c073b4084eb51b1a1686d}


# misc22

这个涉及 thumbnail隐写

exiftool -ThumbnailImage -b misc22.jpg > 1.jpg



# misc23

```c
┌──(root㉿kali)-[/home/kali/桌面/1]
└─# exiftool '/home/kali/桌面/misc23.psd' 
ExifTool Version Number         : 13.25
File Name                       : misc23.psd
Directory                       : /home/kali/桌面
File Size                       : 66 kB
File Modification Date/Time     : 2026:01:13 06:41:23-05:00
File Access Date/Time           : 2026:01:13 06:41:48-05:00
File Inode Change Date/Time     : 2026:01:13 06:41:37-05:00
File Permissions                : -rw-------
File Type                       : PSD
File Type Extension             : psd
MIME Type                       : application/vnd.adobe.photoshop
Num Channels                    : 3
Image Height                    : 150
Image Width                     : 900
Bit Depth                       : 8
IPTC Digest                     : 00000000000000000000000000000000
XMP Toolkit                     : Image::ExifTool 11.98
Format                          : application/vnd.adobe.photoshop
Color Mode                      : RGB
Text Layer Name                 : {there is no flag here}
Text Layer Text                 : {there is no flag here}
Create Date                     : 2021:03:25 15:45:24+08:00
Creator Tool                    : Adobe Photoshop CC 2019 (Windows)
Metadata Date                   : 2021:03:25 16:02:50+08:00
Modify Date                     : 2021:03:25 16:02:50+08:00
Document ID                     : xmp.did:49520599-6932-e144-8f4b-dfd5873be5bc
History Action                  : ctfshow{}, UnixTimestamp, DECtoHEX, getflag
History Instance ID             : xmp.iid:1, xmp.iid:2, xmp.iid:3, xmp.iid:4
History Software Agent          : Adobe Photoshop CC 2019 (Windows), Adobe Photoshop CC 2019 (Windows), Adobe Photoshop CC 2019 (Windows), Adobe Photoshop CC 2019 (Windows)
History When                    : 1997:09:22 02:17:02+08:00, 2055:07:15 12:14:48+08:00, 2038:05:05 16:50:45+08:00, 1984:08:03 18:41:46+08:00
History Changed                 : /
Instance ID                     : xmp.iid:06e30d4e-08bd-0246-815c-0c8c684a0c81
Original Document ID            : xmp.did:49520599-6932-e144-8f4b-dfd5873be5bc
X Resolution                    : 72
Displayed Units X               : inches
Y Resolution                    : 72
Displayed Units Y               : inches
Print Style                     : Centered
Print Position                  : 0 0
Print Scale                     : 1
Global Angle                    : 90
Global Altitude                 : 30
URL List                        : 
Slices Group Name               : 
Num Slices                      : 1
Pixel Aspect Ratio              : 1
Photoshop Thumbnail             : (Binary data 1155 bytes, use -b option to extract)
Has Real Merged Data            : Yes
Writer Name                     : Adobe Photoshop
Reader Name                     : Adobe Photoshop CC 2019
Exif Byte Order                 : Big-endian (Motorola, MM)
Orientation                     : Horizontal (normal)
Resolution Unit                 : inches
Software                        : Adobe Photoshop CC 2019 (Windows)
Color Space                     : Uncalibrated
Exif Image Width                : 900
Exif Image Height               : 150
Thumbnail Offset                : 272
Thumbnail Length                : 0
Layer Count                     : 2
Layer Rectangles                : 0 0 150 900, 56 239 98 647
Layer Blend Modes               : Normal, Normal
Layer Opacities                 : 100%, 100%
Layer Visible                   : Yes, Yes
Layer Names                     : ±³¾°, {there is no flag here}
Layer Unicode Names             : 背景, {there is no flag here}
Layer Colors                    : None, None
Layer Modify Dates              : 2021:03:25 04:02:52-04:00, 2021:03:25 04:02:52-04:00
Compression                     : RLE
Image Size                      : 900x150
Megapixels                      : 0.135

```

然后就找到了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113194421921.png)


ctfshow{49520599-6932-e144-8f4b-dfd5873be5bc}

但是发现不对，因为他说是时间

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113195012951.png)


# misc24(文件结构)

查看文件分辨率，分析缺了高度

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113220014068.png)

然后我们只要把高度改一下就行，把高度从96改成EE

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113220144683.png)


然后就得到了flag

# misc25

改一下就行了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113221426674.png)


# misc26


修改了一下找到了flag，但是不全

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113221742270.png)


需要在线图片进行爆破

在网上掏出一个脚本

```python
import os
import binascii
import struct
crcbp = open("misc26.png", "rb").read()    #打开图片
for i in range(1024):
    for j in range(1024):
        data = crcbp[12:16] + struct.pack('>i', i)+struct.pack('>i', j)+crcbp[24:29]#从IHDR开始17个字节，其中宽和高用i和j代替，并以4个字节存放i和j。
        crc32 = binascii.crc32(data) & 0xffffffff
        if(crc32 == 0xec9ccbc6):   #010Editor第二行倒数3字节，加第三行第一字节。按顺序写就行，不用改。
            print(i, j)
            print('hex:', hex(i), hex(j))
#900 606
#hex: 0x384 0x25e

```

爆破一下

PS Z:\Desktop> python 1.py
900 606
hex: 0x384 0x25e
PS Z:\Desktop>

然后成功爆破出

ctfshow{94aef125e087a7ccf2e28e742efd704c}


# misc27

改一下高度

改成EE03

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113225030747.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113225139497.png)


``
# msic28

改96为EE就行


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113225443494.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113225619832.png)



# misc29


将图片中所有的96 00全部改为 EE 00

这是修改完成后的

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113230710104.png)


第八帧的时候找到flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260113230820857.png)


# misc30

发现宽度不对，所以要修改宽度，将宽度修改为950

一些解释

从 **文件开头算起的第 0x12（十六进制）字节偏移** 开始改，也就是：

- **偏移地址：`0x12`**（十进制 **18**）
    
- 修改 **4 个字节**（`biWidth` 宽度字段）
    
- 要改成 950 → 写入：`B6 03 00 00`（小端）
    

在你截图里对应的是 **第二行 `0010h` 这一行的第 3 个字节位置**（因为这一行覆盖 `0x10~0x1F`，而 `0x12` 就在这行里）。

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114103109955.png)


然后重新保存就行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114103204270.png)

# misc31


计算宽度的方法

```python
a = （487256-54）/ 3
a  / = 150
print（a）
1082.6666666666667

```

所以宽度是1082的

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114105221919.png)







# misc32

脚本爆破正确的宽高

```python
import zlib
import struct

# 同时爆破宽度和高度
filename = "misc32.png"
with open(filename, 'rb') as f:
    all_b = f.read()
    data = bytearray(all_b[12:29])
    n = 4095
    for w in range(n):
        width = bytearray(struct.pack('>i', w))
        for h in range(n):
            height = bytearray(struct.pack('>i', h))
            for x in range(4):
                data[x+4] = width[x]
                data[x+8] = height[x]
            crc32result = zlib.crc32(data)
            #替换成图片的crc
            if crc32result == 0xE14A4C0B:
                print("宽为：", end = '')
                print(width, end = ' ')
                print(int.from_bytes(width, byteorder='big'))
                print("高为：", end = '')
                print(height, end = ' ')
                print(int.from_bytes(height, byteorder='big'))

```


PS Z:\Desktop> python 1.py
宽为：bytearray(b'\x00\x00\x04\x14') 1044
高为：bytearray(b'\x00\x00\x00\x96') 150


然后修改即可

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114112048192.png)


# misc33


写个脚本爆破然后直接解决

```c
#!/usr/bin/env python3

# -*- coding: utf-8 -*-

  

import sys

import struct

import zlib

from pathlib import Path

  

PNG_SIG = b"\x89PNG\r\n\x1a\n"

  

def parse_ihdr(buf: bytes):

    if not buf.startswith(PNG_SIG):

        raise SystemExit("[-] 不是PNG：文件签名错误")

  

    off = 8  # first chunk

    if off + 8 > len(buf):

        raise SystemExit("[-] PNG被截断：没有完整chunk头")

  

    length = struct.unpack(">I", buf[off:off+4])[0]

    ctype  = buf[off+4:off+8]

  

    if ctype != b"IHDR":

        raise SystemExit(f"[-] 第一个chunk不是IHDR：{ctype!r}")

  

    if length != 13:

        raise SystemExit(f"[-] IHDR长度不是13：{length}")

  

    data_start = off + 8

    data_end   = data_start + 13

    crc_start  = data_end

    crc_end    = crc_start + 4

  

    if crc_end > len(buf):

        raise SystemExit("[-] PNG被截断：IHDR CRC不完整")

  

    ihdr_data = buf[data_start:data_end]

    ihdr_crc  = struct.unpack(">I", buf[crc_start:crc_end])[0]

  

    # IHDR_data 后5字节：bitdepth, colortype, compression, filter, interlace

    tail5 = ihdr_data[8:]

  

    return data_start, crc_start, ihdr_crc, tail5

  

def brute_force_wh(target_crc: int, tail5: bytes, limit=3000):

    # CRC = crc32(b'IHDR' + ihdr_data)

    # ihdr_data = width(4) + height(4) + tail5(5)

    init = zlib.crc32(b"IHDR")

  

    total = limit * limit

    checked = 0

  

    for w in range(1, limit + 1):

        w_be = struct.pack(">I", w)

        for h in range(1, limit + 1):

            ihdr_data = w_be + struct.pack(">I", h) + tail5

            crc = zlib.crc32(ihdr_data, init) & 0xffffffff

            checked += 1

  

            # 轻量进度（不刷屏）

            if checked % 2000000 == 0:

                print(f"[*] 进度: {checked}/{total} ({checked*100/total:.2f}%)")

  

            if crc == target_crc:

                return w, h

  

    return None, None

  

def patch_png(buf: bytes, data_start: int, w: int, h: int):

    out = bytearray(buf)

    out[data_start:data_start+4] = struct.pack(">I", w)

    out[data_start+4:data_start+8] = struct.pack(">I", h)

    # 注意：这里不改CRC，因为我们是通过匹配CRC爆破出来的

    return bytes(out)

  

def main():

    if len(sys.argv) != 2:

        print(f"用法: python3 {Path(sys.argv[0]).name} <png文件>")

        sys.exit(1)

  

    in_path = Path(sys.argv[1])

    buf = in_path.read_bytes()

  

    data_start, crc_start, target_crc, tail5 = parse_ihdr(buf)

    print(f"[*] 目标IHDR CRC: 0x{target_crc:08x}")

    print(f"[*] IHDR尾5字节: {tail5.hex()} (bitdepth/colortype/comp/filter/interlace)")

    print("[*] 开始爆破宽高(1~3000)...")

  

    w, h = brute_force_wh(target_crc, tail5, limit=3000)

    if w is None:

        print("[-] 3000以内未找到匹配的宽高（可能CRC也被改了，或不是这种题型）")

        sys.exit(2)

  

    print(f"[*] 已爆破宽高: {w}x{h}")

  

    fixed = patch_png(buf, data_start, w, h)

    out_path = in_path.with_name(f"fixed_{in_path.name}")

    out_path.write_bytes(fixed)

    print(f"[*] 已输出修复文件: {out_path}")

  

if __name__ == "__main__":

    main()
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114114047533.png)



# misc34

脚本宽高爆破
```c
import os
import binascii
import struct
bp = open("misc34.png", "rb").read()    
for i in range(901,1500):
    png_name='test/misc34/'+str(i)+'.png'#我是建立一个文件夹，可以不写前面的文件夹路径。
    png=open(png_name,"wb")
    data=bp[:16] + struct.pack('>i', i)+bp[20:24]+bp[24:]#这里可以直接写成bp[:16] + struct.pack('>i', i)+bp[20:]，我是把高度单独写出来了。
    png.write(data)
    png.close()


```


然后成功爆破

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114120301106.png)


# misc35

脚本

```python 
import os
import binascii
import struct 
bp = open("misc35.jpg", "rb").read()    
for i in range(901,1500):
    #根据题目给的图片格式修改后缀
    image_name=''+str(i)+'.jpg'
    image=open(image_name,"wb")
    #png 
    #data=bp[:16] + struct.pack('>i', i)+bp[20:24]+bp[24:]#png
    #jpg
    data=bp[:157]+bp[157:159] + struct.pack('>h', i)+bp[161:]  #jpg
    image.write(data)
    image.close()


```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114120828814.png)



# misc36

脚本

```c
import os
import binascii
import struct 
bp = open("misc36.gif", "rb").read()    
#for i in range(901,1500):
for i in range(920,951):
    #根据题目给的图片格式修改后缀
    image_name=''+str(i)+'.jpg'
    image=open(image_name,"wb")
    #png 
    #data=bp[:16] + struct.pack('>i', i)+bp[20:24]+bp[24:]#png
    #jpg
    #data=bp[:157]+bp[157:159] + struct.pack('>h', i)+bp[161:]  #jpg
    #gif
    data=bp[:38]+ struct.pack('>h', i)[::-1]+bp[40:42] +bp[42:]#gif
    image.write(data)
    image.close()
```


宽度941出现flag。


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114121243344.png)


# misc37

打开stegsolve里面的帧处理就能看到


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114125702757.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114125715606.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114125730306.png)




![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114125743395.png)

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114125753990.png)


然后拼接可得


# misc38

需要下载HoneyView这个东西才行


然后一帧一帧的查看就可以

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114131141398.png)


9、17、36、40有部分flag，逐一提取。  
ctfshow{48b722b570c603ef58cc0b83bbf7680d}


# misc39


有脚本

```c
#二进制替换&二进制to char

from os import replace

f="""37 37 36 36 36 37 37 37 37 37 36 37 36 36 37 37 36 36 37 37 36 37 37 37 36 36 37 37 37 37 36 37 36 36 36 37 37 36 37 37 37 37 37 37 37 36 37 37 37 37 37 37 37 36 37 37 36 37 37 36 37 36 37 36 37 37 36 36 37 36 36 37 37 37 36 36 36 36 37 37 36 36 36 37 36 37 37 36 36 37 36 37 37 36 36 37 37 36 37 37 36 36 37 37 36 36 37 37 37 36 36 37 36 37 37 37 36 36 37 36 37 37 36 37 36 37 37 37 36 36 37 37 36 37 37 36 36 36 37 36 36 37 37 36 37 37 37 37 37 36 36 36 37 36 37 37 36 36 37 36 37 36 37 37 36 36 37 36 36 37 37 36 37 37 36 36 37 37 37 36 36 36 37 37 36 36 37 36 36 36 37 37 37 36 36 37 36 37 37 36 37 37 36 36 37 37 36 36 37 37 37 37 36 36 36 36 37 36 37 37 37 36 36 37 37 37 36 36 37 36 37 37 37 36 36 36 37 36 37 37 36 36 36 37 37 37 37 36 36 36 36 37 36 37 37 36 36 36 36 36 37 37 36 37 36 36 36 37 37 36 37 36 37 36 37 37 37 36 36 37 37 37 37 37 37 36 37"""

f=f.replace("36","0").replace("37","1")

a=f.split(' ')

flag=''

num=7

zu=len(a)//num

  

for i in range(zu):

    b=a[i*num:i*num+num]

    c=int("".join(str(j) for j in b),2)

    flag+=chr(c)

print(flag)

```


ctfshow{52812ff995fb7be268d963a9ebca0459}


# misc40


用软件处理完成后，每一帧都带一个文件

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114141511636.png)

然后拿脚本跑一下就行

脚本

```c
flag=""

for i in range(1,69):

    if(i<10):

        f = open('Z:/Desktop/misc40/apngframe0'+str(i)+'.txt')

    else:

        f = open('Z:/Desktop/misc40/apngframe'+str(i)+'.txt')

    s = f.read()

    flag += chr(int(s.split("/")[0][6:]))

print(flag)
```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114141738103.png)



# misc42


然后发现这些长度就是flag

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114141943670.png)


脚本转一下就行

```c
a="99,116,102,115,104,111,119,123,48,55,56,99,98,100,48,102,57,99,56,100,51,102,50,49,53,56,101,55,48,53,50,57,102,56,57,49,51,99,54,53,125"
c=a.split(',')
flag=""
for i in range(0,len(c)):
    flag+=chr(int(c[i]))
    print(flag)
print(flag)

```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114142112216.png)



# misc43

发现很多错误的CRC

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114142258516.png)


所以我们用CRC提取来进行，然后将他们提取然后hex转数据

```c
PNGDebugger.exe Z:\Desktop\misc43.png
        ----
file-path=Z:\Desktop\misc43.png
file-size=4560 bytes

0x00000000      png-signature=0x89504E470D0A1A0A

0x00000008      chunk-length=0x0000000D (13)
0x0000000C      chunk-type='IHDR'
0x0000001D      crc-code=0x09DAD161
>> (CRC CHECK)  crc-computed=0x09DAD161         =>      CRC OK!


0x00000021      chunk-length=0x00000180 (384)
0x00000025      chunk-type='IDAT'
0x000001A9      crc-code=0xE59387E5
>> (CRC CHECK)  crc-computed=0x8385F691         =>      CRC FAILED


0x000001AD      chunk-length=0x00000180 (384)
0x000001B1      chunk-type='IDAT'
0x00000335      crc-code=0x93A62E63
>> (CRC CHECK)  crc-computed=0x42434298         =>      CRC FAILED


0x00000339      chunk-length=0x00000180 (384)
0x0000033D      chunk-type='IDAT'
0x000004C1      crc-code=0x74667368
>> (CRC CHECK)  crc-computed=0x4462C3A1         =>      CRC FAILED


0x000004C5      chunk-length=0x00000180 (384)
0x000004C9      chunk-type='IDAT'
0x0000064D      crc-code=0x6F777B36
>> (CRC CHECK)  crc-computed=0x397611E1         =>      CRC FAILED


0x00000651      chunk-length=0x00000180 (384)
0x00000655      chunk-type='IDAT'
0x000007D9      crc-code=0x65623235
>> (CRC CHECK)  crc-computed=0x4F02AFA2         =>      CRC FAILED


0x000007DD      chunk-length=0x00000180 (384)
0x000007E1      chunk-type='IDAT'
0x00000965      crc-code=0x38396666
>> (CRC CHECK)  crc-computed=0xDEFED27F         =>      CRC FAILED


0x00000969      chunk-length=0x00000180 (384)
0x0000096D      chunk-type='IDAT'
0x00000AF1      crc-code=0x66663565
>> (CRC CHECK)  crc-computed=0x04F13EC2         =>      CRC FAILED


0x00000AF5      chunk-length=0x00000180 (384)
0x00000AF9      chunk-type='IDAT'
0x00000C7D      crc-code=0x33393066
>> (CRC CHECK)  crc-computed=0x665B7BEF         =>      CRC FAILED


0x00000C81      chunk-length=0x00000180 (384)
0x00000C85      chunk-type='IDAT'
0x00000E09      crc-code=0x65366238
>> (CRC CHECK)  crc-computed=0x66671DA0         =>      CRC FAILED


0x00000E0D      chunk-length=0x00000180 (384)
0x00000E11      chunk-type='IDAT'
0x00000F95      crc-code=0x37353034
>> (CRC CHECK)  crc-computed=0x9922F98F         =>      CRC FAILED


0x00000F99      chunk-length=0x00000180 (384)
0x00000F9D      chunk-type='IDAT'
0x00001121      crc-code=0x64626330
>> (CRC CHECK)  crc-computed=0x26BC187A         =>      CRC FAILED


0x00001125      chunk-length=0x00000093 (147)
0x00001129      chunk-type='IDAT'
0x000011C0      crc-code=0x3839327D
>> (CRC CHECK)  crc-computed=0xEE9D6CB4         =>      CRC FAILED


0x000011C4      chunk-length=0x00000000 (0)
0x000011C8      chunk-type='IEND'
0x000011CC      crc-code=0xAE426082
>> (CRC CHECK)  crc-computed=0xAE426082         =>      CRC OK!
```


然后转换一下就行

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114143210693.png)


ctfshow{6eb2589ffff5e390fe6b87504dbc0892}


# misc44

依旧用那个软件进行重定向

```c
	----
file-path=Z:\Desktop\misc44.png
file-size=400414 bytes

0x00000000	png-signature=0x89504E470D0A1A0A

0x00000008	chunk-length=0x0000000D	(13)
0x0000000C	chunk-type='IHDR'
0x0000001D	crc-code=0x09DAD161
>> (CRC CHECK)  crc-computed=0x09DAD161 	=>	CRC OK!


0x00000021	chunk-length=0x00000480	(1152)
0x00000025	chunk-type='IDAT'
0x000004A9	crc-code=0x8F84D7BB
>> (CRC CHECK)  crc-computed=0x8F84D7BB 	=>	CRC OK!


0x000004AD	chunk-length=0x00000480	(1152)
0x000004B1	chunk-type='IDAT'
0x00000935	crc-code=0xAAAF3DA3
>> (CRC CHECK)  crc-computed=0xAAAF3DA3 	=>	CRC OK!


0x00000939	chunk-length=0x00000480	(1152)
0x0000093D	chunk-type='IDAT'
0x00000DC1	crc-code=0xA12C36EC
>> (CRC CHECK)  crc-computed=0xA12C36EC 	=>	CRC OK!


0x00000DC5	chunk-length=0x00000480	(1152)
0x00000DC9	chunk-type='IDAT'
0x0000124D	crc-code=0xD80310A4
>> (CRC CHECK)  crc-computed=0xD80310A4 	=>	CRC OK!


0x00001251	chunk-length=0x00000480	(1152)
0x00001255	chunk-type='IDAT'
0x000016D9	crc-code=0x6FB2475E
>> (CRC CHECK)  crc-computed=0x6FB2475E 	=>	CRC OK!


0x000016DD	chunk-length=0x00000480	(1152)
0x000016E1	chunk-type='IDAT'
0x00001B65	crc-code=0xE7862D09
>> (CRC CHECK)  crc-computed=0xE7862D09 	=>	CRC OK!


0x00001B69	chunk-length=0x00000480	(1152)
0x00001B6D	chunk-type='IDAT'
0x00001FF1	crc-code=0xE6C5750A
>> (CRC CHECK)  crc-computed=0xE6C5750A 	=>	CRC OK!


0x00001FF5	chunk-length=0x00000480	(1152)
0x00001FF9	chunk-type='IDAT'
0x0000247D	crc-code=0x77A6E2FA
>> (CRC CHECK)  crc-computed=0x77A6E2FA 	=>	CRC OK!


0x00002481	chunk-length=0x00000480	(1152)
0x00002485	chunk-type='IDAT'
0x00002909	crc-code=0x3C4FB235
>> (CRC CHECK)  crc-computed=0x3C4FB235 	=>	CRC OK!


0x0000290D	chunk-length=0x00000480	(1152)
0x00002911	chunk-type='IDAT'
0x00002D95	crc-code=0xAE20299E
>> (CRC CHECK)  crc-computed=0xAE20299E 	=>	CRC OK!


0x00002D99	chunk-length=0x00000480	(1152)
0x00002D9D	chunk-type='IDAT'
0x00003221	crc-code=0xD0AE02D8
>> (CRC CHECK)  crc-computed=0xD0AE02D8 	=>	CRC OK!


0x00003225	chunk-length=0x00000480	(1152)
0x00003229	chunk-type='IDAT'
0x000036AD	crc-code=0x158CFE32
>> (CRC CHECK)  crc-computed=0x158CFE32 	=>	CRC OK!


0x000036B1	chunk-length=0x00000480	(1152)
0x000036B5	chunk-type='IDAT'
0x00003B39	crc-code=0x4D97126B
>> (CRC CHECK)  crc-computed=0x4D97126B 	=>	CRC OK!


0x00003B3D	chunk-length=0x00000480	(1152)
0x00003B41	chunk-type='IDAT'
0x00003FC5	crc-code=0xF633BC6E
>> (CRC CHECK)  crc-computed=0xF633BC6E 	=>	CRC OK!


0x00003FC9	chunk-length=0x00000480	(1152)
0x00003FCD	chunk-type='IDAT'
0x00004451	crc-code=0xC8255A59
>> (CRC CHECK)  crc-computed=0xC8255A59 	=>	CRC OK!


0x00004455	chunk-length=0x00000480	(1152)
0x00004459	chunk-type='IDAT'
0x000048DD	crc-code=0x238597F3
>> (CRC CHECK)  crc-computed=0x238597F3 	=>	CRC OK!


0x000048E1	chunk-length=0x00000480	(1152)
0x000048E5	chunk-type='IDAT'
0x00004D69	crc-code=0x1255BA67
>> (CRC CHECK)  crc-computed=0x25BE9607 	=>	CRC FAILED


0x00004D6D	chunk-length=0x00000480	(1152)
0x00004D71	chunk-type='IDAT'
0x000051F5	crc-code=0xF8D4A203
>> (CRC CHECK)  crc-computed=0xF8D4A203 	=>	CRC OK!


0x000051F9	chunk-length=0x00000480	(1152)
0x000051FD	chunk-type='IDAT'
0x00005681	crc-code=0x27598826
>> (CRC CHECK)  crc-computed=0x27598826 	=>	CRC OK!


0x00005685	chunk-length=0x00000480	(1152)
0x00005689	chunk-type='IDAT'
0x00005B0D	crc-code=0x0C58EA18
>> (CRC CHECK)  crc-computed=0xC5AD69A8 	=>	CRC FAILED


0x00005B11	chunk-length=0x00000480	(1152)
0x00005B15	chunk-type='IDAT'
0x00005F99	crc-code=0xEEA59158
>> (CRC CHECK)  crc-computed=0x0B8AC976 	=>	CRC FAILED


0x00005F9D	chunk-length=0x00000480	(1152)
0x00005FA1	chunk-type='IDAT'
0x00006425	crc-code=0x80532912
>> (CRC CHECK)  crc-computed=0xFBC47A7D 	=>	CRC FAILED


0x00006429	chunk-length=0x00000480	(1152)
0x0000642D	chunk-type='IDAT'
0x000068B1	crc-code=0x4AC09656
>> (CRC CHECK)  crc-computed=0x4AC09656 	=>	CRC OK!


0x000068B5	chunk-length=0x00000480	(1152)
0x000068B9	chunk-type='IDAT'
0x00006D3D	crc-code=0x6E727B44
>> (CRC CHECK)  crc-computed=0x6E727B44 	=>	CRC OK!


0x00006D41	chunk-length=0x00000480	(1152)
0x00006D45	chunk-type='IDAT'
0x000071C9	crc-code=0x8CBE49E9
>> (CRC CHECK)  crc-computed=0xE2193E66 	=>	CRC FAILED


0x000071CD	chunk-length=0x00000480	(1152)
0x000071D1	chunk-type='IDAT'
0x00007655	crc-code=0xCD3579C1
>> (CRC CHECK)  crc-computed=0xCD3579C1 	=>	CRC OK!


0x00007659	chunk-length=0x00000480	(1152)
0x0000765D	chunk-type='IDAT'
0x00007AE1	crc-code=0x64E9AB23
>> (CRC CHECK)  crc-computed=0x64E9AB23 	=>	CRC OK!


0x00007AE5	chunk-length=0x00000480	(1152)
0x00007AE9	chunk-type='IDAT'
0x00007F6D	crc-code=0x1FDFF041
>> (CRC CHECK)  crc-computed=0x1FDFF041 	=>	CRC OK!


0x00007F71	chunk-length=0x00000480	(1152)
0x00007F75	chunk-type='IDAT'
0x000083F9	crc-code=0x77BB66E5
>> (CRC CHECK)  crc-computed=0x3FF7995E 	=>	CRC FAILED


0x000083FD	chunk-length=0x00000480	(1152)
0x00008401	chunk-type='IDAT'
0x00008885	crc-code=0x8BCCE3E9
>> (CRC CHECK)  crc-computed=0x8BCCE3E9 	=>	CRC OK!


0x00008889	chunk-length=0x00000480	(1152)
0x0000888D	chunk-type='IDAT'
0x00008D11	crc-code=0x9D13B23F
>> (CRC CHECK)  crc-computed=0xE7232C9D 	=>	CRC FAILED


0x00008D15	chunk-length=0x00000480	(1152)
0x00008D19	chunk-type='IDAT'
0x0000919D	crc-code=0x5C07ECC4
>> (CRC CHECK)  crc-computed=0x7D130CC5 	=>	CRC FAILED


0x000091A1	chunk-length=0x00000480	(1152)
0x000091A5	chunk-type='IDAT'
0x00009629	crc-code=0xA66403E8
>> (CRC CHECK)  crc-computed=0xC4DDBAF9 	=>	CRC FAILED


0x0000962D	chunk-length=0x00000480	(1152)
0x00009631	chunk-type='IDAT'
0x00009AB5	crc-code=0x65135871
>> (CRC CHECK)  crc-computed=0x65135871 	=>	CRC OK!


0x00009AB9	chunk-length=0x00000480	(1152)
0x00009ABD	chunk-type='IDAT'
0x00009F41	crc-code=0x5D74DEB5
>> (CRC CHECK)  crc-computed=0x5D74DEB5 	=>	CRC OK!


0x00009F45	chunk-length=0x00000480	(1152)
0x00009F49	chunk-type='IDAT'
0x0000A3CD	crc-code=0xE415FB46
>> (CRC CHECK)  crc-computed=0xAF58AA53 	=>	CRC FAILED


0x0000A3D1	chunk-length=0x00000480	(1152)
0x0000A3D5	chunk-type='IDAT'
0x0000A859	crc-code=0x11C2775C
>> (CRC CHECK)  crc-computed=0x2DDE8220 	=>	CRC FAILED


0x0000A85D	chunk-length=0x00000480	(1152)
0x0000A861	chunk-type='IDAT'
0x0000ACE5	crc-code=0x73EA7318
>> (CRC CHECK)  crc-computed=0x73EA7318 	=>	CRC OK!


0x0000ACE9	chunk-length=0x00000480	(1152)
0x0000ACED	chunk-type='IDAT'
0x0000B171	crc-code=0xC7EB5138
>> (CRC CHECK)  crc-computed=0xC7EB5138 	=>	CRC OK!


0x0000B175	chunk-length=0x00000480	(1152)
0x0000B179	chunk-type='IDAT'
0x0000B5FD	crc-code=0x7E384B98
>> (CRC CHECK)  crc-computed=0x877D2D4B 	=>	CRC FAILED


0x0000B601	chunk-length=0x00000480	(1152)
0x0000B605	chunk-type='IDAT'
0x0000BA89	crc-code=0xE7B03BFF
>> (CRC CHECK)  crc-computed=0xA562FAC7 	=>	CRC FAILED


0x0000BA8D	chunk-length=0x00000480	(1152)
0x0000BA91	chunk-type='IDAT'
0x0000BF15	crc-code=0x43BAB662
>> (CRC CHECK)  crc-computed=0x43BAB662 	=>	CRC OK!


0x0000BF19	chunk-length=0x00000480	(1152)
0x0000BF1D	chunk-type='IDAT'
0x0000C3A1	crc-code=0x9E45D2FC
>> (CRC CHECK)  crc-computed=0x9E45D2FC 	=>	CRC OK!


0x0000C3A5	chunk-length=0x00000480	(1152)
0x0000C3A9	chunk-type='IDAT'
0x0000C82D	crc-code=0xA422A27E
>> (CRC CHECK)  crc-computed=0xA422A27E 	=>	CRC OK!


0x0000C831	chunk-length=0x00000480	(1152)
0x0000C835	chunk-type='IDAT'
0x0000CCB9	crc-code=0xE0B4BC79
>> (CRC CHECK)  crc-computed=0x3FBC67FE 	=>	CRC FAILED


0x0000CCBD	chunk-length=0x00000480	(1152)
0x0000CCC1	chunk-type='IDAT'
0x0000D145	crc-code=0x46963EDF
>> (CRC CHECK)  crc-computed=0x87B023AC 	=>	CRC FAILED


0x0000D149	chunk-length=0x00000480	(1152)
0x0000D14D	chunk-type='IDAT'
0x0000D5D1	crc-code=0x9A08A663
>> (CRC CHECK)  crc-computed=0x9A08A663 	=>	CRC OK!


0x0000D5D5	chunk-length=0x00000480	(1152)
0x0000D5D9	chunk-type='IDAT'
0x0000DA5D	crc-code=0x73995278
>> (CRC CHECK)  crc-computed=0x73995278 	=>	CRC OK!


0x0000DA61	chunk-length=0x00000480	(1152)
0x0000DA65	chunk-type='IDAT'
0x0000DEE9	crc-code=0x72F6ECEE
>> (CRC CHECK)  crc-computed=0xD2D0B1A9 	=>	CRC FAILED


0x0000DEED	chunk-length=0x00000480	(1152)
0x0000DEF1	chunk-type='IDAT'
0x0000E375	crc-code=0x2247B081
>> (CRC CHECK)  crc-computed=0x2247B081 	=>	CRC OK!


0x0000E379	chunk-length=0x00000480	(1152)
0x0000E37D	chunk-type='IDAT'
0x0000E801	crc-code=0x05C652DA
>> (CRC CHECK)  crc-computed=0x05C652DA 	=>	CRC OK!


0x0000E805	chunk-length=0x00000480	(1152)
0x0000E809	chunk-type='IDAT'
0x0000EC8D	crc-code=0xF22185C0
>> (CRC CHECK)  crc-computed=0xBCD38AA1 	=>	CRC FAILED


0x0000EC91	chunk-length=0x00000480	(1152)
0x0000EC95	chunk-type='IDAT'
0x0000F119	crc-code=0xB045B48B
>> (CRC CHECK)  crc-computed=0xB045B48B 	=>	CRC OK!


0x0000F11D	chunk-length=0x00000480	(1152)
0x0000F121	chunk-type='IDAT'
0x0000F5A5	crc-code=0x20146D92
>> (CRC CHECK)  crc-computed=0x87DE0822 	=>	CRC FAILED


0x0000F5A9	chunk-length=0x00000480	(1152)
0x0000F5AD	chunk-type='IDAT'
0x0000FA31	crc-code=0xE27F251E
>> (CRC CHECK)  crc-computed=0xA3756A00 	=>	CRC FAILED


0x0000FA35	chunk-length=0x00000480	(1152)
0x0000FA39	chunk-type='IDAT'
0x0000FEBD	crc-code=0x81A6BBAB
>> (CRC CHECK)  crc-computed=0x84C43C58 	=>	CRC FAILED


0x0000FEC1	chunk-length=0x00000480	(1152)
0x0000FEC5	chunk-type='IDAT'
0x00010349	crc-code=0x29225156
>> (CRC CHECK)  crc-computed=0xC1378011 	=>	CRC FAILED


0x0001034D	chunk-length=0x00000480	(1152)
0x00010351	chunk-type='IDAT'
0x000107D5	crc-code=0x15965911
>> (CRC CHECK)  crc-computed=0x15965911 	=>	CRC OK!


0x000107D9	chunk-length=0x00000480	(1152)
0x000107DD	chunk-type='IDAT'
0x00010C61	crc-code=0xD791866F
>> (CRC CHECK)  crc-computed=0xD791866F 	=>	CRC OK!


0x00010C65	chunk-length=0x00000480	(1152)
0x00010C69	chunk-type='IDAT'
0x000110ED	crc-code=0x8AED7363
>> (CRC CHECK)  crc-computed=0xFCA5FD6D 	=>	CRC FAILED


0x000110F1	chunk-length=0x00000480	(1152)
0x000110F5	chunk-type='IDAT'
0x00011579	crc-code=0xB8C8C682
>> (CRC CHECK)  crc-computed=0xB8C8C682 	=>	CRC OK!


0x0001157D	chunk-length=0x00000480	(1152)
0x00011581	chunk-type='IDAT'
0x00011A05	crc-code=0x4B86B995
>> (CRC CHECK)  crc-computed=0x4B86B995 	=>	CRC OK!


0x00011A09	chunk-length=0x00000480	(1152)
0x00011A0D	chunk-type='IDAT'
0x00011E91	crc-code=0x9C00346C
>> (CRC CHECK)  crc-computed=0x9C00346C 	=>	CRC OK!


0x00011E95	chunk-length=0x00000480	(1152)
0x00011E99	chunk-type='IDAT'
0x0001231D	crc-code=0xB7AA8270
>> (CRC CHECK)  crc-computed=0xB7AA8270 	=>	CRC OK!


0x00012321	chunk-length=0x00000480	(1152)
0x00012325	chunk-type='IDAT'
0x000127A9	crc-code=0x57142A7A
>> (CRC CHECK)  crc-computed=0xFC196730 	=>	CRC FAILED


0x000127AD	chunk-length=0x00000480	(1152)
0x000127B1	chunk-type='IDAT'
0x00012C35	crc-code=0xD9937FEA
>> (CRC CHECK)  crc-computed=0xD9937FEA 	=>	CRC OK!


0x00012C39	chunk-length=0x00000480	(1152)
0x00012C3D	chunk-type='IDAT'
0x000130C1	crc-code=0x52EEBBF6
>> (CRC CHECK)  crc-computed=0x52EEBBF6 	=>	CRC OK!


0x000130C5	chunk-length=0x00000480	(1152)
0x000130C9	chunk-type='IDAT'
0x0001354D	crc-code=0x9A7EAE29
>> (CRC CHECK)  crc-computed=0x9A7EAE29 	=>	CRC OK!


0x00013551	chunk-length=0x00000480	(1152)
0x00013555	chunk-type='IDAT'
0x000139D9	crc-code=0x5B196779
>> (CRC CHECK)  crc-computed=0x04D5DF85 	=>	CRC FAILED


0x000139DD	chunk-length=0x00000480	(1152)
0x000139E1	chunk-type='IDAT'
0x00013E65	crc-code=0xD9646774
>> (CRC CHECK)  crc-computed=0xD9646774 	=>	CRC OK!


0x00013E69	chunk-length=0x00000480	(1152)
0x00013E6D	chunk-type='IDAT'
0x000142F1	crc-code=0x03DCD4D8
>> (CRC CHECK)  crc-computed=0x03DCD4D8 	=>	CRC OK!


0x000142F5	chunk-length=0x00000480	(1152)
0x000142F9	chunk-type='IDAT'
0x0001477D	crc-code=0xEB9E8B6A
>> (CRC CHECK)  crc-computed=0xEB9E8B6A 	=>	CRC OK!


0x00014781	chunk-length=0x00000480	(1152)
0x00014785	chunk-type='IDAT'
0x00014C09	crc-code=0x53FEFED9
>> (CRC CHECK)  crc-computed=0xA2F5CFC1 	=>	CRC FAILED


0x00014C0D	chunk-length=0x00000480	(1152)
0x00014C11	chunk-type='IDAT'
0x00015095	crc-code=0x6CE3DD1C
>> (CRC CHECK)  crc-computed=0x6CE3DD1C 	=>	CRC OK!


0x00015099	chunk-length=0x00000480	(1152)
0x0001509D	chunk-type='IDAT'
0x00015521	crc-code=0x7AA6B9E0
>> (CRC CHECK)  crc-computed=0x7AA6B9E0 	=>	CRC OK!


0x00015525	chunk-length=0x00000480	(1152)
0x00015529	chunk-type='IDAT'
0x000159AD	crc-code=0x943CA313
>> (CRC CHECK)  crc-computed=0x943CA313 	=>	CRC OK!


0x000159B1	chunk-length=0x00000480	(1152)
0x000159B5	chunk-type='IDAT'
0x00015E39	crc-code=0x7CA129BF
>> (CRC CHECK)  crc-computed=0x7CA129BF 	=>	CRC OK!


0x00015E3D	chunk-length=0x00000480	(1152)
0x00015E41	chunk-type='IDAT'
0x000162C5	crc-code=0xF0DB5329
>> (CRC CHECK)  crc-computed=0x59478B7B 	=>	CRC FAILED


0x000162C9	chunk-length=0x00000480	(1152)
0x000162CD	chunk-type='IDAT'
0x00016751	crc-code=0x9D6A5548
>> (CRC CHECK)  crc-computed=0x9D6A5548 	=>	CRC OK!


0x00016755	chunk-length=0x00000480	(1152)
0x00016759	chunk-type='IDAT'
0x00016BDD	crc-code=0x06935820
>> (CRC CHECK)  crc-computed=0x06935820 	=>	CRC OK!


0x00016BE1	chunk-length=0x00000480	(1152)
0x00016BE5	chunk-type='IDAT'
0x00017069	crc-code=0x4577B9F9
>> (CRC CHECK)  crc-computed=0xF5AC4674 	=>	CRC FAILED


0x0001706D	chunk-length=0x00000480	(1152)
0x00017071	chunk-type='IDAT'
0x000174F5	crc-code=0xEC1244CF
>> (CRC CHECK)  crc-computed=0xEC1244CF 	=>	CRC OK!


0x000174F9	chunk-length=0x00000480	(1152)
0x000174FD	chunk-type='IDAT'
0x00017981	crc-code=0x59DC7542
>> (CRC CHECK)  crc-computed=0x59DC7542 	=>	CRC OK!


0x00017985	chunk-length=0x00000480	(1152)
0x00017989	chunk-type='IDAT'
0x00017E0D	crc-code=0xA08B787C
>> (CRC CHECK)  crc-computed=0xB82E5B90 	=>	CRC FAILED


0x00017E11	chunk-length=0x00000480	(1152)
0x00017E15	chunk-type='IDAT'
0x00018299	crc-code=0x19DFEDB5
>> (CRC CHECK)  crc-computed=0xF4C804D2 	=>	CRC FAILED


0x0001829D	chunk-length=0x00000480	(1152)
0x000182A1	chunk-type='IDAT'
0x00018725	crc-code=0xD3E4DFE4
>> (CRC CHECK)  crc-computed=0x6E1FE0FA 	=>	CRC FAILED


0x00018729	chunk-length=0x00000480	(1152)
0x0001872D	chunk-type='IDAT'
0x00018BB1	crc-code=0x3577951F
>> (CRC CHECK)  crc-computed=0x3577951F 	=>	CRC OK!


0x00018BB5	chunk-length=0x00000480	(1152)
0x00018BB9	chunk-type='IDAT'
0x0001903D	crc-code=0x7DF6D070
>> (CRC CHECK)  crc-computed=0x7DF6D070 	=>	CRC OK!


0x00019041	chunk-length=0x00000480	(1152)
0x00019045	chunk-type='IDAT'
0x000194C9	crc-code=0x00058CFE
>> (CRC CHECK)  crc-computed=0x03548C09 	=>	CRC FAILED


0x000194CD	chunk-length=0x00000480	(1152)
0x000194D1	chunk-type='IDAT'
0x00019955	crc-code=0xECC877B4
>> (CRC CHECK)  crc-computed=0xECC877B4 	=>	CRC OK!


0x00019959	chunk-length=0x00000480	(1152)
0x0001995D	chunk-type='IDAT'
0x00019DE1	crc-code=0xE843557E
>> (CRC CHECK)  crc-computed=0xE843557E 	=>	CRC OK!


0x00019DE5	chunk-length=0x00000480	(1152)
0x00019DE9	chunk-type='IDAT'
0x0001A26D	crc-code=0x8CCA3FAD
>> (CRC CHECK)  crc-computed=0x8C94D9E5 	=>	CRC FAILED


0x0001A271	chunk-length=0x00000480	(1152)
0x0001A275	chunk-type='IDAT'
0x0001A6F9	crc-code=0xFDB49243
>> (CRC CHECK)  crc-computed=0x03631905 	=>	CRC FAILED


0x0001A6FD	chunk-length=0x00000480	(1152)
0x0001A701	chunk-type='IDAT'
0x0001AB85	crc-code=0x826DA97D
>> (CRC CHECK)  crc-computed=0xAD156405 	=>	CRC FAILED


0x0001AB89	chunk-length=0x00000480	(1152)
0x0001AB8D	chunk-type='IDAT'
0x0001B011	crc-code=0xCECAC338
>> (CRC CHECK)  crc-computed=0xCECAC338 	=>	CRC OK!


0x0001B015	chunk-length=0x00000480	(1152)
0x0001B019	chunk-type='IDAT'
0x0001B49D	crc-code=0x81BC7004
>> (CRC CHECK)  crc-computed=0x81BC7004 	=>	CRC OK!


0x0001B4A1	chunk-length=0x00000480	(1152)
0x0001B4A5	chunk-type='IDAT'
0x0001B929	crc-code=0x8ECD7880
>> (CRC CHECK)  crc-computed=0x8E5EB676 	=>	CRC FAILED


0x0001B92D	chunk-length=0x00000480	(1152)
0x0001B931	chunk-type='IDAT'
0x0001BDB5	crc-code=0x7277448D
>> (CRC CHECK)  crc-computed=0xC26549BE 	=>	CRC FAILED


0x0001BDB9	chunk-length=0x00000480	(1152)
0x0001BDBD	chunk-type='IDAT'
0x0001C241	crc-code=0xBB322334
>> (CRC CHECK)  crc-computed=0xBB322334 	=>	CRC OK!


0x0001C245	chunk-length=0x00000480	(1152)
0x0001C249	chunk-type='IDAT'
0x0001C6CD	crc-code=0x3A9188FA
>> (CRC CHECK)  crc-computed=0x3A9188FA 	=>	CRC OK!


0x0001C6D1	chunk-length=0x00000480	(1152)
0x0001C6D5	chunk-type='IDAT'
0x0001CB59	crc-code=0x4E2064D9
>> (CRC CHECK)  crc-computed=0x9AC03D2D 	=>	CRC FAILED


0x0001CB5D	chunk-length=0x00000480	(1152)
0x0001CB61	chunk-type='IDAT'
0x0001CFE5	crc-code=0x05459E0C
>> (CRC CHECK)  crc-computed=0x1B90E14D 	=>	CRC FAILED


0x0001CFE9	chunk-length=0x00000480	(1152)
0x0001CFED	chunk-type='IDAT'
0x0001D471	crc-code=0x054F0445
>> (CRC CHECK)  crc-computed=0x4289660B 	=>	CRC FAILED


0x0001D475	chunk-length=0x00000480	(1152)
0x0001D479	chunk-type='IDAT'
0x0001D8FD	crc-code=0x58C654BD
>> (CRC CHECK)  crc-computed=0x58C654BD 	=>	CRC OK!


0x0001D901	chunk-length=0x00000480	(1152)
0x0001D905	chunk-type='IDAT'
0x0001DD89	crc-code=0x680357FA
>> (CRC CHECK)  crc-computed=0xE2AC15EB 	=>	CRC FAILED


0x0001DD8D	chunk-length=0x00000480	(1152)
0x0001DD91	chunk-type='IDAT'
0x0001E215	crc-code=0x8BECB3BC
>> (CRC CHECK)  crc-computed=0x8BECB3BC 	=>	CRC OK!


0x0001E219	chunk-length=0x00000480	(1152)
0x0001E21D	chunk-type='IDAT'
0x0001E6A1	crc-code=0xDA693162
>> (CRC CHECK)  crc-computed=0xDA693162 	=>	CRC OK!


0x0001E6A5	chunk-length=0x00000480	(1152)
0x0001E6A9	chunk-type='IDAT'
0x0001EB2D	crc-code=0x9BDFE9B4
>> (CRC CHECK)  crc-computed=0x80A09ED3 	=>	CRC FAILED


0x0001EB31	chunk-length=0x00000480	(1152)
0x0001EB35	chunk-type='IDAT'
0x0001EFB9	crc-code=0x91C1A359
>> (CRC CHECK)  crc-computed=0x305665F8 	=>	CRC FAILED


0x0001EFBD	chunk-length=0x00000480	(1152)
0x0001EFC1	chunk-type='IDAT'
0x0001F445	crc-code=0x9940CDAD
>> (CRC CHECK)  crc-computed=0x9A33DFAD 	=>	CRC FAILED


0x0001F449	chunk-length=0x00000480	(1152)
0x0001F44D	chunk-type='IDAT'
0x0001F8D1	crc-code=0xA3CD92E7
>> (CRC CHECK)  crc-computed=0xF60F1260 	=>	CRC FAILED


0x0001F8D5	chunk-length=0x00000480	(1152)
0x0001F8D9	chunk-type='IDAT'
0x0001FD5D	crc-code=0x7777DE2C
>> (CRC CHECK)  crc-computed=0x7777DE2C 	=>	CRC OK!


0x0001FD61	chunk-length=0x00000480	(1152)
0x0001FD65	chunk-type='IDAT'
0x000201E9	crc-code=0x5D849FC4
>> (CRC CHECK)  crc-computed=0x3D512FF3 	=>	CRC FAILED


0x000201ED	chunk-length=0x00000480	(1152)
0x000201F1	chunk-type='IDAT'
0x00020675	crc-code=0x124CF86F
>> (CRC CHECK)  crc-computed=0x124CF86F 	=>	CRC OK!


0x00020679	chunk-length=0x00000480	(1152)
0x0002067D	chunk-type='IDAT'
0x00020B01	crc-code=0x6D0702C0
>> (CRC CHECK)  crc-computed=0x6D0702C0 	=>	CRC OK!


0x00020B05	chunk-length=0x00000480	(1152)
0x00020B09	chunk-type='IDAT'
0x00020F8D	crc-code=0xD5EFFBE8
>> (CRC CHECK)  crc-computed=0xA45A409D 	=>	CRC FAILED


0x00020F91	chunk-length=0x00000480	(1152)
0x00020F95	chunk-type='IDAT'
0x00021419	crc-code=0xBB29D52E
>> (CRC CHECK)  crc-computed=0x03E2B6DD 	=>	CRC FAILED


0x0002141D	chunk-length=0x00000480	(1152)
0x00021421	chunk-type='IDAT'
0x000218A5	crc-code=0x00868A2C
>> (CRC CHECK)  crc-computed=0x00868A2C 	=>	CRC OK!


0x000218A9	chunk-length=0x00000480	(1152)
0x000218AD	chunk-type='IDAT'
0x00021D31	crc-code=0xEF2D860F
>> (CRC CHECK)  crc-computed=0xEF2D860F 	=>	CRC OK!


0x00021D35	chunk-length=0x00000480	(1152)
0x00021D39	chunk-type='IDAT'
0x000221BD	crc-code=0xE540FB19
>> (CRC CHECK)  crc-computed=0xB9BD75C6 	=>	CRC FAILED


0x000221C1	chunk-length=0x00000480	(1152)
0x000221C5	chunk-type='IDAT'
0x00022649	crc-code=0xA01E51EC
>> (CRC CHECK)  crc-computed=0x9C225988 	=>	CRC FAILED


0x0002264D	chunk-length=0x00000480	(1152)
0x00022651	chunk-type='IDAT'
0x00022AD5	crc-code=0xEDA26B66
>> (CRC CHECK)  crc-computed=0xB6F8AF76 	=>	CRC FAILED


0x00022AD9	chunk-length=0x00000480	(1152)
0x00022ADD	chunk-type='IDAT'
0x00022F61	crc-code=0x19B6B334
>> (CRC CHECK)  crc-computed=0x19B6B334 	=>	CRC OK!


0x00022F65	chunk-length=0x00000480	(1152)
0x00022F69	chunk-type='IDAT'
0x000233ED	crc-code=0x91669E60
>> (CRC CHECK)  crc-computed=0x91669E60 	=>	CRC OK!


0x000233F1	chunk-length=0x00000480	(1152)
0x000233F5	chunk-type='IDAT'
0x00023879	crc-code=0xB357A542
>> (CRC CHECK)  crc-computed=0x9E81C99C 	=>	CRC FAILED


0x0002387D	chunk-length=0x00000480	(1152)
0x00023881	chunk-type='IDAT'
0x00023D05	crc-code=0xD9595778
>> (CRC CHECK)  crc-computed=0xE15B80AA 	=>	CRC FAILED


0x00023D09	chunk-length=0x00000480	(1152)
0x00023D0D	chunk-type='IDAT'
0x00024191	crc-code=0x60EC49E0
>> (CRC CHECK)  crc-computed=0x60EC49E0 	=>	CRC OK!


0x00024195	chunk-length=0x00000480	(1152)
0x00024199	chunk-type='IDAT'
0x0002461D	crc-code=0xC03587AA
>> (CRC CHECK)  crc-computed=0xC03587AA 	=>	CRC OK!


0x00024621	chunk-length=0x00000480	(1152)
0x00024625	chunk-type='IDAT'
0x00024AA9	crc-code=0xBDDF8C91
>> (CRC CHECK)  crc-computed=0x87B20D27 	=>	CRC FAILED


0x00024AAD	chunk-length=0x00000480	(1152)
0x00024AB1	chunk-type='IDAT'
0x00024F35	crc-code=0x01724F4B
>> (CRC CHECK)  crc-computed=0x8DEBF9A9 	=>	CRC FAILED


0x00024F39	chunk-length=0x00000480	(1152)
0x00024F3D	chunk-type='IDAT'
0x000253C1	crc-code=0x427017FF
>> (CRC CHECK)  crc-computed=0x427017FF 	=>	CRC OK!


0x000253C5	chunk-length=0x00000480	(1152)
0x000253C9	chunk-type='IDAT'
0x0002584D	crc-code=0x4D59BE81
>> (CRC CHECK)  crc-computed=0x4D59BE81 	=>	CRC OK!


0x00025851	chunk-length=0x00000480	(1152)
0x00025855	chunk-type='IDAT'
0x00025CD9	crc-code=0x41A27F53
>> (CRC CHECK)  crc-computed=0xA3BD2FDB 	=>	CRC FAILED


0x00025CDD	chunk-length=0x00000480	(1152)
0x00025CE1	chunk-type='IDAT'
0x00026165	crc-code=0x9142B3C5
>> (CRC CHECK)  crc-computed=0xC48BA7DB 	=>	CRC FAILED


0x00026169	chunk-length=0x00000480	(1152)
0x0002616D	chunk-type='IDAT'
0x000265F1	crc-code=0x2A0A5132
>> (CRC CHECK)  crc-computed=0x2A0A5132 	=>	CRC OK!


0x000265F5	chunk-length=0x00000480	(1152)
0x000265F9	chunk-type='IDAT'
0x00026A7D	crc-code=0x41C6F77F
>> (CRC CHECK)  crc-computed=0x4D524639 	=>	CRC FAILED


0x00026A81	chunk-length=0x00000480	(1152)
0x00026A85	chunk-type='IDAT'
0x00026F09	crc-code=0xF97A1949
>> (CRC CHECK)  crc-computed=0xB09AFA97 	=>	CRC FAILED


0x00026F0D	chunk-length=0x00000480	(1152)
0x00026F11	chunk-type='IDAT'
0x00027395	crc-code=0xD6E3CF8B
>> (CRC CHECK)  crc-computed=0xD6E3CF8B 	=>	CRC OK!


0x00027399	chunk-length=0x00000480	(1152)
0x0002739D	chunk-type='IDAT'
0x00027821	crc-code=0x0F569878
>> (CRC CHECK)  crc-computed=0x0F569878 	=>	CRC OK!


0x00027825	chunk-length=0x00000480	(1152)
0x00027829	chunk-type='IDAT'
0x00027CAD	crc-code=0x78F4F9F4
>> (CRC CHECK)  crc-computed=0xA46E8341 	=>	CRC FAILED


0x00027CB1	chunk-length=0x00000480	(1152)
0x00027CB5	chunk-type='IDAT'
0x00028139	crc-code=0xD767FF4F
>> (CRC CHECK)  crc-computed=0xB5447676 	=>	CRC FAILED


0x0002813D	chunk-length=0x00000480	(1152)
0x00028141	chunk-type='IDAT'
0x000285C5	crc-code=0xAFA4C2F7
>> (CRC CHECK)  crc-computed=0x738FE2C5 	=>	CRC FAILED


0x000285C9	chunk-length=0x00000480	(1152)
0x000285CD	chunk-type='IDAT'
0x00028A51	crc-code=0x554F773D
>> (CRC CHECK)  crc-computed=0x554F773D 	=>	CRC OK!


0x00028A55	chunk-length=0x00000480	(1152)
0x00028A59	chunk-type='IDAT'
0x00028EDD	crc-code=0x6DA1482B
>> (CRC CHECK)  crc-computed=0x8B968078 	=>	CRC FAILED


0x00028EE1	chunk-length=0x00000480	(1152)
0x00028EE5	chunk-type='IDAT'
0x00029369	crc-code=0xF5162EA5
>> (CRC CHECK)  crc-computed=0x5AAB4642 	=>	CRC FAILED


0x0002936D	chunk-length=0x00000480	(1152)
0x00029371	chunk-type='IDAT'
0x000297F5	crc-code=0xE2A260D7
>> (CRC CHECK)  crc-computed=0xE2A260D7 	=>	CRC OK!


0x000297F9	chunk-length=0x00000480	(1152)
0x000297FD	chunk-type='IDAT'
0x00029C81	crc-code=0xD53CA557
>> (CRC CHECK)  crc-computed=0xD53CA557 	=>	CRC OK!


0x00029C85	chunk-length=0x00000480	(1152)
0x00029C89	chunk-type='IDAT'
0x0002A10D	crc-code=0x8691B587
>> (CRC CHECK)  crc-computed=0xE4255D5B 	=>	CRC FAILED


0x0002A111	chunk-length=0x00000480	(1152)
0x0002A115	chunk-type='IDAT'
0x0002A599	crc-code=0x099A9BAB
>> (CRC CHECK)  crc-computed=0x9A802B41 	=>	CRC FAILED


0x0002A59D	chunk-length=0x00000480	(1152)
0x0002A5A1	chunk-type='IDAT'
0x0002AA25	crc-code=0xF1E854E3
>> (CRC CHECK)  crc-computed=0xF1E854E3 	=>	CRC OK!


0x0002AA29	chunk-length=0x00000480	(1152)
0x0002AA2D	chunk-type='IDAT'
0x0002AEB1	crc-code=0x6B72BCE9
>> (CRC CHECK)  crc-computed=0x6B72BCE9 	=>	CRC OK!


0x0002AEB5	chunk-length=0x00000480	(1152)
0x0002AEB9	chunk-type='IDAT'
0x0002B33D	crc-code=0x4CEA0D83
>> (CRC CHECK)  crc-computed=0xB4662F16 	=>	CRC FAILED


0x0002B341	chunk-length=0x00000480	(1152)
0x0002B345	chunk-type='IDAT'
0x0002B7C9	crc-code=0x6A2A92EE
>> (CRC CHECK)  crc-computed=0x81D80818 	=>	CRC FAILED


0x0002B7CD	chunk-length=0x00000480	(1152)
0x0002B7D1	chunk-type='IDAT'
0x0002BC55	crc-code=0x547D9DC6
>> (CRC CHECK)  crc-computed=0xDC792B4C 	=>	CRC FAILED


0x0002BC59	chunk-length=0x00000480	(1152)
0x0002BC5D	chunk-type='IDAT'
0x0002C0E1	crc-code=0xAB9C7D46
>> (CRC CHECK)  crc-computed=0xAB9C7D46 	=>	CRC OK!


0x0002C0E5	chunk-length=0x00000480	(1152)
0x0002C0E9	chunk-type='IDAT'
0x0002C56D	crc-code=0xBD33C6FF
>> (CRC CHECK)  crc-computed=0xBD33C6FF 	=>	CRC OK!


0x0002C571	chunk-length=0x00000480	(1152)
0x0002C575	chunk-type='IDAT'
0x0002C9F9	crc-code=0xF5843B5F
>> (CRC CHECK)  crc-computed=0xF5843B5F 	=>	CRC OK!


0x0002C9FD	chunk-length=0x00000480	(1152)
0x0002CA01	chunk-type='IDAT'
0x0002CE85	crc-code=0x31687B65
>> (CRC CHECK)  crc-computed=0x5DDA02D3 	=>	CRC FAILED


0x0002CE89	chunk-length=0x00000480	(1152)
0x0002CE8D	chunk-type='IDAT'
0x0002D311	crc-code=0xD59D5DCC
>> (CRC CHECK)  crc-computed=0x7031BD44 	=>	CRC FAILED


0x0002D315	chunk-length=0x00000480	(1152)
0x0002D319	chunk-type='IDAT'
0x0002D79D	crc-code=0xE88B933D
>> (CRC CHECK)  crc-computed=0xE88B933D 	=>	CRC OK!


0x0002D7A1	chunk-length=0x00000480	(1152)
0x0002D7A5	chunk-type='IDAT'
0x0002DC29	crc-code=0xBA653817
>> (CRC CHECK)  crc-computed=0x9FCE1695 	=>	CRC FAILED


0x0002DC2D	chunk-length=0x00000480	(1152)
0x0002DC31	chunk-type='IDAT'
0x0002E0B5	crc-code=0x4FE0FCA2
>> (CRC CHECK)  crc-computed=0xBC34205E 	=>	CRC FAILED


0x0002E0B9	chunk-length=0x00000480	(1152)
0x0002E0BD	chunk-type='IDAT'
0x0002E541	crc-code=0x9BBB1BAE
>> (CRC CHECK)  crc-computed=0x9BBB1BAE 	=>	CRC OK!


0x0002E545	chunk-length=0x00000480	(1152)
0x0002E549	chunk-type='IDAT'
0x0002E9CD	crc-code=0x33199F94
>> (CRC CHECK)  crc-computed=0x33199F94 	=>	CRC OK!


0x0002E9D1	chunk-length=0x00000480	(1152)
0x0002E9D5	chunk-type='IDAT'
0x0002EE59	crc-code=0x51EE09D8
>> (CRC CHECK)  crc-computed=0x9472F50D 	=>	CRC FAILED


0x0002EE5D	chunk-length=0x00000480	(1152)
0x0002EE61	chunk-type='IDAT'
0x0002F2E5	crc-code=0xDF39AC29
>> (CRC CHECK)  crc-computed=0xDF39AC29 	=>	CRC OK!


0x0002F2E9	chunk-length=0x00000480	(1152)
0x0002F2ED	chunk-type='IDAT'
0x0002F771	crc-code=0x846E4A36
>> (CRC CHECK)  crc-computed=0x846E4A36 	=>	CRC OK!


0x0002F775	chunk-length=0x00000480	(1152)
0x0002F779	chunk-type='IDAT'
0x0002FBFD	crc-code=0x515C2104
>> (CRC CHECK)  crc-computed=0x80B5636D 	=>	CRC FAILED


0x0002FC01	chunk-length=0x00000480	(1152)
0x0002FC05	chunk-type='IDAT'
0x00030089	crc-code=0x1BF85D5C
>> (CRC CHECK)  crc-computed=0x6C25E267 	=>	CRC FAILED


0x0003008D	chunk-length=0x00000480	(1152)
0x00030091	chunk-type='IDAT'
0x00030515	crc-code=0x0488C9C9
>> (CRC CHECK)  crc-computed=0x9E3D3F4E 	=>	CRC FAILED


0x00030519	chunk-length=0x00000480	(1152)
0x0003051D	chunk-type='IDAT'
0x000309A1	crc-code=0x71765EF6
>> (CRC CHECK)  crc-computed=0x71765EF6 	=>	CRC OK!


0x000309A5	chunk-length=0x00000480	(1152)
0x000309A9	chunk-type='IDAT'
0x00030E2D	crc-code=0x37EEE7D9
>> (CRC CHECK)  crc-computed=0x37EEE7D9 	=>	CRC OK!


0x00030E31	chunk-length=0x00000480	(1152)
0x00030E35	chunk-type='IDAT'
0x000312B9	crc-code=0x0C2D7D0F
>> (CRC CHECK)  crc-computed=0xB7D3D906 	=>	CRC FAILED


0x000312BD	chunk-length=0x00000480	(1152)
0x000312C1	chunk-type='IDAT'
0x00031745	crc-code=0x73583A78
>> (CRC CHECK)  crc-computed=0x89A7B851 	=>	CRC FAILED


0x00031749	chunk-length=0x00000480	(1152)
0x0003174D	chunk-type='IDAT'
0x00031BD1	crc-code=0xF14926F5
>> (CRC CHECK)  crc-computed=0xF14926F5 	=>	CRC OK!


0x00031BD5	chunk-length=0x00000480	(1152)
0x00031BD9	chunk-type='IDAT'
0x0003205D	crc-code=0x3666E63F
>> (CRC CHECK)  crc-computed=0x3666E63F 	=>	CRC OK!


0x00032061	chunk-length=0x00000480	(1152)
0x00032065	chunk-type='IDAT'
0x000324E9	crc-code=0x63DB2773
>> (CRC CHECK)  crc-computed=0x660E8CD3 	=>	CRC FAILED


0x000324ED	chunk-length=0x00000480	(1152)
0x000324F1	chunk-type='IDAT'
0x00032975	crc-code=0x7B74AB31
>> (CRC CHECK)  crc-computed=0xE221E1F5 	=>	CRC FAILED


0x00032979	chunk-length=0x00000480	(1152)
0x0003297D	chunk-type='IDAT'
0x00032E01	crc-code=0x7632A26C
>> (CRC CHECK)  crc-computed=0x7632A26C 	=>	CRC OK!


0x00032E05	chunk-length=0x00000480	(1152)
0x00032E09	chunk-type='IDAT'
0x0003328D	crc-code=0x334DDC03
>> (CRC CHECK)  crc-computed=0x334DDC03 	=>	CRC OK!


0x00033291	chunk-length=0x00000480	(1152)
0x00033295	chunk-type='IDAT'
0x00033719	crc-code=0xF3956AAA
>> (CRC CHECK)  crc-computed=0x4E3D6642 	=>	CRC FAILED


0x0003371D	chunk-length=0x00000480	(1152)
0x00033721	chunk-type='IDAT'
0x00033BA5	crc-code=0x2CC64977
>> (CRC CHECK)  crc-computed=0x819A80E5 	=>	CRC FAILED


0x00033BA9	chunk-length=0x00000480	(1152)
0x00033BAD	chunk-type='IDAT'
0x00034031	crc-code=0x089D5BCD
>> (CRC CHECK)  crc-computed=0x24439104 	=>	CRC FAILED


0x00034035	chunk-length=0x00000480	(1152)
0x00034039	chunk-type='IDAT'
0x000344BD	crc-code=0x4D44E467
>> (CRC CHECK)  crc-computed=0x143A9644 	=>	CRC FAILED


0x000344C1	chunk-length=0x00000480	(1152)
0x000344C5	chunk-type='IDAT'
0x00034949	crc-code=0x9C6D4D4D
>> (CRC CHECK)  crc-computed=0x460F4776 	=>	CRC FAILED


0x0003494D	chunk-length=0x00000480	(1152)
0x00034951	chunk-type='IDAT'
0x00034DD5	crc-code=0x888DC7E1
>> (CRC CHECK)  crc-computed=0xBB22AD26 	=>	CRC FAILED


0x00034DD9	chunk-length=0x00000480	(1152)
0x00034DDD	chunk-type='IDAT'
0x00035261	crc-code=0x77950234
>> (CRC CHECK)  crc-computed=0x77950234 	=>	CRC OK!


0x00035265	chunk-length=0x00000480	(1152)
0x00035269	chunk-type='IDAT'
0x000356ED	crc-code=0x1DA28C84
>> (CRC CHECK)  crc-computed=0x1DA28C84 	=>	CRC OK!


0x000356F1	chunk-length=0x00000480	(1152)
0x000356F5	chunk-type='IDAT'
0x00035B79	crc-code=0xCD7AD6E6
>> (CRC CHECK)  crc-computed=0xCD7AD6E6 	=>	CRC OK!


0x00035B7D	chunk-length=0x00000480	(1152)
0x00035B81	chunk-type='IDAT'
0x00036005	crc-code=0x5DE11329
>> (CRC CHECK)  crc-computed=0x775F3E4B 	=>	CRC FAILED


0x00036009	chunk-length=0x00000480	(1152)
0x0003600D	chunk-type='IDAT'
0x00036491	crc-code=0x4B49D6DF
>> (CRC CHECK)  crc-computed=0x48240CEC 	=>	CRC FAILED


0x00036495	chunk-length=0x00000480	(1152)
0x00036499	chunk-type='IDAT'
0x0003691D	crc-code=0x96D89D70
>> (CRC CHECK)  crc-computed=0xB447CAB1 	=>	CRC FAILED


0x00036921	chunk-length=0x00000480	(1152)
0x00036925	chunk-type='IDAT'
0x00036DA9	crc-code=0x1904CA4C
>> (CRC CHECK)  crc-computed=0xC4F13A59 	=>	CRC FAILED


0x00036DAD	chunk-length=0x00000480	(1152)
0x00036DB1	chunk-type='IDAT'
0x00037235	crc-code=0xD4F47855
>> (CRC CHECK)  crc-computed=0xD4F47855 	=>	CRC OK!


0x00037239	chunk-length=0x00000480	(1152)
0x0003723D	chunk-type='IDAT'
0x000376C1	crc-code=0xA3236C9D
>> (CRC CHECK)  crc-computed=0xA3236C9D 	=>	CRC OK!


0x000376C5	chunk-length=0x00000480	(1152)
0x000376C9	chunk-type='IDAT'
0x00037B4D	crc-code=0xEBF72C85
>> (CRC CHECK)  crc-computed=0x0892A8C1 	=>	CRC FAILED


0x00037B51	chunk-length=0x00000480	(1152)
0x00037B55	chunk-type='IDAT'
0x00037FD9	crc-code=0x84752150
>> (CRC CHECK)  crc-computed=0x8792F36D 	=>	CRC FAILED


0x00037FDD	chunk-length=0x00000480	(1152)
0x00037FE1	chunk-type='IDAT'
0x00038465	crc-code=0x03C36127
>> (CRC CHECK)  crc-computed=0x03C36127 	=>	CRC OK!


0x00038469	chunk-length=0x00000480	(1152)
0x0003846D	chunk-type='IDAT'
0x000388F1	crc-code=0xDFCE442A
>> (CRC CHECK)  crc-computed=0xDFCE442A 	=>	CRC OK!


0x000388F5	chunk-length=0x00000480	(1152)
0x000388F9	chunk-type='IDAT'
0x00038D7D	crc-code=0x12A311B4
>> (CRC CHECK)  crc-computed=0x7C83ED3F 	=>	CRC FAILED


0x00038D81	chunk-length=0x00000480	(1152)
0x00038D85	chunk-type='IDAT'
0x00039209	crc-code=0xCE2789CF
>> (CRC CHECK)  crc-computed=0x9DD5418C 	=>	CRC FAILED


0x0003920D	chunk-length=0x00000480	(1152)
0x00039211	chunk-type='IDAT'
0x00039695	crc-code=0x56BBC734
>> (CRC CHECK)  crc-computed=0x56BBC734 	=>	CRC OK!


0x00039699	chunk-length=0x00000480	(1152)
0x0003969D	chunk-type='IDAT'
0x00039B21	crc-code=0x8C937508
>> (CRC CHECK)  crc-computed=0x8C937508 	=>	CRC OK!


0x00039B25	chunk-length=0x00000480	(1152)
0x00039B29	chunk-type='IDAT'
0x00039FAD	crc-code=0x4989F774
>> (CRC CHECK)  crc-computed=0x4BFDFFE7 	=>	CRC FAILED


0x00039FB1	chunk-length=0x00000480	(1152)
0x00039FB5	chunk-type='IDAT'
0x0003A439	crc-code=0x1A5729C1
>> (CRC CHECK)  crc-computed=0x826E6FBA 	=>	CRC FAILED


0x0003A43D	chunk-length=0x00000480	(1152)
0x0003A441	chunk-type='IDAT'
0x0003A8C5	crc-code=0x16E98B91
>> (CRC CHECK)  crc-computed=0x118E7E38 	=>	CRC FAILED


0x0003A8C9	chunk-length=0x00000480	(1152)
0x0003A8CD	chunk-type='IDAT'
0x0003AD51	crc-code=0x1257B9AD
>> (CRC CHECK)  crc-computed=0x1257B9AD 	=>	CRC OK!


0x0003AD55	chunk-length=0x00000480	(1152)
0x0003AD59	chunk-type='IDAT'
0x0003B1DD	crc-code=0x823AD577
>> (CRC CHECK)  crc-computed=0x823AD577 	=>	CRC OK!


0x0003B1E1	chunk-length=0x00000480	(1152)
0x0003B1E5	chunk-type='IDAT'
0x0003B669	crc-code=0x69AFB194
>> (CRC CHECK)  crc-computed=0xA82175D3 	=>	CRC FAILED


0x0003B66D	chunk-length=0x00000480	(1152)
0x0003B671	chunk-type='IDAT'
0x0003BAF5	crc-code=0x58B10CF0
>> (CRC CHECK)  crc-computed=0x9DAA69D2 	=>	CRC FAILED


0x0003BAF9	chunk-length=0x00000480	(1152)
0x0003BAFD	chunk-type='IDAT'
0x0003BF81	crc-code=0xFE268F19
>> (CRC CHECK)  crc-computed=0xFE268F19 	=>	CRC OK!


0x0003BF85	chunk-length=0x00000480	(1152)
0x0003BF89	chunk-type='IDAT'
0x0003C40D	crc-code=0xAA734C45
>> (CRC CHECK)  crc-computed=0xAA734C45 	=>	CRC OK!


0x0003C411	chunk-length=0x00000480	(1152)
0x0003C415	chunk-type='IDAT'
0x0003C899	crc-code=0xED2C3776
>> (CRC CHECK)  crc-computed=0x93E0BDE0 	=>	CRC FAILED


0x0003C89D	chunk-length=0x00000480	(1152)
0x0003C8A1	chunk-type='IDAT'
0x0003CD25	crc-code=0x47820CBE
>> (CRC CHECK)  crc-computed=0xA906DE71 	=>	CRC FAILED


0x0003CD29	chunk-length=0x00000480	(1152)
0x0003CD2D	chunk-type='IDAT'
0x0003D1B1	crc-code=0x0E4ED5CA
>> (CRC CHECK)  crc-computed=0x9ACCE644 	=>	CRC FAILED


0x0003D1B5	chunk-length=0x00000480	(1152)
0x0003D1B9	chunk-type='IDAT'
0x0003D63D	crc-code=0xAEE906BD
>> (CRC CHECK)  crc-computed=0xAEE906BD 	=>	CRC OK!


0x0003D641	chunk-length=0x00000480	(1152)
0x0003D645	chunk-type='IDAT'
0x0003DAC9	crc-code=0x9753B0E1
>> (CRC CHECK)  crc-computed=0x62D9DDC7 	=>	CRC FAILED


0x0003DACD	chunk-length=0x00000480	(1152)
0x0003DAD1	chunk-type='IDAT'
0x0003DF55	crc-code=0xFC320B35
>> (CRC CHECK)  crc-computed=0x17E04D7A 	=>	CRC FAILED


0x0003DF59	chunk-length=0x00000480	(1152)
0x0003DF5D	chunk-type='IDAT'
0x0003E3E1	crc-code=0xE6D310B1
>> (CRC CHECK)  crc-computed=0xE6D310B1 	=>	CRC OK!


0x0003E3E5	chunk-length=0x00000480	(1152)
0x0003E3E9	chunk-type='IDAT'
0x0003E86D	crc-code=0x7128E6D5
>> (CRC CHECK)  crc-computed=0x7128E6D5 	=>	CRC OK!


0x0003E871	chunk-length=0x00000480	(1152)
0x0003E875	chunk-type='IDAT'
0x0003ECF9	crc-code=0xC33DE2A0
>> (CRC CHECK)  crc-computed=0x958C7549 	=>	CRC FAILED


0x0003ECFD	chunk-length=0x00000480	(1152)
0x0003ED01	chunk-type='IDAT'
0x0003F185	crc-code=0xD5BEE560
>> (CRC CHECK)  crc-computed=0x7D737654 	=>	CRC FAILED


0x0003F189	chunk-length=0x00000480	(1152)
0x0003F18D	chunk-type='IDAT'
0x0003F611	crc-code=0x0A261817
>> (CRC CHECK)  crc-computed=0x0A261817 	=>	CRC OK!


0x0003F615	chunk-length=0x00000480	(1152)
0x0003F619	chunk-type='IDAT'
0x0003FA9D	crc-code=0x5940C984
>> (CRC CHECK)  crc-computed=0x4FC785ED 	=>	CRC FAILED


0x0003FAA1	chunk-length=0x00000480	(1152)
0x0003FAA5	chunk-type='IDAT'
0x0003FF29	crc-code=0x30434BEA
>> (CRC CHECK)  crc-computed=0x28F8C81C 	=>	CRC FAILED


0x0003FF2D	chunk-length=0x00000480	(1152)
0x0003FF31	chunk-type='IDAT'
0x000403B5	crc-code=0x9F9054DF
>> (CRC CHECK)  crc-computed=0x14D9F0F8 	=>	CRC FAILED


0x000403B9	chunk-length=0x00000480	(1152)
0x000403BD	chunk-type='IDAT'
0x00040841	crc-code=0xC71D5399
>> (CRC CHECK)  crc-computed=0xC71D5399 	=>	CRC OK!


0x00040845	chunk-length=0x00000480	(1152)
0x00040849	chunk-type='IDAT'
0x00040CCD	crc-code=0x5FB5F96A
>> (CRC CHECK)  crc-computed=0x5FB5F96A 	=>	CRC OK!


0x00040CD1	chunk-length=0x00000480	(1152)
0x00040CD5	chunk-type='IDAT'
0x00041159	crc-code=0xAFF7D437
>> (CRC CHECK)  crc-computed=0xCA3A5910 	=>	CRC FAILED


0x0004115D	chunk-length=0x00000480	(1152)
0x00041161	chunk-type='IDAT'
0x000415E5	crc-code=0x710F074D
>> (CRC CHECK)  crc-computed=0x710F074D 	=>	CRC OK!


0x000415E9	chunk-length=0x00000480	(1152)
0x000415ED	chunk-type='IDAT'
0x00041A71	crc-code=0xCA535EAC
>> (CRC CHECK)  crc-computed=0xCA535EAC 	=>	CRC OK!


0x00041A75	chunk-length=0x00000480	(1152)
0x00041A79	chunk-type='IDAT'
0x00041EFD	crc-code=0xAD1E78AB
>> (CRC CHECK)  crc-computed=0x6AA1B661 	=>	CRC FAILED


0x00041F01	chunk-length=0x00000480	(1152)
0x00041F05	chunk-type='IDAT'
0x00042389	crc-code=0x03C0BB51
>> (CRC CHECK)  crc-computed=0x48271731 	=>	CRC FAILED


0x0004238D	chunk-length=0x00000480	(1152)
0x00042391	chunk-type='IDAT'
0x00042815	crc-code=0xA9032536
>> (CRC CHECK)  crc-computed=0x7CF834D8 	=>	CRC FAILED


0x00042819	chunk-length=0x00000480	(1152)
0x0004281D	chunk-type='IDAT'
0x00042CA1	crc-code=0xE02AE604
>> (CRC CHECK)  crc-computed=0xE02AE604 	=>	CRC OK!


0x00042CA5	chunk-length=0x00000480	(1152)
0x00042CA9	chunk-type='IDAT'
0x0004312D	crc-code=0x064DBFC7
>> (CRC CHECK)  crc-computed=0x064DBFC7 	=>	CRC OK!


0x00043131	chunk-length=0x00000480	(1152)
0x00043135	chunk-type='IDAT'
0x000435B9	crc-code=0x73E927E2
>> (CRC CHECK)  crc-computed=0x13C62FB3 	=>	CRC FAILED


0x000435BD	chunk-length=0x00000480	(1152)
0x000435C1	chunk-type='IDAT'
0x00043A45	crc-code=0x9F71DDE3
>> (CRC CHECK)  crc-computed=0xB8CEFD58 	=>	CRC FAILED


0x00043A49	chunk-length=0x00000480	(1152)
0x00043A4D	chunk-type='IDAT'
0x00043ED1	crc-code=0x3FB44739
>> (CRC CHECK)  crc-computed=0x3FB44739 	=>	CRC OK!


0x00043ED5	chunk-length=0x00000480	(1152)
0x00043ED9	chunk-type='IDAT'
0x0004435D	crc-code=0xBF657189
>> (CRC CHECK)  crc-computed=0xBF657189 	=>	CRC OK!


0x00044361	chunk-length=0x00000480	(1152)
0x00044365	chunk-type='IDAT'
0x000447E9	crc-code=0x7483BE00
>> (CRC CHECK)  crc-computed=0x049ABD8F 	=>	CRC FAILED


0x000447ED	chunk-length=0x00000480	(1152)
0x000447F1	chunk-type='IDAT'
0x00044C75	crc-code=0x56DF1F7A
>> (CRC CHECK)  crc-computed=0x468F8B4E 	=>	CRC FAILED


0x00044C79	chunk-length=0x00000480	(1152)
0x00044C7D	chunk-type='IDAT'
0x00045101	crc-code=0xADA1B53F
>> (CRC CHECK)  crc-computed=0xADA1B53F 	=>	CRC OK!


0x00045105	chunk-length=0x00000480	(1152)
0x00045109	chunk-type='IDAT'
0x0004558D	crc-code=0xBD43C8DF
>> (CRC CHECK)  crc-computed=0xBD43C8DF 	=>	CRC OK!


0x00045591	chunk-length=0x00000480	(1152)
0x00045595	chunk-type='IDAT'
0x00045A19	crc-code=0xA03D1F19
>> (CRC CHECK)  crc-computed=0x089C90AB 	=>	CRC FAILED


0x00045A1D	chunk-length=0x00000480	(1152)
0x00045A21	chunk-type='IDAT'
0x00045EA5	crc-code=0xF544330E
>> (CRC CHECK)  crc-computed=0x2256B5C5 	=>	CRC FAILED


0x00045EA9	chunk-length=0x00000480	(1152)
0x00045EAD	chunk-type='IDAT'
0x00046331	crc-code=0x06734B61
>> (CRC CHECK)  crc-computed=0x06734B61 	=>	CRC OK!


0x00046335	chunk-length=0x00000480	(1152)
0x00046339	chunk-type='IDAT'
0x000467BD	crc-code=0xB9DAD2F6
>> (CRC CHECK)  crc-computed=0xF3C503E6 	=>	CRC FAILED


0x000467C1	chunk-length=0x00000480	(1152)
0x000467C5	chunk-type='IDAT'
0x00046C49	crc-code=0x90F6AB51
>> (CRC CHECK)  crc-computed=0x524122BC 	=>	CRC FAILED


0x00046C4D	chunk-length=0x00000480	(1152)
0x00046C51	chunk-type='IDAT'
0x000470D5	crc-code=0x2825E139
>> (CRC CHECK)  crc-computed=0x2FAF82CB 	=>	CRC FAILED


0x000470D9	chunk-length=0x00000480	(1152)
0x000470DD	chunk-type='IDAT'
0x00047561	crc-code=0xCE86855C
>> (CRC CHECK)  crc-computed=0xCE86855C 	=>	CRC OK!


0x00047565	chunk-length=0x00000480	(1152)
0x00047569	chunk-type='IDAT'
0x000479ED	crc-code=0x79C9E8CB
>> (CRC CHECK)  crc-computed=0x79C9E8CB 	=>	CRC OK!


0x000479F1	chunk-length=0x00000480	(1152)
0x000479F5	chunk-type='IDAT'
0x00047E79	crc-code=0xB90E1ADC
>> (CRC CHECK)  crc-computed=0x0BE5EDF6 	=>	CRC FAILED


0x00047E7D	chunk-length=0x00000480	(1152)
0x00047E81	chunk-type='IDAT'
0x00048305	crc-code=0x00D4B24B
>> (CRC CHECK)  crc-computed=0x25E92CEA 	=>	CRC FAILED


0x00048309	chunk-length=0x00000480	(1152)
0x0004830D	chunk-type='IDAT'
0x00048791	crc-code=0xAAF27EC7
>> (CRC CHECK)  crc-computed=0xAAF27EC7 	=>	CRC OK!


0x00048795	chunk-length=0x00000480	(1152)
0x00048799	chunk-type='IDAT'
0x00048C1D	crc-code=0x9165A238
>> (CRC CHECK)  crc-computed=0x9165A238 	=>	CRC OK!


0x00048C21	chunk-length=0x00000480	(1152)
0x00048C25	chunk-type='IDAT'
0x000490A9	crc-code=0xDE613290
>> (CRC CHECK)  crc-computed=0xA1C6FF02 	=>	CRC FAILED


0x000490AD	chunk-length=0x00000480	(1152)
0x000490B1	chunk-type='IDAT'
0x00049535	crc-code=0x5CD78650
>> (CRC CHECK)  crc-computed=0x5606BB20 	=>	CRC FAILED


0x00049539	chunk-length=0x00000480	(1152)
0x0004953D	chunk-type='IDAT'
0x000499C1	crc-code=0x300A9E6A
>> (CRC CHECK)  crc-computed=0x300A9E6A 	=>	CRC OK!


0x000499C5	chunk-length=0x00000480	(1152)
0x000499C9	chunk-type='IDAT'
0x00049E4D	crc-code=0xDB9103BE
>> (CRC CHECK)  crc-computed=0xDB9103BE 	=>	CRC OK!


0x00049E51	chunk-length=0x00000480	(1152)
0x00049E55	chunk-type='IDAT'
0x0004A2D9	crc-code=0xA6239028
>> (CRC CHECK)  crc-computed=0x85B2A6AE 	=>	CRC FAILED


0x0004A2DD	chunk-length=0x00000480	(1152)
0x0004A2E1	chunk-type='IDAT'
0x0004A765	crc-code=0x4E1173CE
>> (CRC CHECK)  crc-computed=0xBE3E3139 	=>	CRC FAILED


0x0004A769	chunk-length=0x00000480	(1152)
0x0004A76D	chunk-type='IDAT'
0x0004ABF1	crc-code=0x5D8F8E3F
>> (CRC CHECK)  crc-computed=0x15C05278 	=>	CRC FAILED


0x0004ABF5	chunk-length=0x00000480	(1152)
0x0004ABF9	chunk-type='IDAT'
0x0004B07D	crc-code=0xD6B9461C
>> (CRC CHECK)  crc-computed=0xD6B9461C 	=>	CRC OK!


0x0004B081	chunk-length=0x00000480	(1152)
0x0004B085	chunk-type='IDAT'
0x0004B509	crc-code=0x66730FA7
>> (CRC CHECK)  crc-computed=0xFBFDDA87 	=>	CRC FAILED


0x0004B50D	chunk-length=0x00000480	(1152)
0x0004B511	chunk-type='IDAT'
0x0004B995	crc-code=0x8CE83142
>> (CRC CHECK)  crc-computed=0x8CE83142 	=>	CRC OK!


0x0004B999	chunk-length=0x00000480	(1152)
0x0004B99D	chunk-type='IDAT'
0x0004BE21	crc-code=0x9DDEAFB5
>> (CRC CHECK)  crc-computed=0x9DDEAFB5 	=>	CRC OK!


0x0004BE25	chunk-length=0x00000480	(1152)
0x0004BE29	chunk-type='IDAT'
0x0004C2AD	crc-code=0xEC617E0C
>> (CRC CHECK)  crc-computed=0xE6DDD1BE 	=>	CRC FAILED


0x0004C2B1	chunk-length=0x00000480	(1152)
0x0004C2B5	chunk-type='IDAT'
0x0004C739	crc-code=0x54C4DF86
>> (CRC CHECK)  crc-computed=0x79FF50C8 	=>	CRC FAILED


0x0004C73D	chunk-length=0x00000480	(1152)
0x0004C741	chunk-type='IDAT'
0x0004CBC5	crc-code=0x3B59737C
>> (CRC CHECK)  crc-computed=0x4E9C3F8B 	=>	CRC FAILED


0x0004CBC9	chunk-length=0x00000480	(1152)
0x0004CBCD	chunk-type='IDAT'
0x0004D051	crc-code=0x61F86FD6
>> (CRC CHECK)  crc-computed=0x61F86FD6 	=>	CRC OK!


0x0004D055	chunk-length=0x00000480	(1152)
0x0004D059	chunk-type='IDAT'
0x0004D4DD	crc-code=0x7D006CDF
>> (CRC CHECK)  crc-computed=0xF10335FE 	=>	CRC FAILED


0x0004D4E1	chunk-length=0x00000480	(1152)
0x0004D4E5	chunk-type='IDAT'
0x0004D969	crc-code=0xD7CC3EFB
>> (CRC CHECK)  crc-computed=0x74BCAC77 	=>	CRC FAILED


0x0004D96D	chunk-length=0x00000480	(1152)
0x0004D971	chunk-type='IDAT'
0x0004DDF5	crc-code=0xA6C5EED2
>> (CRC CHECK)  crc-computed=0xA6C5EED2 	=>	CRC OK!


0x0004DDF9	chunk-length=0x00000480	(1152)
0x0004DDFD	chunk-type='IDAT'
0x0004E281	crc-code=0x2C34CFC3
>> (CRC CHECK)  crc-computed=0x2C34CFC3 	=>	CRC OK!


0x0004E285	chunk-length=0x00000480	(1152)
0x0004E289	chunk-type='IDAT'
0x0004E70D	crc-code=0x7F83FBFD
>> (CRC CHECK)  crc-computed=0x4729E289 	=>	CRC FAILED


0x0004E711	chunk-length=0x00000480	(1152)
0x0004E715	chunk-type='IDAT'
0x0004EB99	crc-code=0x4F66861B
>> (CRC CHECK)  crc-computed=0x7BD034D1 	=>	CRC FAILED


0x0004EB9D	chunk-length=0x00000480	(1152)
0x0004EBA1	chunk-type='IDAT'
0x0004F025	crc-code=0x73C063B5
>> (CRC CHECK)  crc-computed=0x73C063B5 	=>	CRC OK!


0x0004F029	chunk-length=0x00000480	(1152)
0x0004F02D	chunk-type='IDAT'
0x0004F4B1	crc-code=0xCE511924
>> (CRC CHECK)  crc-computed=0x55757346 	=>	CRC FAILED


0x0004F4B5	chunk-length=0x00000480	(1152)
0x0004F4B9	chunk-type='IDAT'
0x0004F93D	crc-code=0x6BDD4A77
>> (CRC CHECK)  crc-computed=0x6BDD4A77 	=>	CRC OK!


0x0004F941	chunk-length=0x00000480	(1152)
0x0004F945	chunk-type='IDAT'
0x0004FDC9	crc-code=0x45CBA8BF
>> (CRC CHECK)  crc-computed=0x879E9354 	=>	CRC FAILED


0x0004FDCD	chunk-length=0x00000480	(1152)
0x0004FDD1	chunk-type='IDAT'
0x00050255	crc-code=0x9F09911B
>> (CRC CHECK)  crc-computed=0x620DE0C3 	=>	CRC FAILED


0x00050259	chunk-length=0x00000480	(1152)
0x0005025D	chunk-type='IDAT'
0x000506E1	crc-code=0xA48511A7
>> (CRC CHECK)  crc-computed=0xA48511A7 	=>	CRC OK!


0x000506E5	chunk-length=0x00000480	(1152)
0x000506E9	chunk-type='IDAT'
0x00050B6D	crc-code=0xE8D89951
>> (CRC CHECK)  crc-computed=0xE8D89951 	=>	CRC OK!


0x00050B71	chunk-length=0x00000480	(1152)
0x00050B75	chunk-type='IDAT'
0x00050FF9	crc-code=0x3BCB2C1F
>> (CRC CHECK)  crc-computed=0x12FF4E6A 	=>	CRC FAILED


0x00050FFD	chunk-length=0x00000480	(1152)
0x00051001	chunk-type='IDAT'
0x00051485	crc-code=0x6B9673C5
>> (CRC CHECK)  crc-computed=0x6B9673C5 	=>	CRC OK!


0x00051489	chunk-length=0x00000480	(1152)
0x0005148D	chunk-type='IDAT'
0x00051911	crc-code=0x7E04A78D
>> (CRC CHECK)  crc-computed=0x7E04A78D 	=>	CRC OK!


0x00051915	chunk-length=0x00000480	(1152)
0x00051919	chunk-type='IDAT'
0x00051D9D	crc-code=0xE4CA515A
>> (CRC CHECK)  crc-computed=0xE4CA515A 	=>	CRC OK!


0x00051DA1	chunk-length=0x00000480	(1152)
0x00051DA5	chunk-type='IDAT'
0x00052229	crc-code=0xC63F7042
>> (CRC CHECK)  crc-computed=0xB6FE5F8D 	=>	CRC FAILED


0x0005222D	chunk-length=0x00000480	(1152)
0x00052231	chunk-type='IDAT'
0x000526B5	crc-code=0x3C05E3FE
>> (CRC CHECK)  crc-computed=0x7C2FACB8 	=>	CRC FAILED


0x000526B9	chunk-length=0x00000480	(1152)
0x000526BD	chunk-type='IDAT'
0x00052B41	crc-code=0xC92E513A
>> (CRC CHECK)  crc-computed=0xC92E513A 	=>	CRC OK!


0x00052B45	chunk-length=0x00000480	(1152)
0x00052B49	chunk-type='IDAT'
0x00052FCD	crc-code=0x73665168
>> (CRC CHECK)  crc-computed=0x73665168 	=>	CRC OK!


0x00052FD1	chunk-length=0x00000480	(1152)
0x00052FD5	chunk-type='IDAT'
0x00053459	crc-code=0xFC856388
>> (CRC CHECK)  crc-computed=0xFC856388 	=>	CRC OK!


0x0005345D	chunk-length=0x00000480	(1152)
0x00053461	chunk-type='IDAT'
0x000538E5	crc-code=0x8EF8FD23
>> (CRC CHECK)  crc-computed=0x1A9C0BF8 	=>	CRC FAILED


0x000538E9	chunk-length=0x00000480	(1152)
0x000538ED	chunk-type='IDAT'
0x00053D71	crc-code=0xEE6E4C8F
>> (CRC CHECK)  crc-computed=0x6EDCE9A1 	=>	CRC FAILED


0x00053D75	chunk-length=0x00000480	(1152)
0x00053D79	chunk-type='IDAT'
0x000541FD	crc-code=0xE4645A55
>> (CRC CHECK)  crc-computed=0x41F7F1DA 	=>	CRC FAILED


0x00054201	chunk-length=0x00000480	(1152)
0x00054205	chunk-type='IDAT'
0x00054689	crc-code=0x351B6165
>> (CRC CHECK)  crc-computed=0x454FC6A4 	=>	CRC FAILED


0x0005468D	chunk-length=0x00000480	(1152)
0x00054691	chunk-type='IDAT'
0x00054B15	crc-code=0x13911F58
>> (CRC CHECK)  crc-computed=0x007347C9 	=>	CRC FAILED


0x00054B19	chunk-length=0x00000480	(1152)
0x00054B1D	chunk-type='IDAT'
0x00054FA1	crc-code=0x674DEA7E
>> (CRC CHECK)  crc-computed=0x674DEA7E 	=>	CRC OK!


0x00054FA5	chunk-length=0x00000480	(1152)
0x00054FA9	chunk-type='IDAT'
0x0005542D	crc-code=0xF4CA419E
>> (CRC CHECK)  crc-computed=0xF4CA419E 	=>	CRC OK!


0x00055431	chunk-length=0x00000480	(1152)
0x00055435	chunk-type='IDAT'
0x000558B9	crc-code=0x21D0AA27
>> (CRC CHECK)  crc-computed=0xD721FC5F 	=>	CRC FAILED


0x000558BD	chunk-length=0x00000480	(1152)
0x000558C1	chunk-type='IDAT'
0x00055D45	crc-code=0x35B7B9C9
>> (CRC CHECK)  crc-computed=0x43329EC0 	=>	CRC FAILED


0x00055D49	chunk-length=0x00000480	(1152)
0x00055D4D	chunk-type='IDAT'
0x000561D1	crc-code=0x0CE73416
>> (CRC CHECK)  crc-computed=0x0CE73416 	=>	CRC OK!


0x000561D5	chunk-length=0x00000480	(1152)
0x000561D9	chunk-type='IDAT'
0x0005665D	crc-code=0x38BBC76C
>> (CRC CHECK)  crc-computed=0x38BBC76C 	=>	CRC OK!


0x00056661	chunk-length=0x00000480	(1152)
0x00056665	chunk-type='IDAT'
0x00056AE9	crc-code=0x6201DF12
>> (CRC CHECK)  crc-computed=0xCC7FBDC8 	=>	CRC FAILED


0x00056AED	chunk-length=0x00000480	(1152)
0x00056AF1	chunk-type='IDAT'
0x00056F75	crc-code=0xC02BD272
>> (CRC CHECK)  crc-computed=0xC02BD272 	=>	CRC OK!


0x00056F79	chunk-length=0x00000480	(1152)
0x00056F7D	chunk-type='IDAT'
0x00057401	crc-code=0x2BEDE1D5
>> (CRC CHECK)  crc-computed=0x2BEDE1D5 	=>	CRC OK!


0x00057405	chunk-length=0x00000480	(1152)
0x00057409	chunk-type='IDAT'
0x0005788D	crc-code=0xDF0224BA
>> (CRC CHECK)  crc-computed=0x46407EDA 	=>	CRC FAILED


0x00057891	chunk-length=0x00000480	(1152)
0x00057895	chunk-type='IDAT'
0x00057D19	crc-code=0x9254818C
>> (CRC CHECK)  crc-computed=0xF0649131 	=>	CRC FAILED


0x00057D1D	chunk-length=0x00000480	(1152)
0x00057D21	chunk-type='IDAT'
0x000581A5	crc-code=0x01BE5D68
>> (CRC CHECK)  crc-computed=0x01BE5D68 	=>	CRC OK!


0x000581A9	chunk-length=0x00000480	(1152)
0x000581AD	chunk-type='IDAT'
0x00058631	crc-code=0x8F3635C1
>> (CRC CHECK)  crc-computed=0x8F3635C1 	=>	CRC OK!


0x00058635	chunk-length=0x00000480	(1152)
0x00058639	chunk-type='IDAT'
0x00058ABD	crc-code=0xBA75AF94
>> (CRC CHECK)  crc-computed=0x68E0701F 	=>	CRC FAILED


0x00058AC1	chunk-length=0x00000480	(1152)
0x00058AC5	chunk-type='IDAT'
0x00058F49	crc-code=0x7D4DC8DF
>> (CRC CHECK)  crc-computed=0x5ECF7357 	=>	CRC FAILED


0x00058F4D	chunk-length=0x00000480	(1152)
0x00058F51	chunk-type='IDAT'
0x000593D5	crc-code=0xEA8368A1
>> (CRC CHECK)  crc-computed=0x70D5CAD3 	=>	CRC FAILED


0x000593D9	chunk-length=0x00000480	(1152)
0x000593DD	chunk-type='IDAT'
0x00059861	crc-code=0xCFA78EAF
>> (CRC CHECK)  crc-computed=0xCFA78EAF 	=>	CRC OK!


0x00059865	chunk-length=0x00000480	(1152)
0x00059869	chunk-type='IDAT'
0x00059CED	crc-code=0x141FEE70
>> (CRC CHECK)  crc-computed=0x141FEE70 	=>	CRC OK!


0x00059CF1	chunk-length=0x00000480	(1152)
0x00059CF5	chunk-type='IDAT'
0x0005A179	crc-code=0xD5A7ACAE
>> (CRC CHECK)  crc-computed=0xE9BF9849 	=>	CRC FAILED


0x0005A17D	chunk-length=0x00000480	(1152)
0x0005A181	chunk-type='IDAT'
0x0005A605	crc-code=0xFEF4C079
>> (CRC CHECK)  crc-computed=0xFEF4C079 	=>	CRC OK!


0x0005A609	chunk-length=0x00000480	(1152)
0x0005A60D	chunk-type='IDAT'
0x0005AA91	crc-code=0x3399689A
>> (CRC CHECK)  crc-computed=0x3399689A 	=>	CRC OK!


0x0005AA95	chunk-length=0x00000480	(1152)
0x0005AA99	chunk-type='IDAT'
0x0005AF1D	crc-code=0xEF74CA93
>> (CRC CHECK)  crc-computed=0xAD7696F6 	=>	CRC FAILED


0x0005AF21	chunk-length=0x00000480	(1152)
0x0005AF25	chunk-type='IDAT'
0x0005B3A9	crc-code=0x8A1D5BEE
>> (CRC CHECK)  crc-computed=0x0A0C79A5 	=>	CRC FAILED


0x0005B3AD	chunk-length=0x00000480	(1152)
0x0005B3B1	chunk-type='IDAT'
0x0005B835	crc-code=0x9D755837
>> (CRC CHECK)  crc-computed=0x15554EB6 	=>	CRC FAILED


0x0005B839	chunk-length=0x00000480	(1152)
0x0005B83D	chunk-type='IDAT'
0x0005BCC1	crc-code=0x0163C7B4
>> (CRC CHECK)  crc-computed=0x0163C7B4 	=>	CRC OK!


0x0005BCC5	chunk-length=0x00000480	(1152)
0x0005BCC9	chunk-type='IDAT'
0x0005C14D	crc-code=0x56E3B982
>> (CRC CHECK)  crc-computed=0x56E3B982 	=>	CRC OK!


0x0005C151	chunk-length=0x00000480	(1152)
0x0005C155	chunk-type='IDAT'
0x0005C5D9	crc-code=0x61F0DEB0
>> (CRC CHECK)  crc-computed=0x61F0DEB0 	=>	CRC OK!


0x0005C5DD	chunk-length=0x00000480	(1152)
0x0005C5E1	chunk-type='IDAT'
0x0005CA65	crc-code=0xC65D010A
>> (CRC CHECK)  crc-computed=0xD01A731F 	=>	CRC FAILED


0x0005CA69	chunk-length=0x00000480	(1152)
0x0005CA6D	chunk-type='IDAT'
0x0005CEF1	crc-code=0x134FE50E
>> (CRC CHECK)  crc-computed=0x79F9AC42 	=>	CRC FAILED


0x0005CEF5	chunk-length=0x00000480	(1152)
0x0005CEF9	chunk-type='IDAT'
0x0005D37D	crc-code=0x239FE0C2
>> (CRC CHECK)  crc-computed=0x239FE0C2 	=>	CRC OK!


0x0005D381	chunk-length=0x00000480	(1152)
0x0005D385	chunk-type='IDAT'
0x0005D809	crc-code=0x396602B2
>> (CRC CHECK)  crc-computed=0xEB05BB47 	=>	CRC FAILED


0x0005D80D	chunk-length=0x00000480	(1152)
0x0005D811	chunk-type='IDAT'
0x0005DC95	crc-code=0x2AC35C40
>> (CRC CHECK)  crc-computed=0x2AC35C40 	=>	CRC OK!


0x0005DC99	chunk-length=0x00000480	(1152)
0x0005DC9D	chunk-type='IDAT'
0x0005E121	crc-code=0xF7BB5449
>> (CRC CHECK)  crc-computed=0xF7BB5449 	=>	CRC OK!


0x0005E125	chunk-length=0x00000480	(1152)
0x0005E129	chunk-type='IDAT'
0x0005E5AD	crc-code=0x15A63A73
>> (CRC CHECK)  crc-computed=0x3FDE1E8E 	=>	CRC FAILED


0x0005E5B1	chunk-length=0x00000480	(1152)
0x0005E5B5	chunk-type='IDAT'
0x0005EA39	crc-code=0xC7B22E4D
>> (CRC CHECK)  crc-computed=0x36855457 	=>	CRC FAILED


0x0005EA3D	chunk-length=0x00000480	(1152)
0x0005EA41	chunk-type='IDAT'
0x0005EEC5	crc-code=0xB2251365
>> (CRC CHECK)  crc-computed=0xB2251365 	=>	CRC OK!


0x0005EEC9	chunk-length=0x00000480	(1152)
0x0005EECD	chunk-type='IDAT'
0x0005F351	crc-code=0x28E8AE96
>> (CRC CHECK)  crc-computed=0x0CBB82D5 	=>	CRC FAILED


0x0005F355	chunk-length=0x00000480	(1152)
0x0005F359	chunk-type='IDAT'
0x0005F7DD	crc-code=0xC0C970F5
>> (CRC CHECK)  crc-computed=0xC0C970F5 	=>	CRC OK!


0x0005F7E1	chunk-length=0x00000480	(1152)
0x0005F7E5	chunk-type='IDAT'
0x0005FC69	crc-code=0x5E5E45FA
>> (CRC CHECK)  crc-computed=0xE4BE994E 	=>	CRC FAILED


0x0005FC6D	chunk-length=0x00000480	(1152)
0x0005FC71	chunk-type='IDAT'
0x000600F5	crc-code=0xF0D6BFD0
>> (CRC CHECK)  crc-computed=0xF0D6BFD0 	=>	CRC OK!


0x000600F9	chunk-length=0x00000480	(1152)
0x000600FD	chunk-type='IDAT'
0x00060581	crc-code=0xFE6E15EF
>> (CRC CHECK)  crc-computed=0xFE6E15EF 	=>	CRC OK!


0x00060585	chunk-length=0x00000480	(1152)
0x00060589	chunk-type='IDAT'
0x00060A0D	crc-code=0xA7A45A7C
>> (CRC CHECK)  crc-computed=0xA7A45A7C 	=>	CRC OK!


0x00060A11	chunk-length=0x00000480	(1152)
0x00060A15	chunk-type='IDAT'
0x00060E99	crc-code=0xFBDAEED2
>> (CRC CHECK)  crc-computed=0xFBDAEED2 	=>	CRC OK!


0x00060E9D	chunk-length=0x00000480	(1152)
0x00060EA1	chunk-type='IDAT'
0x00061325	crc-code=0xB8BD8DE4
>> (CRC CHECK)  crc-computed=0xB8BD8DE4 	=>	CRC OK!


0x00061329	chunk-length=0x00000480	(1152)
0x0006132D	chunk-type='IDAT'
0x000617B1	crc-code=0x0B5EF0B1
>> (CRC CHECK)  crc-computed=0x42C311A0 	=>	CRC FAILED


0x000617B5	chunk-length=0x00000451	(1105)
0x000617B9	chunk-type='IDAT'
0x00061C0E	crc-code=0xAAF8CC5B
>> (CRC CHECK)  crc-computed=0xAAF8CC5B 	=>	CRC OK!


0x00061C12	chunk-length=0x00000000	(0)
0x00061C16	chunk-type='IEND'
0x00061C1A	crc-code=0xAE426082
>> (CRC CHECK)  crc-computed=0xAE426082 	=>	CRC OK!


```

开头删一下，结尾删一下，然后就能用脚本进行跑了

然后写脚本进行剔除

```c
f=open("Z:/Desktop/1.txt","r").read()

flag=""

for i in f.split():

    if "OK!" == i:

        flag += "1"

    elif "FAILED" ==i:

        flag += "0"

for i in range(len(flag)//8):

    print(chr(int(flag[8*i:8*(i+1)],2)),end="")
```



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114144009721.png)


ctfshow{cc1af32bf96308fc1263231be783f69e}


# misc45

用在线工具转换一下

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114150602448.png)

成功讲png转换成bmp

然后分离一下就OK 了


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114150720177.png)


# misc46

这题就纯没有思路

直接看wp了

```c
identify '/home/kali/桌面/misc46.gif' > 1.txt

```


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114151055757.png)


然后代码脚本跑一下


```c
arr=[]
with open('1.txt','r') as file:
    for i in file.readlines():
        content_list=i.split(' ')
        arr.append(content_list[3][8:].replace('+',' '))
with open('1.txt','w') as result:
    for i in arr:
        result.write(i+'\n')


```


然后画图得到flag


ctfshow{05906b3be8742a13a93898186bc5802f}


# misc47


# misc48


# misc49


# misc50(颜色通道)

拖到stegsolve里面去，发现有东西

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114151925778.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114151952119.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114152007706.png)


然后正常拼接起来即可


# misc53

直接把这个照片下载下来

然后直接zsteg出来了

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114152504831.png)


这样也行，发现是lsb最低有效位提取

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114152548275.png)


# misc54


发现zsteg没有扫出来

发现a 0   g 0  b 0有明显的隐写痕迹


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114153030191.png)


所以就找到了

ctfshow{b1f8ab24b8ca223d 0affbf372ba0e4fa}


# misc55



有隐写，但是需要将图片翻转下来才行

翻转脚本

```c
from PIL import Image

img = Image.open('misc55.png')

img.transpose(Image.FLIP_TOP_BOTTOM).save('out.png')

```



![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114154450776.png)


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114154520447.png)

发现有压缩包，进行提取出来，利用那个save  bin

![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114154607829.png)

ctfshow{daf256838e19a19d9e7b0a69642ad5ee}


# misc56


zsteg发现没东西


r4 r2 r1  g4 g2  g1   发现有明显的隐写痕迹


![image.png](https://luxury-1393333723.cos.ap-nanjing.myqcloud.com//img/20260114155245512.png)


ctfshow{1b30c28a5fca6cec 5886b1d2cc8b1263}











































































































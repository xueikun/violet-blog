---
title: "Spring Boot 里我踩过的 5 个坑"
date: 2026-09-18
excerpt: "都是真金白银调试出来的。尤其是第 3 个,卡了我整个下午。"
category: "技术笔记"
tags: ["Java", "Spring Boot", "踩坑"]
mood: "燃"
---

写业务的时候踩的,记录下来,免得下次再交学费。

## 1. 自定义 SQL 漏字段

用 MyBatis-Plus 写自定义查询时最容易犯的错:手写 `SELECT` 时忘了把某个字段带上,结果实体类里那个属性永远是 `null`,前端怎么调都不显示。

```java
@Select("SELECT id, name, price FROM ticket WHERE status = 1")
List<Ticket> listOnSale();
```

`Ticket` 里有 `kucunNumber`,但 SQL 里没查——**不报错,只是静默为 null**。这种 bug 最难查。

**对策**:自定义 SQL 一律用 `SELECT *` 或者把字段列表写全,别偷懒。

## 2. 事务里吞掉异常

`@Transactional` 默认只对 `RuntimeException` 回滚。抛了个 `Exception` 出去,事务照样提交。

```java
@Transactional(rollbackFor = Exception.class)
public void createOrder(Order order) throws Exception {
    orderDao.insert(order);
    stockService.reduce(order.getTicketId());
}
```

**对策**:统一加 `rollbackFor = Exception.class`。

## 3. 循环里查数据库

写完发现接口要 3 秒。原因很简单,一个 for 循环里查了 N 次库。

**对策**:用 `in` 批量查一次,再在内存里用 `Map` 组装。

## 4. 时区

数据库存的是 UTC,取出来显示少 8 小时。检查三处:

1. JDBC 连接串有没有 `serverTimezone=Asia/Shanghai`
2. MySQL 的 `time_zone` 设置
3. JVM 启动参数 `-Duser.timezone=Asia/Shanghai`

三处都对齐才稳。

## 5. 热部署有时候是负优化

`spring-boot-devtools` 确实爽,但它会把类加载器分两份,偶尔出现"改了代码但行为没变"的幻觉。

**对策**:调接口逻辑时开着,查配置问题时关掉重启一次。

## 小结

这五个坑有个共同点:**它们都不报错,只是结果不对**。

> 能报错的 bug 是好 bug。真正花时间的是那些安静出错的。

# jm-bank

银行系统

## 定义

- 币种 ct

提供多币种支持，例如人民币 cny，金币 gold 等，系统管理员可以根据业务需求灵活定义。

- 用户 user

使用银行系统的功能前，必须成为银行的用户。

- 账户 account

每个用户可以拥有多个银行账户，系统会自动为每个用户分配一个默认账户和一个默认保险账户

- 默认账户 default account

如果转账及查询操作时，如果不指定用户的账户，系统会使用该用户的默认账户

- 保险账户 safe account

如果默认账户或者其他账户的余额太大，为了安全，用户可以选择把部分余额转账至自己的保险账户，有需要的时候，再转回去。

实际使用中，用户对于默认账户的使用频率要远远超过安全账户。

- 余额 balance

一个账户可以有多个币种的余额，例如同一个账户有 100 cny 及 1000 gold

- 转账 transfer

支持用户之间转账及用户和系统之间转账。

注意，系统转给用户，实际上是发行货币，反之，用户转给系统，是货币回收。

## run:

```javascript
npm start
// or
npm run cluster
```

## config

基本配置 请参考[jm-server] (https://github.com/jm-root/jm-server)

db [] mysql服务器Uri

tableNamePrefix [''] 表名称前缀

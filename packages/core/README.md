<div align="center">

<a href="https://chronocat-backup.vercel.app" target="_blank" rel="noopener noreferrer">
<img src="https://chronocat-backup.vercel.app/chronocat.svg" alt="Chronocat-Backup" width="200px"></img>
</a>

<a href="https://chronocat-backup.vercel.app" target="_blank" rel="noopener noreferrer">
<h1>Chronocat-Backup</h1>
</a>
<p>Chronocat的非官方备份 删库6小时前备份</p>

[![License](https://img.shields.io/github/license/chrononeko-backup/chronocat?style=flat-square)](https://github.com/chrononeko-backup/chronocat/blob/master/LICENSE)
</div>

## :construction: WIP :construction:

[当前仓库地址](https://github.com/chrononeko/chronocat) 仅仅是备份，并不提供更新 采用官方删库前6小时内的备份

[官方仓库地址](https://chronocat.vercel.app)

## 注意事项

这个仓库需要配置两个密钥 **Secrets and variables** > **actions** > **Repository secrets**:

* TI_KEY : Chronocat IIFE 签名私钥 : 用于可信安装验证
* DEPLOY_TOKEN : [Tokens](https://github.com/settings/tokens) 需要 Deploy&GithubPages 仓库 **读写权限**

Deploy&GithubPages 仓库用于存放 文档的静态部署文件

后续个人使用GithubPages 或者第三方ServerLess服务部署文档页面

<hr>

你需要创建的仓库:

* chronocat ： 本仓库
* LiteLoaderQQNT-Plugin-Chronocat : 关于llqqnt cc插件 : 自己改 [workflows/build](../../.github/workflows/build.yml) 去
* Chronocat-Deploy : 存放静态部署文件 : 自己改 [workflows/docs](../../.github/workflows/docs.yml) 去

<hr>

本仓库仅用于学习，下载后，请在24小时内删除。出现一切责任与本仓库所有者无关。

## 许可

[AGPL-3.0](https://github.com/chrononeko-backup/chronocat/blob/master/LICENSE)

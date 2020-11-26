# 1章 事前準備

## Nodeのインストール

- ターミナルで`node`コマンドと`npm`コマンドが使えることを確認してください

```sh
node -v
# v15.3.0
npm -v
#7.0.14
```

- インストールされていない場合は[公式サイト](https://nodejs.org/ja/)から最新版をダウンロードしてください

## Yarnのインストール

- ターミナルで`yarn`コマンドが使えることを確認してください

```sh
yarn -v
# 1.22.10
```

- インストールされていない場合い以下のコマンドでインストールしてください

```sh
npm i -g yarn
```

## ServerlessFrameworkのインストール

- ターミナルで`sls`コマンドが使えることを確認してください

```sh
sls -v
# Framework Core: 2.13.0
# Plugin: 4.1.2
# SDK: 2.3.2
# Components: 3.4.2
```

- インストールされていない場合い以下のコマンドでインストールしてください

```sh
npm i -g serverless
```

## VSCodeのインストール

- お気に入りのエディタがある人はそちらでも大丈夫です
- 初心者の人はVSCodeをインストールしてそれを使って開発していきましょう
- [公式サイト](https://code.visualstudio.com/download)からダウンロードしてください

![vscode](/images/1-1.png)

## AWSのAPIキーのセットアップ

- AWSにアクセスするためのキー情報を登録します
- [こちらの記事](https://qiita.com/ozaki25/items/034f7f8e8ad69adceea7)の`アクセスキーの発行`を参考にキーを発行してください

:::tip
11/30のハンズオンに参加する人はキー情報を展開するので自分で発行する必要はありません
:::

- 以下のコマンドでキー情報を端末に登録します
    - `AWS_ACCESS_KEY_ID`と`AWS_SECRET_ACCESS_KEY`は発行した値に置き換えて実行してください

```sh
sls config credentials --provider aws --key AWS_ACCESS_KEY_ID --secret AWS_SECRET_ACCESS_KEY
```

- すでに登録済みの場合エラーが出ます
- その場合は`~/.aws/credentials`のファイルを直接編集し`[default]`の部分を別の値に変えるなどしてから再実行してください

```config
[my-account]
aws_access_key_id=XXXXXXXXXXXXXXXXXXXX
aws_secret_access_key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

:::danger
キー情報の取り扱いには注意してください
:::

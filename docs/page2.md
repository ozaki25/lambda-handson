# 2章 Lambda

## プロジェクトの作成

- ServerlessFrameworkでプロジェクトを作成します
    - 今回はTypeScriptを使います

```sh
# フォルダを作成
mkdir lambda-handson
```

```sh
# フォルダに移動
cd lambda-handson
```

```sh
# slsコマンドでプロジェクト作成
sls create -t aws-nodejs-typescript
```

- 実行すると以下のようなファイルが生成されました

```sh
lambda-handson
├── .gitignore
├── .vscode
│   └── launch.json
├── handler.ts # Lambdaで実行する処理を書くファイル
├── package.json # 依存ライブラリの情報などが書かれたファイル
├── serverless.ts # ServerlessFrameworkの設定ファイル
├── tsconfig.json # TypeScriptの設定ファイル
└── webpack.config.js # ビルドの設定ファイル
```

:::tip
- ServerlessFrameworkはTypeScript以外にもいろいろな言語のテンプレートが用意されています

```
aws-clojurescript-gradle
aws-clojure-gradle
aws-nodejs
aws-nodejs-typescript
aws-alexa-typescript
aws-nodejs-ecma-script
aws-python
aws-python3
aws-ruby
aws-provided
aws-kotlin-jvm-maven
aws-kotlin-jvm-gradle
aws-kotlin-nodejs-gradle
aws-groovy-gradle
aws-java-maven
aws-java-gradle
aws-scala-sbt
aws-csharp
aws-fsharp
aws-go
aws-go-dep
aws-go-mod
plugin
```

- [https://www.serverless.com/framework/docs/providers/aws/cli-reference/create#available-templates](https://www.serverless.com/framework/docs/providers/aws/cli-reference/create#available-templates)
:::





## Topic2

## Topic3

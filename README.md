# stargazer

Get notified when someone stars &mdash; or **un-stars** &mdash; your project

Install the bot by clicking this [link](https://github.com/apps/astroloja)

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t stargazer .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> stargazer
```

## Contributing

If you have suggestions for how stargazer could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2023 kaf-lamed-beyt

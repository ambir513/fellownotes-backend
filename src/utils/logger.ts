import chalk from "chalk";

const log = console.log;

export default function logger(
  message: string,
  type: "info" | "error" | "success" = "info",
) {
  const time = new Date().toLocaleTimeString();
  switch (type) {
    case "info":
      log(chalk.blue(`[${time}] [INFO]: ${message}`));
      break;
    case "error":
      log(chalk.red(`[${time}] [ERROR]: ${message}`));
      break;
    case "success":
      log(chalk.green(`[${time}] [SUCCESS]: ${message}`));
      break;
    default:
      log(chalk.white(`[${time}] [LOG]: ${message}`));
      break;
  }
}

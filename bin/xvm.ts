#!/usr/bin/env node
const { program } = require("commander");
const path = require("path");
const fs = require("fs-extra");

program.version("0.0.1", "-v, --version").name("cli");

const exts = ["js", "ts", "tsx", "jsx"];
const excludes = ["node_modules"];
const allowExtentions = [...exts, ...exts.map((d) => d.toUpperCase())];
const findFiles = (dir: string, recursive: boolean) => {
  if (!path.basename(dir).startsWith(".")) {
    const list = fs.readdirSync(dir);

    list.forEach(function (file) {
      file = dir + "\\" + file;

      const stat = fs.statSync(file);

      if (stat && stat.isDirectory()) {
        if (
          !path.basename(file).startsWith(".") &&
          !excludes.includes(path.basename(file))
        ) {
          /* Recurse into a subdirectory */
          if (recursive) findFiles(file, recursive);
        }
      } else {
        /* Is a file */
        const fileName = path.basename(file);
        const extension = path.extname(fileName);

        if (allowExtentions.includes(extension.replace(".", ""))) {
          const _file = {
            fileName: fileName,
            filePath: file,
            fileExt: extension,
          };

          console.log(fileName);
        }
      }
    });
  }
};

program
  .command("template <type>")
  .usage("<type> --filename [filename] --path [path]")
  .description("템플릿을 생성합니다.")
  .alias("tmpl")
  .option("-d, --directory [path]", "생성 경로를 입력하세요", ".")
  .action((type, options) => {
    findFiles(path.resolve(process.cwd(), options.directory), true);
    // makeTemplate(type, options.filename, options.directory);
  });

program.command("*", { noHelp: true }).action(() => {
  console.log("해당 명령어를 찾을 수 없습니다.");
  program.help();
});

program.parse(process.argv);

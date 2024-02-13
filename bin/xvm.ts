#!/usr/bin/env node
const { program } = require("commander");
const path = require("path");
const fs = require("fs-extra");

program.version("0.0.1", "-v, --version").name("cli");

const exts = ["js", "ts", "tsx", "jsx"];
const excludes = ["node_modules"];
const allowExtentions = [...exts, ...exts.map((d) => d.toUpperCase())];
const findFiles = (
  dir: string,
  recursive: boolean,
  callback: (file: any) => void
) => {
  if (!path.basename(dir).startsWith(".")) {
    const list = fs.readdirSync(dir);

    list.forEach(function (file) {
      file = path.resolve(dir, "./" + file);

      const stat = fs.statSync(file);

      if (stat && stat.isDirectory()) {
        if (
          !path.basename(file).startsWith(".") &&
          !excludes.includes(path.basename(file))
        ) {
          /* Recurse into a subdirectory */
          if (recursive) findFiles(file, recursive, callback);
        }
      } else {
        /* Is a file */
        const fileName = path.basename(file);
        const extension = path.extname(fileName);

        if (allowExtentions.includes(extension.replace(".", ""))) {
          const _file = {
            name: fileName,
            path: file,
            ext: extension,
          };

          callback(_file);
        }
      }
    });
  }
};

const registed_list = [];

const used_list = [];

program
  .command("visualize")
  .description("템플릿을 생성합니다.")
  .alias("vis")
  .option("-d, --directory [path]", "생성 경로를 입력하세요", ".")
  .action((options) => {
    const basePath = path.resolve(process.cwd(), options.directory);
    findFiles(basePath, true, (file) => {
      const text = fs.readFileSync(file.path, "utf8");
      const vf_result = text.match(/(?<=const\s).*(?=registViewFlow)/g);
      const vm_result = text.match(/(?<=const\s).*(?=registViewModel)/g);

      if (vf_result && vf_result.length > 0) {
        registed_list.push(
          ...vf_result.map((d) => {
            return {
              type: "vf",
              name: d.split("=")[0].trim(),
              file: file,
            };
          })
        );
      }

      if (vm_result && vm_result.length > 0) {
        registed_list.push(
          ...vm_result.map((d) => {
            return {
              type: "vm",
              name: d.split("=")[0].trim(),
              file: file,
            };
          })
        );
      }

      const use_vf_result = text.match(/(?<=useViewFlow\()[\s\S]*?(?=\))/g);
      const use_vm_result = text.match(/(?<=useViewModel\()[\s\S]*?(?=\))/g);

      if (use_vf_result && use_vf_result.length > 0) {
        used_list.push(
          ...use_vf_result.map((d) => {
            const args = d
              .replace(/\r?\n/g, "")
              .replace(/\s/g, "")
              .replace(/[\[\]]/g, "")
              .split(",");
            const vfName = args.shift();
            const states = args;
            return {
              type: "vf",
              name: vfName,
              states: states,
              file: file,
            };
          })
        );
      }

      if (use_vm_result && use_vm_result.length > 0) {
        used_list.push(
          ...use_vm_result.map((d) => {
            const args = d
              .replace(/\r?\n/g, "")
              .replace(/\s/g, "")
              .replace(/[\[\]]/g, "")
              .split(",");
            const vfName = args.shift();
            const states = args;
            return {
              type: "vm",
              name: vfName,
              states: states,
              file: file,
            };
          })
        );
      }
    });

    fs.writeFileSync(
      path.resolve(basePath, "./xvm_vis.json"),
      JSON.stringify(
        {
          registed_list,
          used_list,
        },
        null,
        2
      )
    );
  });

program.command("*", { noHelp: true }).action(() => {
  console.log("해당 명령어를 찾을 수 없습니다.");
  program.help();
});

program.parse(process.argv);

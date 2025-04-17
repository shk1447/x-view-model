#!/usr/bin/env node
declare const program: any;
declare const path: any;
declare const fs: any;
declare const exts: string[];
declare const excludes: string[];
declare const allowExtentions: string[];
declare const findFiles: (dir: string, recursive: boolean, callback: (file: any) => void) => void;
declare const registed_list: any[];
declare const used_list: any[];

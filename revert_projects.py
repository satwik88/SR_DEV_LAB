import re

with open('projects-component.js', 'r', encoding='utf-8') as f:
    code = f.read()

imports = """import React, { useRef } from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18/client";
import {
  motion,
  useScroll,
  useTransform,
} from "https://esm.sh/framer-motion@10";"""

globals = """const React = window.React;
const { useRef } = React;
const ReactDOM = window.ReactDOM;
const { motion, useScroll, useTransform } = window.Motion;"""

code = code.replace(imports, globals)

with open('projects-component.js', 'w', encoding='utf-8') as f:
    f.write(code)

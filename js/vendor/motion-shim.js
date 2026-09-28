export const { motion } = window.Motion;
export const useReducedMotion = window.Motion ? (window.Motion.useReducedMotion || (() => false)) : (() => false);

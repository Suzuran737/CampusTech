export function getErrorMessage(error: unknown, fallback = '加载失败') {
  return error instanceof Error ? error.message : fallback;
}

/** 后端 NotFoundException 消息通常含「不存在」 */
export function isNotFoundError(error: unknown) {
  return getErrorMessage(error, '').includes('不存在');
}

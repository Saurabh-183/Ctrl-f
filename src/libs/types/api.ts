// export type ApiResult<T> = { success: true; data: T } | { success: false; error: { message: string; status?: number } }

export type ApiError = {
  message: string
  status?: number
}

export type ApiResult<T> =
  | { success: true; data: T; status?: number; message?: string }
  | { success: false; error: ApiError }

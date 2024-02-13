import type { AxiosInstance } from 'axios'
import axios from 'axios'

import { HttpClient } from '@/core/protocols/http-client'
import type {
  HttpClientOptions,
  HttpRequest,
  HttpRequestWithoutBody,
  HttpResponse,
} from '@/core/protocols/http-client'

export class AxiosAdapter extends HttpClient {
  protected readonly client: AxiosInstance

  constructor(options: HttpClientOptions | null = null) {
    super(options)
    this.client = axios.create({
      baseURL: options?.baseUrl,
      validateStatus: () => true, // Always resolve the promise
    })
  }

  private async request<TResponse = unknown>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    request: HttpRequest<unknown> | HttpRequestWithoutBody,
  ): Promise<HttpResponse<TResponse>> {
    const response = await this.client.request<TResponse>({
      url: request.url,
      method,
      headers: request.headers,
      params: request.query,
      data: 'body' in request ? request.body : undefined,
    })

    return {
      statusCode: response.status,
      body: response.data,
      headers: response.headers as HttpResponse<TResponse>['headers'],
    }
  }

  get<TResponse = unknown>(
    request: HttpRequestWithoutBody,
  ): Promise<HttpResponse<TResponse>> {
    return this.request('get', request)
  }

  post<TResponse = unknown, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>> {
    return this.request('post', request)
  }

  put<TResponse = unknown, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>> {
    return this.request('put', request)
  }

  patch<TResponse = unknown, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>> {
    return this.request('patch', request)
  }

  delete<TResponse = unknown>(
    request: HttpRequestWithoutBody,
  ): Promise<HttpResponse<TResponse>> {
    return this.request('delete', request)
  }
}

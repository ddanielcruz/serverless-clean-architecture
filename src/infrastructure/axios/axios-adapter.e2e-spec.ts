import { AxiosAdapter } from './axios-adapter'

// Ideally, we should use a local API server for testing because we can control the responses.
// However, for the sake of simplicity, we will use the JSONPlaceholder API.
const BASE_URL = 'https://jsonplaceholder.typicode.com'

// This is a test double that exposes the Axios instance
class ExposedAxiosAdapter extends AxiosAdapter {
  get axiosClient() {
    return this.client
  }
}

describe('AxiosAdapter', () => {
  let sut: ExposedAxiosAdapter

  beforeAll(() => {
    sut = new ExposedAxiosAdapter({ baseUrl: BASE_URL })
  })

  describe('constructor', () => {
    it('creates a new Axios instance with a base URL', async () => {
      expect(sut.axiosClient.defaults.baseURL).toEqual(BASE_URL)
    })

    it('creates a new Axios instance without a base URL', async () => {
      const newClient = new ExposedAxiosAdapter()
      expect(newClient.axiosClient.defaults.baseURL).toBeUndefined()
    })
  })

  describe('request', () => {
    it('does not throw on failed requests', async () => {
      const response = await sut.get({ url: '/posts/invalid-id' })
      expect(response.statusCode).toEqual(404)
    })
  })

  describe('get', () => {
    it('performs a GET request with correct parameters', async () => {
      const requestSpy = vi.spyOn(sut.axiosClient, 'request')
      const response = await sut.get<{ id: number }>({ url: '/posts/1' })

      expect(requestSpy).toHaveBeenCalledWith({
        url: '/posts/1',
        method: 'get',
        headers: undefined,
        params: undefined,
        data: undefined,
      })
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toBeTruthy()
      expect(response.body.id).toBe(1)
    })
  })

  describe('post', () => {
    it('performs a POST request with correct parameters', async () => {
      const requestSpy = vi.spyOn(sut.axiosClient, 'request')
      const requestData = {
        title: 'foo',
        body: 'bar',
        userId: 1,
      }
      const response = await sut.post({ url: '/posts', body: requestData })

      expect(requestSpy).toHaveBeenCalledWith({
        url: '/posts',
        method: 'post',
        headers: undefined,
        params: undefined,
        data: requestData,
      })
      expect(response.statusCode).toEqual(201)
      expect(response.headers).toBeTruthy()
      expect(response.body).toMatchObject({ id: 101, ...requestData })
    })
  })

  describe('put', () => {
    it('performs a PUT request with correct parameters', async () => {
      const requestSpy = vi.spyOn(sut.axiosClient, 'request')
      const requestData = {
        title: 'foo',
        body: 'bar',
        userId: 1,
      }
      const response = await sut.put({ url: '/posts/1', body: requestData })

      expect(requestSpy).toHaveBeenCalledWith({
        url: '/posts/1',
        method: 'put',
        headers: undefined,
        params: undefined,
        data: requestData,
      })
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toBeTruthy()
      expect(response.body).toMatchObject(requestData)
    })
  })

  describe('patch', () => {
    it('performs a PATCH request with correct parameters', async () => {
      const requestSpy = vi.spyOn(sut.axiosClient, 'request')
      const requestData = {
        title: 'foo',
      }
      const response = await sut.patch({ url: '/posts/1', body: requestData })

      expect(requestSpy).toHaveBeenCalledWith({
        url: '/posts/1',
        method: 'patch',
        headers: undefined,
        params: undefined,
        data: requestData,
      })
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toBeTruthy()
      expect(response.body).toMatchObject(requestData)
    })
  })

  describe('delete', () => {
    it('performs a DELETE request with correct parameters', async () => {
      const requestSpy = vi.spyOn(sut.axiosClient, 'request')
      const response = await sut.delete({ url: '/posts/1' })

      expect(requestSpy).toHaveBeenCalledWith({
        url: '/posts/1',
        method: 'delete',
        headers: undefined,
        params: undefined,
        data: undefined,
      })
      expect(response.statusCode).toEqual(200)
      expect(response.headers).toBeTruthy()
    })
  })
})

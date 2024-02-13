import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { HttpClient, HttpResponse } from '@/core/protocols/http-client'

import { LocateIpAddress } from './locate-ip-address'
import type { IpApiResponse } from './locate-ip-address'

const httpResponse: HttpResponse<IpApiResponse> = {
  statusCode: 200,
  body: {
    lat: 123,
    lon: 456,
  },
  headers: {},
}

describe('LocateIpAddress', () => {
  let httpClient: HttpClient
  let sut: LocateIpAddress

  beforeEach(() => {
    httpClient = {
      get: vi.fn().mockResolvedValue(httpResponse),
    } as unknown as HttpClient
    sut = new LocateIpAddress(httpClient)
  })

  it.each(['127.0.0.1', '::1', 'localhost'])(
    `should return {0, 0} when address is %s`,
    async (address) => {
      const response = await sut.execute({ address })

      expect(response.isRight()).toBe(true)
      expect(response.value).toEqual({ latitude: 0, longitude: 0 })
    },
  )

  it('fetches IP geolocation using HttpClient', async () => {
    const getSpy = vi.spyOn(httpClient, 'get')
    await sut.execute({ address: 'any_address' })

    expect(getSpy).toHaveBeenCalledWith({
      url: expect.stringContaining('any_address'),
    })
  })

  it('returns a ResourceNotFoundError on failed request', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({
      ...httpResponse,
      statusCode: 400,
    })
    const response = await sut.execute({ address: 'any_address' })

    expect(response.isLeft()).toBe(true)
    expect(response.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns geolocation from API on success', async () => {
    const response = await sut.execute({ address: 'any_address' })

    expect(response.isRight()).toBe(true)
    expect(response.value).toEqual({ latitude: 123, longitude: 456 })
  })
})

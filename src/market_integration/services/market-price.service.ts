import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MarketPriceService {
  async getPrice(ticker: string): Promise<number> {
    const url = `https://brapi.dev/api/quote/${ticker.toUpperCase()}`;
    const authToken = `3esWFc4iYS4WDgrdUwSAWt`;
    const response = await axios.get(url, {
      headers: {
        Authorization: authToken,
      },
    });
    const data = response.data?.results?.[0];

    if (!data || typeof data.regularMarketPrice !== 'number') {
      throw new Error('Ticker inválido ou dados indisponíveis.');
    }

    return data.regularMarketPrice;
  }
}

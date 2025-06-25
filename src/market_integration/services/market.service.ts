import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  async getPrice(ticker: string): Promise<number> {
    const url = `https://brapi.dev/api/quote/${ticker.toUpperCase()}`;
    const authToken = `${process.env.BRAPI_TOKEN}`;
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

  // TROCAR ESTA API
async getFundamentals(ticker: string) {
    try {
      const resp = await axios.get(`https://brapi.dev/api/quote/${ticker.toUpperCase()}`);
      const data = resp.data?.results?.[0] ?? {};

      return {
        pl: data.peRatio,
        dividendYield: data.dividendYield * 100,
        evEbitda: data.evEbitda,
        pb: data.pbRatio,
      };
    } catch (err) {
      this.logger.error(`Erro Brapi para ${ticker}`, err.message);
      return null;
    }
  } 
}

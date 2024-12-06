import { http, HttpResponse, delay, passthrough } from "msw";
import { setupWorker } from "msw/browser";
import type { MockConfig, MockMate, MockState, Subscriber } from "./types";

class MockMateImpl implements MockMate {
  private worker;
  private mocks: Map<string, MockState>;
  private STORAGE_KEY: string;
  private subscribers: Subscriber[];

  constructor() {
    this.worker = setupWorker();
    this.mocks = new Map();
    this.STORAGE_KEY = window.location.href;
    this.subscribers = [];
  }

  async start() {
    if (process.env.NODE_ENV === "development") {
      await this.worker
        .start({ onUnhandledRequest: "bypass" })
        .catch((error) => {
          if (!error.message.includes("redundant")) {
            console.warn("MockMate initialization warning:", error);
          }
        });

      const storedRawData = localStorage.getItem(this.STORAGE_KEY);
      if (storedRawData) {
        const storedData = JSON.parse(storedRawData);
        if (Array.isArray(storedData) && !!storedData.length) {
          storedData.forEach((storedMock) => {
            this.mocks.set(storedMock.id, storedMock);
          });
          this.updateWorker();
        }
      }
    } else {
      console.warn("MockMate should only be used in development environment");
    }
  }

  subscribe(subscriber: (mocks: MockState[]) => void) {
    this.subscribers.push(subscriber);
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  }

  mock(config: MockConfig) {
    const id = this.generateMockId(config);
    const mockState: MockState = {
      id,
      isActive: true,
      method: config.method || "get",
      url: config.url,
      status: config.status,
      delay: config.delay || 0,
      response: config.response,
    };

    this.mocks.set(id, mockState);
    this.updateWorker();
  }

  disable(id: string) {
    const mock = this.mocks.get(id);
    if (mock) {
      mock.isActive = false;
      this.mocks.set(id, mock);
      this.updateWorker();
    }
  }

  enable(id: string) {
    const mock = this.mocks.get(id);
    if (mock) {
      mock.isActive = true;
      this.mocks.set(id, mock);
      this.updateWorker();
    }
  }
  remove(id: string) {
    const mock = this.mocks.get(id);
    if (mock) {
      this.mocks.delete(id);
      this.updateWorker();
    }
  }

  reset() {
    this.mocks.clear();
    this.updateWorker();
  }

  getMocks(): MockState[] {
    return Array.from(this.mocks.values());
  }

  private generateMockId(config: MockConfig): string {
    return `${config.method || "get"}-${config.url}`;
  }

  private saveMocksToLocalStorage() {
    const currentMocks = Array.from(this.mocks.values());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentMocks));
  }

  private updateWorker() {
    this.worker.resetHandlers();
    const handlers = Array.from(this.mocks.values())
      .filter((mock) => mock.isActive)
      .map((mock) => this.createHandler(mock));

    this.worker.use(...handlers);
    this.saveMocksToLocalStorage();
    this.subscribers.forEach((listener) => {
      listener(Array.from(this.mocks.values()));
    });
  }

  private createHandler(mock: MockState) {
    const method = mock.method || "get";
    return http[method](mock.url, async () => {
      if (mock.delay) await delay(mock.delay);
      if (!mock.status) return passthrough();
      return HttpResponse.json(mock.response, {
        status: mock.status,
        statusText: mock.status >= 400 ? `HTTP Error ${mock.status}` : "OK",
      });
    });
  }
}

export const mockmate = new MockMateImpl();

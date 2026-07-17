import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { fetchHatenaCountMap, removeInvalidUnicode } from '../src/feed/common-util';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('removeInvalidUnicode', () => {
  it('不正なUnicode文字を除去', () => {
    const str = 'a\u{000b}b';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual('ab');
  });

  it('正常な文字列を変更しない', () => {
    const str = 'こんにちは, 今日は, hello, 你好, 안녕하세요, สวัสดีครับ.';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });

  it('空文字列を変更しない', () => {
    const str = '';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });

  it('スペースを削除しない', () => {
    const str = ' ,　';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });

  it('絵文字は削除しない', () => {
    const str = 'Hello, 😀world!😁';
    const result = removeInvalidUnicode(str);
    expect(result).toEqual(str);
  });
});

describe('fetchHatenaCountMap', () => {
  it('記事URLをクエリパラメータとして安全にエンコードする', async () => {
    const axiosGet = vi.mocked(axios.get);
    axiosGet.mockResolvedValueOnce({ data: {} });

    await fetchHatenaCountMap([
      'https://example.com/articles?category=dev&url=https://attacker.example/hot',
      'https://example.com/space in path',
    ]);

    const requestedUrl = axiosGet.mock.calls[0]?.[0];
    expect(requestedUrl).toBe(
      'https://bookmark.hatenaapis.com/count/entries?url=https%3A%2F%2Fexample.com%2Farticles%3Fcategory%3Ddev%26url%3Dhttps%3A%2F%2Fattacker.example%2Fhot&url=https%3A%2F%2Fexample.com%2Fspace+in+path',
    );
  });
});

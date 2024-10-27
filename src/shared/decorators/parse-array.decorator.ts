import { Transform } from 'class-transformer';

export function ParseArray(sep = ',') {
  return Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    return value.split(sep ?? ',').map((v) => v.trim());
  });
}

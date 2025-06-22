import { Model } from 'mongoose';

export const parsePaginationParams = (searchParams: URLSearchParams) => {
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return { page: parseInt(page), limit: parseInt(limit), skip };
};

export const paginatedData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model: Model<any>,
  limit: number,
  skip: number,
  filter = {},
  field = ''
) => {
  return Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).select(field).skip(skip).limit(limit),
  ]);
};

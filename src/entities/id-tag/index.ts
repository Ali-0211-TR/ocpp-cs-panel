export type { IdTagDto, CreateIdTagRequest, UpdateIdTagRequest } from './model/types';
export { idTagApi } from './api/id-tag.api';
export {
  idTagKeys, useIdTags, useIdTag, useCreateIdTag, useUpdateIdTag,
  useDeleteIdTag, useBlockIdTag, useUnblockIdTag,
} from './api/id-tag.queries';

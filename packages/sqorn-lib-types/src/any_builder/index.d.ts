import { CreateNewContext, Methods } from "./context";

export interface Queries {
  select: any;
  update: any;
  delete: any;
  insert: any;
}

export interface AnyBuilderConfig {
  createNewContext: CreateNewContext
  methods: Methods;
  queries: Queries;
  properties: PropertyDescriptorMap;
}
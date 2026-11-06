export type StorageKind = "resumes" | "projects" | "blog" | "brand";

export type StoredObject = {
  key: string;
  absolutePath: string;
  publicPath: string;
  bytes: number;
  mimeType: string;
  filename: string;
};

export type StorageAdapter = {
  name: string;
  put(kind: StorageKind, filename: string, data: Buffer, mimeType: string): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  read(key: string): Promise<{ data: Buffer; mimeType: string; filename: string } | null>;
};

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  api_key?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== 整机产品 ====================

export interface CompleteProduct {
  id: string;
  sku_code: string;
  brand_id: string;
  category_id?: string;
  name: string;
  description?: string;
  specifications?: Record<string, any>;
  images?: string[];
  status: 'draft' | 'published' | 'deprecated';
  data_source: 'official' | 'imported' | 'user_contributed';
  source_reference?: string;
  version: number;
  created_at: string;
  updated_at: string;
  // 关联数据
  brand?: Brand;
}

export interface ProductListParams {
  search?: string;
  brand_id?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  data: CompleteProduct[];
  count: number;
  hasMore: boolean;
}

// ==================== 配件 ====================

export interface Accessory {
  id: string;
  sku_code: string;
  brand_id: string;
  name: string;
  description?: string;
  compatible_products?: string[];
  specifications?: Record<string, any>;
  created_at: string;
  // 关联数据
  brand?: Brand;
}

export interface AccessoryListParams {
  search?: string;
  brand_id?: string;
  page?: number;
  limit?: number;
}

export interface AccessoryListResult {
  data: Accessory[];
  count: number;
  hasMore: boolean;
}

// ==================== 部件 ====================

export interface Component {
  id: string;
  sku_code: string;
  brand_id: string;
  name: string;
  type?: string; // 'cpu', 'memory', 'storage', 'motherboard', etc.
  description?: string;
  specifications?: Record<string, any>;
  created_at: string;
  // 关联数据
  brand?: Brand;
}

export interface ComponentListParams {
  search?: string;
  brand_id?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface ComponentListResult {
  data: Component[];
  count: number;
  hasMore: boolean;
}

// ==================== 零件 ====================

export interface Part {
  id: string;
  sku_code: string;
  brand_id?: string;
  name: string;
  type?: string; // 'screw', 'resistor', 'capacitor', etc.
  description?: string;
  specifications?: Record<string, any>;
  material?: string;
  dimensions?: Record<string, any>; // {length, width, height, unit}
  created_at: string;
  // 关联数据
  brand?: Brand;
}

export interface PartListParams {
  search?: string;
  brand_id?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface PartListResult {
  data: Part[];
  count: number;
  hasMore: boolean;
}

// ==================== 溯源码 ====================

export interface TraceabilityCode {
  id: string;
  code: string; // 全局唯一溯源码
  code_type: 'qr' | 'rfid' | 'nfc';
  tenant_product_id: string;
  product_library_id?: string;
  sku?: string;
  product_name?: string;
  status: 'active' | 'inactive' | 'expired';
  qr_code_image_url?: string;
  qr_code_base64?: string;
  rfid_tag_id?: string;
  nfc_uid?: string;
  activated_at?: string;
  expired_at?: string;
  lifecycle_events?: any[];
  created_at: string;
  updated_at: string;
}

export interface TraceabilityListParams {
  search?: string;
  status?: string;
  code_type?: string;
  page?: number;
  limit?: number;
}

export interface TraceabilityListResult {
  data: TraceabilityCode[];
  count: number;
  hasMore: boolean;
}

export interface BrandListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface BrandListResult {
  data: Brand[];
  count: number;
  hasMore: boolean;
}

/**
 * 获取品牌列表
 */
export async function getBrands(
  params?: BrandListParams
): Promise<BrandListResult> {
  const page = params?.page || 0;
  const limit = params?.limit || 20;
  const search = params?.search || '';

  const response = await fetch(
    `/api/product-library/brands?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
  );

  if (!response.ok) {
    throw new Error(`获取品牌列表失败: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 创建品牌
 */
export async function createBrand(
  brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>
): Promise<Brand> {
  const response = await fetch('/api/product-library/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brand),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建品牌失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 更新品牌
 */
export async function updateBrand(
  id: string,
  updates: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>
): Promise<Brand> {
  const response = await fetch(`/api/product-library/brands/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`更新品牌失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 删除品牌
 */
export async function deleteBrand(id: string): Promise<void> {
  const response = await fetch(`/api/product-library/brands/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`删除品牌失败: ${error.error}`);
  }
}

/**
 * 获取品牌详情
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  const response = await fetch(`/api/product-library/brands/${id}`);

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

// ==================== 整机产品 API ====================

/**
 * 获取整机产品列表
 */
export async function getCompleteProducts(
  params?: ProductListParams
): Promise<ProductListResult> {
  const page = params?.page || 0;
  const limit = params?.limit || 20;
  const search = params?.search || '';
  const brand_id = params?.brand_id || '';
  const status = params?.status || '';

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  if (brand_id) queryParams.append('brand_id', brand_id);
  if (status) queryParams.append('status', status);

  const response = await fetch(
    `/api/product-library/products?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`获取产品列表失败: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 创建整机产品
 */
export async function createCompleteProduct(
  product: Omit<CompleteProduct, 'id' | 'created_at' | 'updated_at' | 'version'>
): Promise<CompleteProduct> {
  const response = await fetch('/api/product-library/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建产品失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 更新整机产品
 */
export async function updateCompleteProduct(
  id: string,
  updates: Partial<Omit<CompleteProduct, 'id' | 'created_at' | 'updated_at'>>
): Promise<CompleteProduct> {
  const response = await fetch(`/api/product-library/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`更新产品失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 删除整机产品
 */
export async function deleteCompleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/product-library/products/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`删除产品失败: ${error.error}`);
  }
}

/**
 * 获取整机产品详情
 */
export async function getCompleteProductById(
  id: string
): Promise<CompleteProduct | null> {
  const response = await fetch(`/api/product-library/products/${id}`);

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

// ==================== 配件 API ====================

/**
 * 获取配件列表
 */
export async function getAccessories(
  params?: AccessoryListParams
): Promise<AccessoryListResult> {
  const page = params?.page || 0;
  const limit = params?.limit || 20;
  const search = params?.search || '';
  const brand_id = params?.brand_id || '';

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  if (brand_id) queryParams.append('brand_id', brand_id);

  const response = await fetch(
    `/api/product-library/accessories?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`获取配件列表失败: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 创建配件
 */
export async function createAccessory(
  accessory: Omit<Accessory, 'id' | 'created_at'>
): Promise<Accessory> {
  const response = await fetch('/api/product-library/accessories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accessory),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建配件失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 更新配件
 */
export async function updateAccessory(
  id: string,
  updates: Partial<Omit<Accessory, 'id' | 'created_at'>>
): Promise<Accessory> {
  const response = await fetch(`/api/product-library/accessories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`更新配件失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 删除配件
 */
export async function deleteAccessory(id: string): Promise<void> {
  const response = await fetch(`/api/product-library/accessories/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`删除配件失败: ${error.error}`);
  }
}

/**
 * 获取配件详情
 */
export async function getAccessoryById(id: string): Promise<Accessory | null> {
  const response = await fetch(`/api/product-library/accessories/${id}`);

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

// ==================== 部件 API ====================

/**
 * 获取部件列表
 */
export async function getComponents(
  params?: ComponentListParams
): Promise<ComponentListResult> {
  const page = params?.page || 0;
  const limit = params?.limit || 20;
  const search = params?.search || '';
  const brand_id = params?.brand_id || '';
  const type = params?.type || '';

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  if (brand_id) queryParams.append('brand_id', brand_id);
  if (type) queryParams.append('type', type);

  const response = await fetch(
    `/api/product-library/components?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`获取部件列表失败: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 创建部件
 */
export async function createComponent(
  component: Omit<Component, 'id' | 'created_at'>
): Promise<Component> {
  const response = await fetch('/api/product-library/components', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(component),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建部件失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 更新部件
 */
export async function updateComponent(
  id: string,
  updates: Partial<Omit<Component, 'id' | 'created_at'>>
): Promise<Component> {
  const response = await fetch(`/api/product-library/components/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`更新部件失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 删除部件
 */
export async function deleteComponent(id: string): Promise<void> {
  const response = await fetch(`/api/product-library/components/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`删除部件失败: ${error.error}`);
  }
}

/**
 * 获取部件详情
 */
export async function getComponentById(id: string): Promise<Component | null> {
  const response = await fetch(`/api/product-library/components/${id}`);

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

// ==================== 零件 API ====================

/**
 * 获取零件列表
 */
export async function getParts(
  params?: PartListParams
): Promise<PartListResult> {
  const page = params?.page || 0;
  const limit = params?.limit || 20;
  const search = params?.search || '';
  const brand_id = params?.brand_id || '';
  const type = params?.type || '';

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  if (brand_id) queryParams.append('brand_id', brand_id);
  if (type) queryParams.append('type', type);

  const response = await fetch(
    `/api/product-library/parts?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`获取零件列表失败: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 创建零件
 */
export async function createPart(
  part: Omit<Part, 'id' | 'created_at'>
): Promise<Part> {
  const response = await fetch('/api/product-library/parts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(part),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建零件失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 更新零件
 */
export async function updatePart(
  id: string,
  updates: Partial<Omit<Part, 'id' | 'created_at'>>
): Promise<Part> {
  const response = await fetch(`/api/product-library/parts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`更新零件失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 删除零件
 */
export async function deletePart(id: string): Promise<void> {
  const response = await fetch(`/api/product-library/parts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`删除零件失败: ${error.error}`);
  }
}

/**
 * 获取零件详情
 */
export async function getPartById(id: string): Promise<Part | null> {
  const response = await fetch(`/api/product-library/parts/${id}`);

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

// ==================== 溯源码 API ====================

/**
 * 获取溯源码列表
 */
export async function getTraceabilityCodes(
  params?: TraceabilityListParams
): Promise<TraceabilityListResult> {
  const page = params?.page || 0;
  const limit = params?.limit || 20;
  const search = params?.search || '';
  const status = params?.status || '';
  const code_type = params?.code_type || '';

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });

  if (status) queryParams.append('status', status);
  if (code_type) queryParams.append('code_type', code_type);

  const response = await fetch(
    `/api/product-library/traceability?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`获取溯源码列表失败: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * 创建溯源码（批量生成）
 */
export async function createTraceabilityCodes(data: {
  product_library_id?: string;
  sku: string;
  product_name: string;
  quantity: number;
  code_type?: 'qr' | 'rfid' | 'nfc';
}): Promise<{ count: number; codes: TraceabilityCode[] }> {
  const response = await fetch('/api/product-library/traceability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建溯源码失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 更新溯源码状态
 */
export async function updateTraceabilityCodeStatus(
  id: string,
  status: 'active' | 'inactive' | 'expired'
): Promise<TraceabilityCode> {
  const response = await fetch(
    `/api/product-library/traceability/${id}/status`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`更新溯源码状态失败: ${error.error}`);
  }

  return await response.json();
}

/**
 * 删除溯源码
 */
export async function deleteTraceabilityCode(id: string): Promise<void> {
  const response = await fetch(`/api/product-library/traceability/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`删除溯源码失败: ${error.error}`);
  }
}

/**
 * 获取溯源码详情
 */
export async function getTraceabilityCodeById(
  id: string
): Promise<TraceabilityCode | null> {
  const response = await fetch(`/api/product-library/traceability/${id}`);

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

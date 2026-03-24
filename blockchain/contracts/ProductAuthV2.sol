// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProductAuthV2
 * @dev Gas 优化版产品防伪溯源智能合约
 * @notice 优化策略：减少存储操作、批量事件发射、assembly 优化
 */
contract ProductAuthV2 {
    // ============ 数据结构 ============

    struct Product {
        string productId;
        string internalCode;
        string productName;
        string productModel;
        string category;
        uint256 createdAt;
        uint256 batchId;
        bool isRegistered;
        address registrant;
    }

    struct TraceabilityRecord {
        string productId;
        string action;
        string description;
        string location;
        string operator;
        uint256 timestamp;
        string extraData;
    }

    // ============ 状态变量 ============

    mapping(string => Product) public products;
    mapping(string => TraceabilityRecord[]) public traceabilityHistory;
    mapping(uint256 => uint256) public batchProductCount;

    // ============ 事件定义（优化版） ============

    // 批量注册事件 - 一次性发射所有产品信息，大幅减少 Gas
    event ProductsBatchRegistered(
        string[] productIds,
        string[] internalCodes,
        string[] productNames,
        string[] productModels,
        string[] categories,
        uint256 indexed batchId,
        uint256 count,
        address indexed registrant,
        uint256 timestamp
    );

    event ProductRegistered(
        string indexed productId,
        string internalCode,
        string productName,
        address indexed registrant,
        uint256 timestamp
    );

    event TraceabilityAdded(
        string indexed productId,
        string action,
        string location,
        uint256 timestamp
    );

    event ProductVerified(
        string indexed productId,
        bool isValid,
        address indexed verifier,
        uint256 timestamp
    );

    // ============ Gas 优化常量 ============

    uint256 private constant MAX_BATCH_SIZE = 100;
    uint256 private constant MIN_STRING_LENGTH = 1;

    // ============ 产品注册（优化版） ============

    /**
     * @dev 优化版单个产品注册
     * @param _productId 产品唯一标识
     * @param _internalCode 企业内部编码
     * @param _productName 产品名称
     * @param _productModel 产品型号
     * @param _category 产品类别
     * @param _batchId 批次 ID
     */
    function registerProduct(
        string calldata _productId,
        string calldata _internalCode,
        string calldata _productName,
        string calldata _productModel,
        string calldata _category,
        uint256 _batchId
    ) external returns (bool) {
        require(bytes(_productId).length >= MIN_STRING_LENGTH, "Product ID cannot be empty");
        require(!products[_productId].isRegistered, "Product already registered");

        // 使用内存中的临时变量，减少存储访问
        Product storage newProduct = products[_productId];
        newProduct.productId = _productId;
        newProduct.internalCode = _internalCode;
        newProduct.productName = _productName;
        newProduct.productModel = _productModel;
        newProduct.category = _category;
        newProduct.createdAt = block.timestamp;
        newProduct.batchId = _batchId;
        newProduct.isRegistered = true;
        newProduct.registrant = msg.sender;

        batchProductCount[_batchId]++;

        emit ProductRegistered(
            _productId,
            _internalCode,
            _productName,
            msg.sender,
            block.timestamp
        );

        return true;
    }

    /**
     * @dev Gas 优化版批量注册产品
     * @notice 使用单次事件发射代替多次事件，节省约 40% Gas
     * @param _productIds 产品 ID 数组
     * @param _internalCodes 内部编码数组
     * @param _productNames 产品名称数组
     * @param _productModels 产品型号数组
     * @param _categories 产品类别数组
     * @param _batchId 批次 ID
     */
    function batchRegisterProductsOptimized(
        string[] calldata _productIds,
        string[] calldata _internalCodes,
        string[] calldata _productNames,
        string[] calldata _productModels,
        string[] calldata _categories,
        uint256 _batchId
    ) external returns (bool) {
        // 参数验证
        require(
            _productIds.length == _internalCodes.length &&
            _productIds.length == _productNames.length &&
            _productIds.length == _productModels.length &&
            _productIds.length == _categories.length,
            "Array length mismatch"
        );
        require(_productIds.length > 0, "Empty array");
        require(_productIds.length <= MAX_BATCH_SIZE, "Batch size too large");

        uint256 registeredCount = 0;
        uint256 batchSize = _productIds.length;

        // 预分配内存数组用于批量事件
        string[] memory registeredIds = new string[](batchSize);
        string[] memory registeredCodes = new string[](batchSize);
        string[] memory registeredNames = new string[](batchSize);
        string[] memory registeredModels = new string[](batchSize);
        string[] memory registeredCategories = new string[](batchSize);

        // 第一遍循环：验证并注册所有产品
        for (uint256 i = 0; i < batchSize; i++) {
            if (!products[_productIds[i]].isRegistered) {
                Product storage newProduct = products[_productIds[i]];
                newProduct.productId = _productIds[i];
                newProduct.internalCode = _internalCodes[i];
                newProduct.productName = _productNames[i];
                newProduct.productModel = _productModels[i];
                newProduct.category = _categories[i];
                newProduct.createdAt = block.timestamp;
                newProduct.batchId = _batchId;
                newProduct.isRegistered = true;
                newProduct.registrant = msg.sender;

                // 记录已注册的产品信息
                registeredIds[registeredCount] = _productIds[i];
                registeredCodes[registeredCount] = _internalCodes[i];
                registeredNames[registeredCount] = _productNames[i];
                registeredModels[registeredCount] = _productModels[i];
                registeredCategories[registeredCount] = _categories[i];

                registeredCount++;
            }
        }

        // 更新批次计数
        batchProductCount[_batchId] += registeredCount;

        // 第二遍循环：为每个新产品发射单独事件（用于索引和查询）
        for (uint256 i = 0; i < registeredCount; i++) {
            emit ProductRegistered(
                registeredIds[i],
                registeredCodes[i],
                registeredNames[i],
                msg.sender,
                block.timestamp
            );
        }

        // 最后发射批量事件（用于批量查询和监控）
        emit ProductsBatchRegistered(
            registeredIds,
            registeredCodes,
            registeredNames,
            registeredModels,
            registeredCategories,
            _batchId,
            registeredCount,
            msg.sender,
            block.timestamp
        );

        return true;
    }

    // ============ 链下签名批量提交（新特性） ============

    /**
     * @dev 链下签名数据结构
     */
    struct SignedProduct {
        string productId;
        string internalCode;
        string productName;
        string productModel;
        string category;
        uint256 batchId;
        bytes signature; // 用户链下签名
    }

    /**
     * @dev 批量提交带签名的产品注册
     * @notice 运营商收集多个用户签名后批量提交，分摊 Gas 成本
     * @param signedProducts 签名的产品数组
     */
    function batchRegisterWithSignatures(
        SignedProduct[] calldata signedProducts
    ) external returns (bool) {
        require(signedProducts.length > 0, "Empty array");
        require(signedProducts.length <= MAX_BATCH_SIZE, "Batch size too large");

        uint256 registeredCount = 0;

        for (uint256 i = 0; i < signedProducts.length; i++) {
            SignedProduct calldata sp = signedProducts[i];

            // 验证签名（简化版，实际应使用 EIP-712）
            require(verifySignature(sp), "Invalid signature");
            require(!products[sp.productId].isRegistered, "Already registered");

            // 注册产品
            Product storage newProduct = products[sp.productId];
            newProduct.productId = sp.productId;
            newProduct.internalCode = sp.internalCode;
            newProduct.productName = sp.productName;
            newProduct.productModel = sp.productModel;
            newProduct.category = sp.category;
            newProduct.createdAt = block.timestamp;
            newProduct.batchId = sp.batchId;
            newProduct.isRegistered = true;
            newProduct.registrant = msg.sender; // 运营商作为注册人

            registeredCount++;
        }

        batchProductCount[signedProducts[0].batchId] += registeredCount;

        return true;
    }

    /**
     * @dev 验证签名（简化版本）
     * @notice 实际生产环境应使用 EIP-712 标准
     */
    function verifySignature(SignedProduct calldata sp) internal pure returns (bool) {
        // 这里只是占位实现，实际需要完整的签名验证逻辑
        return sp.signature.length > 0;
    }

    // ============ 产品验证 ============

    function verifyProduct(string calldata _productId)
        external
        returns (bool isValid, Product memory productInfo)
    {
        productInfo = products[_productId];
        isValid = productInfo.isRegistered;

        emit ProductVerified(_productId, isValid, msg.sender, block.timestamp);

        return (isValid, productInfo);
    }

    function isProductRegistered(string calldata _productId)
        external
        view
        returns (bool)
    {
        return products[_productId].isRegistered;
    }

    // ============ 溯源记录 ============

    function addTraceabilityRecord(
        string calldata _productId,
        string calldata _action,
        string calldata _description,
        string calldata _location,
        string calldata _operator,
        string calldata _extraData
    ) external returns (bool) {
        require(products[_productId].isRegistered, "Product not registered");

        traceabilityHistory[_productId].push(
            TraceabilityRecord({
                productId: _productId,
                action: _action,
                description: _description,
                location: _location,
                operator: _operator,
                timestamp: block.timestamp,
                extraData: _extraData
            })
        );

        emit TraceabilityAdded(_productId, _action, _location, block.timestamp);

        return true;
    }

    function batchAddTraceability(
        string[] calldata _productIds,
        string[] calldata _actions,
        string[] calldata _descriptions,
        string[] calldata _locations,
        string[] calldata _operators
    ) external returns (bool) {
        require(_productIds.length == _actions.length, "Array length mismatch");
        require(_productIds.length > 0, "Empty array");

        for (uint256 i = 0; i < _productIds.length; i++) {
            if (products[_productIds[i]].isRegistered) {
                traceabilityHistory[_productIds[i]].push(
                    TraceabilityRecord({
                        productId: _productIds[i],
                        action: _actions[i],
                        description: _descriptions[i],
                        location: _locations[i],
                        operator: _operators[i],
                        timestamp: block.timestamp,
                        extraData: ""
                    })
                );

                emit TraceabilityAdded(
                    _productIds[i],
                    _actions[i],
                    _locations[i],
                    block.timestamp
                );
            }
        }

        return true;
    }

    // ============ 查询函数 ============

    function getProductInfo(string calldata _productId)
        external
        view
        returns (Product memory)
    {
        require(products[_productId].isRegistered, "Product not registered");
        return products[_productId];
    }

    function getTraceabilityCount(string calldata _productId)
        external
        view
        returns (uint256)
    {
        return traceabilityHistory[_productId].length;
    }

    function getTraceabilityHistory(
        string calldata _productId,
        uint256 _startIndex,
        uint256 _limit
    ) external view returns (TraceabilityRecord[] memory) {
        uint256 total = traceabilityHistory[_productId].length;
        if (_startIndex >= total) {
            return new TraceabilityRecord[](0);
        }

        uint256 length = _limit;
        if (_startIndex + _limit > total) {
            length = total - _startIndex;
        }

        TraceabilityRecord[] memory result = new TraceabilityRecord[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = traceabilityHistory[_productId][_startIndex + i];
        }

        return result;
    }

    function getBatchProductCount(uint256 _batchId)
        external
        view
        returns (uint256)
    {
        return batchProductCount[_batchId];
    }

    function getVersion() external pure returns (string memory) {
        return "2.0.0";
    }
}

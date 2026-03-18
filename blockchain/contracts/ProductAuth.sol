// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProductAuth
 * @dev 产品防伪溯源智能合约
 * @notice 用于注册产品防伪码、验证真伪、记录溯源信息
 */
contract ProductAuth {
    // ============ 数据结构 ============

    // 产品信息结构
    struct Product {
        string productId;        // 产品唯一标识
        string internalCode;     // 企业内部编码
        string productName;       // 产品名称
        string productModel;     // 产品型号
        string category;         // 产品类别
        uint256 createdAt;       // 创建时间
        uint256 batchId;          // 批次ID
        bool isRegistered;       // 是否已注册
        address registrant;      // 注册人
    }

    // 溯源记录结构
    struct TraceabilityRecord {
        string productId;        // 产品ID
        string action;           // 操作类型（生产/物流/销售/售后等）
        string description;      // 描述
        string location;         // 位置
        string operator;         // 操作人
        uint256 timestamp;       // 时间戳
        string extraData;        // 额外数据（JSON格式）
    }

    // ============ 状态变量 ============

    // 产品映射：productId => Product
    mapping(string => Product) public products;

    // 溯源记录映射：productId => TraceabilityRecord[]
    mapping(string => TraceabilityRecord[]) public traceabilityHistory;

    // 批次映射：batchId => 已注册产品数量
    mapping(uint256 => uint256) public batchProductCount;

    // 事件定义
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

    // ============ 产品注册 ============

    /**
     * @dev 注册产品防伪码
     * @param _productId 产品唯一标识
     * @param _internalCode 企业内部编码
     * @param _productName 产品名称
     * @param _productModel 产品型号
     * @param _category 产品类别
     * @param _batchId 批次ID
     */
    function registerProduct(
        string calldata _productId,
        string calldata _internalCode,
        string calldata _productName,
        string calldata _productModel,
        string calldata _category,
        uint256 _batchId
    ) external returns (bool) {
        require(bytes(_productId).length > 0, "Product ID cannot be empty");
        require(!products[_productId].isRegistered, "Product already registered");

        products[_productId] = Product({
            productId: _productId,
            internalCode: _internalCode,
            productName: _productName,
            productModel: _productModel,
            category: _category,
            createdAt: block.timestamp,
            batchId: _batchId,
            isRegistered: true,
            registrant: msg.sender
        });

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
     * @dev 批量注册产品
     * @param _productIds 产品ID数组
     * @param _internalCodes 内部编码数组
     * @param _productNames 产品名称数组
     * @param _productModels 产品型号数组
     * @param _categories 产品类别数组
     * @param _batchId 批次ID
     */
    function batchRegisterProducts(
        string[] calldata _productIds,
        string[] calldata _internalCodes,
        string[] calldata _productNames,
        string[] calldata _productModels,
        string[] calldata _categories,
        uint256 _batchId
    ) external returns (bool) {
        require(
            _productIds.length == _internalCodes.length &&
            _productIds.length == _productNames.length &&
            _productIds.length == _productModels.length &&
            _productIds.length == _categories.length,
            "Array length mismatch"
        );
        require(_productIds.length > 0, "Empty array");
        require(_productIds.length <= 100, "Batch size too large (max 100)");

        for (uint256 i = 0; i < _productIds.length; i++) {
            if (!products[_productIds[i]].isRegistered) {
                products[_productIds[i]] = Product({
                    productId: _productIds[i],
                    internalCode: _internalCodes[i],
                    productName: _productNames[i],
                    productModel: _productModels[i],
                    category: _categories[i],
                    createdAt: block.timestamp,
                    batchId: _batchId,
                    isRegistered: true,
                    registrant: msg.sender
                });

                emit ProductRegistered(
                    _productIds[i],
                    _internalCodes[i],
                    _productNames[i],
                    msg.sender,
                    block.timestamp
                );
            }
        }

        batchProductCount[_batchId] += _productIds.length;
        return true;
    }

    // ============ 产品验证 ============

    /**
     * @dev 验证产品真伪
     * @param _productId 产品ID
     * @return isValid 产品是否有效
     * @return productInfo 产品信息
     */
    function verifyProduct(string calldata _productId)
        external
        returns (bool isValid, Product memory productInfo)
    {
        productInfo = products[_productId];
        isValid = productInfo.isRegistered;

        emit ProductVerified(_productId, isValid, msg.sender, block.timestamp);

        return (isValid, productInfo);
    }

    /**
     * @dev 验证产品是否已注册（简化版）
     * @param _productId 产品ID
     */
    function isProductRegistered(string calldata _productId)
        external
        view
        returns (bool)
    {
        return products[_productId].isRegistered;
    }

    // ============ 溯源记录 ============

    /**
     * @dev 添加溯源记录
     * @param _productId 产品ID
     * @param _action 操作类型
     * @param _description 描述
     * @param _location 位置
     * @param _operator 操作人
     * @param _extraData 额外数据
     */
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

    /**
     * @dev 批量添加溯源记录
     * @param _productIds 产品ID数组
     * @param _actions 操作类型数组
     * @param _descriptions 描述数组
     * @param _locations 位置数组
     * @param _operators 操作人数组
     */
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

    /**
     * @dev 获取产品信息
     * @param _productId 产品ID
     */
    function getProductInfo(string calldata _productId)
        external
        view
        returns (Product memory)
    {
        require(products[_productId].isRegistered, "Product not registered");
        return products[_productId];
    }

    /**
     * @dev 获取溯源历史记录数量
     * @param _productId 产品ID
     */
    function getTraceabilityCount(string calldata _productId)
        external
        view
        returns (uint256)
    {
        return traceabilityHistory[_productId].length;
    }

    /**
     * @dev 获取溯源历史记录
     * @param _productId 产品ID
     * @param _startIndex 起始索引
     * @param _limit 限制数量
     */
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

    /**
     * @dev 获取批次产品数量
     * @param _batchId 批次ID
     */
    function getBatchProductCount(uint256 _batchId)
        external
        view
        returns (uint256)
    {
        return batchProductCount[_batchId];
    }

    /**
     * @dev 获取合约版本
     */
    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }
}

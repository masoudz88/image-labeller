export class VirtualListUtil {
    static calculateGridSize(listSize, childSize, childCount) {
        const columnCount = Math.floor(listSize.width / childSize.width);
        const rowCount = Math.ceil(childCount / columnCount);
        return {width: columnCount, height: rowCount};
    }

    static calculateContentSize(listSize, childSize, gridSize) {
        const sizeFromGrid = {
            width: childSize.width * gridSize.width,
            height: childSize.height * gridSize.height
        };

        return {
            width: Math.max(listSize.width, sizeFromGrid.width),
            height: sizeFromGrid.height
        };
    }

    static calculateAnchorPoints(listSize, childSize, childCount) {
        const gridSize = VirtualListUtil.calculateGridSize(listSize, childSize, childCount);
        const contentWrapperSize = VirtualListUtil.calculateContentSize(listSize, childSize, gridSize);
        const horizontalMargin = (contentWrapperSize.width - gridSize.width * childSize.width) / (gridSize.width + 1);

        const anchors = [];
        for (let i = 0; i < childCount; i++) {
            const rowCount = Math.floor(i / gridSize.width);
            const columnCount = i % gridSize.width;

            const anchor = {
                x: rowCount * horizontalMargin + columnCount * childSize.width,
                y: rowCount * childSize.height
            };
            anchors.push(anchor);
        }
        return anchors;
    }
}